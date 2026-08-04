<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\AccountAccessChanged;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class UserService
{
    public function __construct(
        private readonly AuditService $audit,
    ) {}

    /** @return Collection<int, Role> */
    public function assignableRolesFor(User $actor): Collection
    {
        if ($actor->hasRole('superadmin')) {
            return Role::query()->orderBy('name')->get();
        }

        return Role::query()
            ->whereIn('name', $actor->hasRole('admin') ? ['manager', 'user'] : ['user'])
            ->orderBy('name')
            ->get();
    }

    public function stats(): array
    {
        return [
            'total' => User::count(),
            'admins' => User::whereHas('roles', fn ($query) => $query->whereIn('name', ['superadmin', 'admin']))->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'unverified' => User::whereNull('email_verified_at')->count(),
        ];
    }

    public function create(array $data, User $actor): User
    {
        return DB::transaction(function () use ($data, $actor) {
            $avatar = $this->storeAvatar($data['avatar'] ?? null);

            try {
                $user = User::create([
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'avatar' => $avatar,
                    'email_verified_at' => filter_var($data['email_verified'], FILTER_VALIDATE_BOOLEAN) ? now() : null,
                ]);

                $user->syncRoles($data['roles']);
                $user->notify(new AccountAccessChanged('Your account has been created.'));
                $this->audit->record($actor, 'user.created', $user, "Created user {$user->username}.", [], $this->auditValues($user));

                return $user;
            } catch (\Throwable $e) {
                if ($avatar !== null) {
                    $this->deleteAvatar($avatar);
                }

                throw $e;
            }
        });
    }

    public function update(User $user, array $data, User $actor): User
    {
        return DB::transaction(function () use ($user, $data, $actor) {
            $oldValues = $this->auditValues($user);
            $oldAvatar = null;
            $newAvatar = null;

            if (! empty($data['remove_avatar']) && $user->avatar) {
                $oldAvatar = $user->avatar;
                $user->avatar = null;
            }

            if (! empty($data['avatar'])) {
                $oldAvatar = $user->avatar;
                $newAvatar = $this->storeAvatar($data['avatar']);
                $user->avatar = $newAvatar;
            }

            $user->fill([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
            ]);

            if (! $user->is($actor)) {
                $user->email_verified_at = filter_var($data['email_verified'], FILTER_VALIDATE_BOOLEAN)
                    ? ($user->email_verified_at ?? now())
                    : null;
            }

            if (! empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            try {
                $user->save();
            } catch (\Throwable $e) {
                if ($newAvatar !== null) {
                    $this->deleteAvatar($newAvatar);
                }

                throw $e;
            }

            // Only remove the previous avatar once the new state is persisted.
            if ($oldAvatar !== null && $oldAvatar !== $newAvatar) {
                $this->deleteAvatar($oldAvatar);
            }

            $user->syncRoles($data['roles']);
            $user->notify(new AccountAccessChanged('Your account details or assigned roles were updated.'));
            $this->audit->record($actor, 'user.updated', $user, "Updated user {$user->username}.", $oldValues, $this->auditValues($user));

            return $user;
        });
    }

    public function delete(User $user, User $actor, bool $bulk = false): void
    {
        if ($user->avatar) {
            $this->deleteAvatar($user->avatar);
        }

        $description = $bulk ? "Deleted user {$user->username} via bulk action." : "Deleted user {$user->username}.";
        $this->audit->record($actor, 'user.deleted', $user, $description, $this->auditValues($user));
        $user->delete();
    }

    public function toggleVerification(User $user, User $actor): string
    {
        $user->email_verified_at = $user->email_verified_at ? null : now();
        $user->save();
        $message = $user->email_verified_at
            ? "User {$user->username} successfully verified."
            : "User {$user->username} marked as unverified.";

        $this->audit->record($actor, 'user.verification.toggled', $user, $message, [], ['email_verified_at' => $user->email_verified_at]);

        return $message;
    }

    private function storeAvatar(mixed $avatar): ?string
    {
        if (! $avatar instanceof UploadedFile) {
            return null;
        }

        $detected = (new \finfo(FILEINFO_MIME_TYPE))->file((string) $avatar->getRealPath());
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        $extension = $detected !== false ? ($extensions[$detected] ?? null) : null;

        if ($extension === null) {
            abort(422, 'Unsupported image type.');
        }

        return Storage::url($avatar->storeAs('avatars', uniqid('avatar_').'.'.$extension, 'public'));
    }

    private function deleteAvatar(string $avatar): void
    {
        Storage::disk('public')->delete(str_replace('/storage/', '', $avatar));
    }

    private function auditValues(User $user): array
    {
        return [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->all(),
            'email_verified_at' => $user->email_verified_at,
        ];
    }
}
