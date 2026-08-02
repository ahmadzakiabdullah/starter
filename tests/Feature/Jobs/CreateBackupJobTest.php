<?php

namespace Tests\Feature\Jobs;

use App\Jobs\CreateBackupJob;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\BackupService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery\MockInterface;
use Tests\TestCase;

class CreateBackupJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_backup_successfully_and_logs_info(): void
    {
        $user = User::factory()->create();
        $filename = 'backup-2023-10-27.zip';

        // Mock the BackupService to return a specific filename
        $this->mock(BackupService::class, function (MockInterface $mock) use ($filename) {
            $mock->shouldReceive('create')->once()->andReturn($filename);
        });

        // Spy on the Log facade to assert info was called
        Log::spy();

        // Dispatch the job
        $job = new CreateBackupJob($user);
        $job->handle(app(BackupService::class));

        // Assert AuditLog was created
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'event' => 'backup.created',
            'description' => "Created database backup archive: {$filename}",
        ]);

        // Assert Log::info was called
        Log::shouldHaveReceived('info')
            ->once()
            ->with('Database backup created via queue', ['filename' => $filename]);
    }

    public function test_it_logs_error_when_backup_fails(): void
    {
        $user = User::factory()->create();
        $exceptionMessage = 'Failed to connect to storage';

        // Mock the BackupService to throw an exception
        $this->mock(BackupService::class, function (MockInterface $mock) use ($exceptionMessage) {
            $mock->shouldReceive('create')->once()->andThrow(new Exception($exceptionMessage));
        });

        // Spy on the Log facade to assert error was called
        Log::spy();

        // Dispatch the job
        $job = new CreateBackupJob($user);
        $job->handle(app(BackupService::class));

        // Assert Log::error was called
        Log::shouldHaveReceived('error')
            ->once()
            ->with('Database backup failed', [
                'error' => $exceptionMessage,
                'actor' => $user->id,
            ]);

        // Assert no audit log was created
        $this->assertDatabaseCount('audit_logs', 0);
    }
}
