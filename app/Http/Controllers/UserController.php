<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use App\Notifications\AccountAccessChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('manage-users');

        $query = User::with('roles');

        // Apply filters if present
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->role($request->input('role'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            if ($request->input('status') === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->input('status') === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        // Apply sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $users = $query->paginate(10)->withQueryString();
        $roles = $this->assignableRolesFor($request->user());

        // Calculate statistics
        $stats = [
            'total' => User::count(),
            'admins' => User::whereHas('roles', fn ($q) => $q->whereIn('name', ['superadmin', 'admin']))->count(),
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'unverified' => User::whereNull('email_verified_at')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search'),
                'role' => $request->input('role'),
                'status' => $request->input('status'),
                'sort' => $request->input('sort'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('manage-users');

        $roles = $this->assignableRolesFor(request()->user());

        return Inertia::render('Admin/Users/CreateEdit', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|lowercase|alpha_dash|max:255|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
            'avatar' => 'nullable|image|max:2048', // max 2MB
        ]);

        $this->authorizeRoleAssignment(request()->user(), $request->input('roles'));

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $avatarPath = Storage::url($path);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $avatarPath,
        ]);

        // Sync roles
        $user->syncRoles($request->input('roles'));
        $user->notify(new AccountAccessChanged('Your account has been created.'));

        AuditLog::record(
            request()->user(),
            'user.created',
            $user,
            "Created user {$user->username}.",
            [],
            ['name' => $user->name, 'username' => $user->username, 'email' => $user->email, 'roles' => $user->getRoleNames()->all()],
        );

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        Gate::authorize('manage-users');

        $this->authorizeTargetUser(request()->user(), $user);

        $user->load('roles');
        $roles = $this->assignableRolesFor(request()->user());

        return Inertia::render('Admin/Users/CreateEdit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        Gate::authorize('manage-users');

        $this->authorizeTargetUser(request()->user(), $user);

        // Inertia multipart/form-data doesn't support PUT directly, so we use POST method spoofing
        // or validate input in POST request.
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'lowercase', 'alpha_dash', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', Rules\Password::defaults()],
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
            'avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'nullable|boolean',
        ]);

        $this->authorizeRoleAssignment(request()->user(), $request->input('roles'));

        $oldValues = [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->all(),
        ];

        if ($request->boolean('remove_avatar') && $user->avatar) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            $user->avatar = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = Storage::url($path);
        }

        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Sync roles
        $user->syncRoles($request->input('roles'));
        $user->notify(new AccountAccessChanged('Your account details or assigned roles were updated.'));

        AuditLog::record(
            request()->user(),
            'user.updated',
            $user,
            "Updated user {$user->username}.",
            $oldValues,
            ['name' => $user->name, 'username' => $user->username, 'email' => $user->email, 'roles' => $user->getRoleNames()->all()],
        );

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        Gate::authorize('manage-users');

        $this->authorizeTargetUser(request()->user(), $user);

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        if ($user->avatar) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        AuditLog::record(
            request()->user(),
            'user.deleted',
            $user,
            "Deleted user {$user->username}.",
            ['name' => $user->name, 'username' => $user->username, 'email' => $user->email, 'roles' => $user->getRoleNames()->all()],
        );

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function toggleVerification(Request $request, User $user)
    {
        Gate::authorize('manage-users');
        $this->authorizeTargetUser($request->user(), $user);

        if ($user->email_verified_at) {
            $user->email_verified_at = null;
            $message = "User {$user->username} marked as unverified.";
        } else {
            $user->email_verified_at = now();
            $message = "User {$user->username} successfully verified.";
        }

        $user->save();

        AuditLog::record(
            $request->user(),
            'user.verification.toggled',
            $user,
            $message,
            [],
            ['email_verified_at' => $user->email_verified_at]
        );

        return back()->with('success', $message);
    }

    public function bulkDestroy(Request $request)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id',
        ]);

        $ids = $request->input('ids');
        $actor = $request->user();

        // Prevent self-deletion
        if (in_array($actor->id, $ids)) {
            return back()->with('error', 'You cannot delete yourself in bulk operations.');
        }

        $users = User::whereIn('id', $ids)->get();
        foreach ($users as $target) {
            $this->authorizeTargetUser($actor, $target);
        }

        $deletedCount = 0;
        foreach ($users as $user) {
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            
            AuditLog::record(
                $actor,
                'user.deleted',
                $user,
                "Deleted user {$user->username} via bulk action.",
                ['name' => $user->name, 'username' => $user->username, 'email' => $user->email, 'roles' => $user->getRoleNames()->all()],
                []
            );

            $user->delete();
            $deletedCount++;
        }

        return back()->with('success', "Successfully deleted {$deletedCount} users.");
    }

    /** @return \Illuminate\Support\Collection<int, Role> */
    private function assignableRolesFor(User $actor): \Illuminate\Support\Collection
    {
        if ($actor->hasRole('superadmin')) {
            return Role::query()->orderBy('name')->get();
        }

        return Role::query()
            ->whereIn('name', $actor->hasRole('admin') ? ['manager', 'user'] : ['user'])
            ->orderBy('name')
            ->get();
    }

    private function authorizeTargetUser(User $actor, User $target): void
    {
        if ($actor->hasRole('superadmin')) {
            return;
        }

        abort_if($actor->is($target), 403, 'You cannot change your own access level.');

        $allowedRoles = $this->assignableRolesFor($actor)->pluck('name')->all();
        abort_if($target->getRoleNames()->diff($allowedRoles)->isNotEmpty(), 403, 'You cannot manage this user.');
    }

    /** @param array<int, string> $roles */
    private function authorizeRoleAssignment(User $actor, array $roles): void
    {
        if ($actor->hasRole('superadmin')) {
            return;
        }

        $allowedRoles = $this->assignableRolesFor($actor)->pluck('name')->all();
        abort_if(array_diff($roles, $allowedRoles) !== [], 403, 'You cannot assign one or more selected roles.');
    }
}
