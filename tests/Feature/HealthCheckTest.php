<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_reports_healthy_dependencies(): void
    {
        $this->getJson(route('api.health'))
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonStructure([
                'status',
                'checks' => [
                    'database' => ['status', 'driver'],
                    'cache' => ['status', 'driver'],
                    'queue' => ['status', 'driver'],
                    'disk' => ['status', 'free_bytes'],
                ],
            ]);
    }
}
