<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $this->canManageUsers($actor);
    }

    public function create(User $actor): bool
    {
        return $this->canManageUsers($actor);
    }

    public function update(User $actor, User $user): bool
    {
        return $this->canManageUsers($actor);
    }

    public function delete(User $actor, User $user): bool
    {
        return $this->canManageUsers($actor);
    }

    private function canManageUsers(User $user): bool
    {
        return $user->getAllPermissions()->contains('name', 'manage-users');
    }
}
