<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('superadmin');
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $this->viewAny($user);
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $this->viewAny($user);
    }
}
