<?php

namespace Tests\Feature\Jobs;

use App\Jobs\CreateBackupJob;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery\MockInterface;
use Tests\TestCase;

class CreateBackupJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_backup_and_records_audit_log_successfully(): void
    {
        $actor = User::factory()->create();
        $filename = 'backup_2023_10_26_120000.sqlite';

        /** @var BackupService|MockInterface $backupService */
        $backupService = $this->mock(BackupService::class, function (MockInterface $mock) use ($filename) {
            $mock->shouldReceive('create')
                ->once()
                ->andReturn($filename);
        });

        Log::shouldReceive('info')
            ->once()
            ->with('Database backup created via queue', ['filename' => $filename]);

        Log::shouldReceive('error')->never();

        $job = new CreateBackupJob($actor);
        $job->handle($backupService);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'event' => 'backup.created',
            'description' => "Created database backup archive: {$filename}",
        ]);

        $auditLog = AuditLog::first();
        $this->assertNotNull($auditLog);
        $this->assertEquals(['filename' => $filename, 'source' => 'queue'], $auditLog->new_values);
    }

    public function test_it_logs_error_if_backup_creation_fails(): void
    {
        $actor = User::factory()->create();
        $errorMessage = 'Could not create the backup directory.';

        /** @var BackupService|MockInterface $backupService */
        $backupService = $this->mock(BackupService::class, function (MockInterface $mock) use ($errorMessage) {
            $mock->shouldReceive('create')
                ->once()
                ->andThrow(new \RuntimeException($errorMessage));
        });

        Log::shouldReceive('info')->never();

        Log::shouldReceive('error')
            ->once()
            ->with('Database backup failed', [
                'error' => $errorMessage,
                'actor' => $actor->id,
            ]);

        $job = new CreateBackupJob($actor);
        $job->handle($backupService);

        $this->assertDatabaseEmpty('audit_logs');
    }

    public function test_it_handles_null_actor_on_failure(): void
    {
        $errorMessage = 'Could not create the backup directory.';

        /** @var BackupService|MockInterface $backupService */
        $backupService = $this->mock(BackupService::class, function (MockInterface $mock) use ($errorMessage) {
            $mock->shouldReceive('create')
                ->once()
                ->andThrow(new \RuntimeException($errorMessage));
        });

        Log::shouldReceive('info')->never();

        Log::shouldReceive('error')
            ->once()
            ->with('Database backup failed', [
                'error' => $errorMessage,
                'actor' => null,
            ]);

        $job = new CreateBackupJob(null);
        $job->handle($backupService);

        $this->assertDatabaseEmpty('audit_logs');
    }
}
