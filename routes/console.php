<?php

use App\Models\AuditLog;
use App\Services\BackupService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('backup:run', function () {
    try {
        $backups = app(BackupService::class);
        $filename = $backups->create();

        AuditLog::record(
            null,
            'backup.created',
            null,
            "[Scheduled] Created database backup archive: {$filename}",
            [],
            ['filename' => $filename, 'source' => 'schedule']
        );

        $this->info("Backup created: {$filename}");
    } catch (Exception $e) {
        $this->error("Backup failed: {$e->getMessage()}");
    }
})->purpose('Create a database backup');

Schedule::command('backup:run')->daily()->at('02:00');
