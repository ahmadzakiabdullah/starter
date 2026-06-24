<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->canManageRoles($user);
    }

    public function create(User $user): bool
    {
        return $this->canManageRoles($user);
    }

    public function update(User $user, Role $role): bool
    {
        return $this->canManageRoles($user);
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->canManageRoles($user);
    }

    private function canManageRoles(User $user): bool
    {
        return $user->getAllPermissions()->contains('name', 'manage-roles');
    }
}
