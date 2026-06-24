<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

class SettingsPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('superadmin');
    }

    public function update(User $user, ?Setting $setting = null): bool
    {
        return $this->viewAny($user);
    }
}
