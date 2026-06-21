<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
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
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('manage-roles');

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array'
        ]);

        $role = Role::create([
            'name' => strtolower($request->name),
            'guard_name' => 'web'
        ]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
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
    public function update(Request $request, Role $role)
    {
        Gate::authorize('manage-roles');

        $oldValues = [
            'name' => $role->name,
            'permissions' => $role->getPermissionNames()->all(),
        ];

        // Prevent modifying the superadmin role name to prevent breaking the system
        if ($role->name === 'superadmin') {
            $request->validate([
                'permissions' => 'nullable|array'
            ]);
        } else {
            $request->validate([
                'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
                'permissions' => 'nullable|array'
            ]);
            $role->name = strtolower($request->name);
        }

        $role->save();

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
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
    public function destroy(Role $role)
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
                'regex:/^[a-z0-9_-]+$/'
            ]
        ], [
            'name.regex' => 'The permission name must only contain lowercase letters, numbers, hyphens, and underscores.'
        ]);

        $permission = Permission::create([
            'name' => strtolower($request->name),
            'guard_name' => 'web'
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
