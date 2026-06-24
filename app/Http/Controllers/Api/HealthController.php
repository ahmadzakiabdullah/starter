<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->databaseStatus(),
            'cache' => $this->cacheStatus(),
            'queue' => $this->queueStatus(),
            'disk' => $this->diskStatus(),
        ];
        $healthy = collect($checks)->every(fn (array $check): bool => $check['status'] === 'ok');

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    private function databaseStatus(): array
    {
        try {
            DB::select('SELECT 1');

            return ['status' => 'ok', 'driver' => DB::connection()->getDriverName()];
        } catch (\Throwable) {
            return ['status' => 'failed'];
        }
    }

    private function cacheStatus(): array
    {
        try {
            Cache::store()->get('health-check');

            return ['status' => 'ok', 'driver' => config('cache.default')];
        } catch (\Throwable) {
            return ['status' => 'failed'];
        }
    }

    private function queueStatus(): array
    {
        return ['status' => 'ok', 'driver' => config('queue.default')];
    }

    private function diskStatus(): array
    {
        $freeBytes = disk_free_space(storage_path());

        return $freeBytes === false
            ? ['status' => 'failed']
            : ['status' => 'ok', 'free_bytes' => (int) $freeBytes];
    }
}
