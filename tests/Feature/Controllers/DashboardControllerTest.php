<?php

namespace Tests\Feature\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\TelemetryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_displays_dashboard_with_mocked_telemetry(): void
    {
        // 1. Setup Data
        $user = User::factory()->create();
        AuditLog::factory()->create(['user_id' => $user->id]);

        // 2. Mock the TelemetryService
        $this->mock(TelemetryService::class, function ($mock) {
            $mock->shouldReceive('getMetrics')
                ->once()
                ->andReturn([
                    'cpu_percent' => 42,
                    'ram' => [
                        'percent' => 60,
                        'total' => '16 GB',
                        'used' => '9.6 GB',
                        'free' => '6.4 GB',
                    ],
                    'disk' => [
                        'percent' => 80,
                        'total' => '100 GB',
                        'used' => '80 GB',
                        'free' => '20 GB',
                    ],
                ]);
        });

        // 3. Act & Assert
        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->has('stats', fn ($page) => $page
                    ->has('total_users')
                    ->has('total_roles')
                    ->has('total_backups')
                    ->has('unread_notifications')
                )
                ->has('recentActivity', 1)
                ->has('telemetry', fn ($page) => $page
                    ->where('cpu_percent', 42)
                    ->where('ram_percent', 60)
                    ->where('disk_percent', 80)
                    ->has('caches', fn ($page) => $page
                        ->has('config')
                        ->has('routes')
                        ->has('debug')
                    )
                )
            );
    }
}
