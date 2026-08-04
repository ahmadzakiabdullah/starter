<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\BackupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateBackupJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        private readonly ?int $actorId = null,
    ) {}

    public function handle(BackupService $backups): void
    {
        try {
            $filename = $backups->create();

            AuditLog::record(
                $this->actorId !== null ? User::find($this->actorId) : null,
                'backup.created',
                null,
                "Created database backup archive: {$filename}",
                [],
                ['filename' => $filename, 'source' => 'queue']
            );

            Log::info('Database backup created via queue', ['filename' => $filename]);
        } catch (\Exception $e) {
            Log::error('Database backup failed', [
                'error' => $e->getMessage(),
                'actor' => $this->actorId,
            ]);
        }
    }
}
