<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Permissions that grant administrative powers. Only the superadmin
     * may assign or remove them.
     */
    private const PRIVILEGED_PERMISSIONS = [
        'manage-users',
        'manage-roles',
        'manage-settings',
        'manage-system',
        'manage-announcements',
        'manage-changelog',
        'manage-media',
    ];

    /**
     * Determine whether the current user may modify the given role with the
     * given permission list. Non-superadmins are blocked from touching
     * privileged roles or granting privileged permissions.
     *
     * @param  array<int, string>  $permissions
     */
    private function canManageRole(Role $role, array $permissions): bool
    {
        if (auth()->user()?->hasRole('superadmin')) {
            return true;
        }

        if (in_array($role->name, ['superadmin', 'admin', 'user'], true)) {
            return false;
        }

        if (count(array_intersect($permissions, self::PRIVILEGED_PERMISSIONS)) > 0) {
            return false;
        }

        $current = $role->getPermissionNames()->all();

        return count(array_intersect($current, self::PRIVILEGED_PERMISSIONS)) === 0;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('manage-roles');

        $roles = Role::with('permissions')->withCount('users')->get();
        $permissions = Permission::all();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        Gate::authorize('manage-roles');

        $permissions = $request->input('permissions', []);

        if (! $this->canManageRole(new Role(['name' => $request->name]), $permissions)) {
            return redirect()->back()->with('error', 'You are not allowed to create a role with administrative permissions.');
        }

        $role = Role::create([
            'name' => strtolower($request->name),
            'guard_name' => 'web',
        ]);

        if (filled($permissions)) {
            $role->syncPermissions($permissions);
        }

        AuditLog::record(
            $request->user(),
            'role.created',
            $role,
            "Created role {$role->name}.",
            [],
            ['name' => $role->name, 'permissions' => $role->getPermissionNames()->all()],
        );

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        Gate::authorize('manage-roles');

        $oldValues = [
            'name' => $role->name,
            'permissions' => $role->getPermissionNames()->all(),
        ];

        $permissions = $request->input('permissions', []);

        if (! $this->canManageRole($role, $permissions)) {
            return redirect()->back()->with('error', 'You are not allowed to modify this role or its permissions.');
        }

        // Prevent modifying the superadmin role name to prevent breaking the system.
        if ($role->name !== 'superadmin') {
            $role->name = strtolower($request->name);
        }

        $role->save();

        if (filled($permissions)) {
            $role->syncPermissions($permissions);
        }

        AuditLog::record(
            $request->user(),
            'role.updated',
            $role,
            "Updated role {$role->name}.",
            $oldValues,
            ['name' => $role->name, 'permissions' => $role->getPermissionNames()->all()],
        );

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Role $role)
    {
        Gate::authorize('manage-roles');

        if ($role->name === 'superadmin') {
            return redirect()->back()->with('error', 'The superadmin role cannot be deleted.');
        }

        if ($role->name === 'user') {
            return redirect()->back()->with('error', 'The default user role cannot be deleted.');
        }

        AuditLog::record(
            $request->user(),
            'role.deleted',
            $role,
            "Deleted role {$role->name}.",
            ['name' => $role->name, 'permissions' => $role->getPermissionNames()->all()],
        );

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }

    public function storePermission(Request $request)
    {
        Gate::authorize('manage-roles');

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:permissions,name',
                'regex:/^[a-z0-9_-]+$/',
            ],
        ], [
            'name.regex' => 'The permission name must only contain lowercase letters, numbers, hyphens, and underscores.',
        ]);

        $permission = Permission::create([
            'name' => strtolower($request->name),
            'guard_name' => 'web',
        ]);

        AuditLog::record(
            $request->user(),
            'permission.created',
            null,
            "Created permission {$permission->name}.",
            [],
            ['name' => $permission->name]
        );

        return redirect()->route('roles.index')->with('success', 'Permission created successfully.');
    }

    public function destroyPermission(Request $request, Permission $permission)
    {
        Gate::authorize('manage-roles');

        $systemPermissions = ['manage-users', 'manage-roles'];
        if (in_array($permission->name, $systemPermissions)) {
            return redirect()->back()->with('error', 'Core system permissions cannot be deleted.');
        }

        AuditLog::record(
            $request->user(),
            'permission.deleted',
            null,
            "Deleted permission {$permission->name}.",
            ['name' => $permission->name],
            []
        );

        $permission->delete();

        return redirect()->route('roles.index')->with('success', 'Permission deleted successfully.');
    }
}
