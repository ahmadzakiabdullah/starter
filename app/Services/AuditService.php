<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    public function record(?User $actor, string $event, ?Model $subject, string $description, array $oldValues = [], array $newValues = []): void
    {
        AuditLog::record($actor, $event, $subject, $description, $oldValues, $newValues);
    }
}
