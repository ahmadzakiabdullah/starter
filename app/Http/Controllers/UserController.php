<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $users,
    ) {}

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
        $roles = $this->users->assignableRolesFor($request->user());
        $stats = $this->users->stats();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search'),
                'role' => $request->input('role'),
                'status' => $request->input('status'),
                'sort' => $request->input('sort'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('manage-users');

        $roles = $this->users->assignableRolesFor(request()->user());

        return Inertia::render('Admin/Users/CreateEdit', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        Gate::authorize('manage-users');

        $this->authorizeRoleAssignment(request()->user(), $request->input('roles'));

        $this->users->create($request->validated(), $request->user());

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
        $roles = $this->users->assignableRolesFor(request()->user());

        return Inertia::render('Admin/Users/CreateEdit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        Gate::authorize('manage-users');

        $this->authorizeTargetUser(request()->user(), $user);

        $this->authorizeRoleAssignment(request()->user(), $request->input('roles'));

        $this->users->update($user, $request->validated(), $request->user());

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

        $this->users->delete($user, request()->user());

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function toggleVerification(Request $request, User $user)
    {
        Gate::authorize('manage-users');
        $this->authorizeTargetUser($request->user(), $user);

        $message = $this->users->toggleVerification($user, $request->user());

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

        foreach ($users as $user) {
            $this->users->delete($user, $actor, true);
        }

        return back()->with('success', "Successfully deleted {$users->count()} users.");
    }

    private function authorizeTargetUser(User $actor, User $target): void
    {
        if ($actor->hasRole('superadmin')) {
            return;
        }

        abort_if($actor->is($target), 403, 'You cannot change your own access level.');

        $allowedRoles = $this->users->assignableRolesFor($actor)->pluck('name')->all();
        abort_if($target->getRoleNames()->diff($allowedRoles)->isNotEmpty(), 403, 'You cannot manage this user.');
    }

    /** @param array<int, string> $roles */
    private function authorizeRoleAssignment(User $actor, array $roles): void
    {
        if ($actor->hasRole('superadmin')) {
            return;
        }

        $allowedRoles = $this->users->assignableRolesFor($actor)->pluck('name')->all();
        abort_if(array_diff($roles, $allowedRoles) !== [], 403, 'You cannot assign one or more selected roles.');
    }
}
