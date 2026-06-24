<?php

namespace App\Policies;

use App\Models\Changelog;
use App\Models\User;

class ChangelogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('superadmin');
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Changelog $changelog): bool
    {
        return $this->viewAny($user);
    }

    public function delete(User $user, Changelog $changelog): bool
    {
        return $this->viewAny($user);
    }
}
