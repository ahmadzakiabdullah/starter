<?php

namespace App\Http\Controllers;

use App\Services\TelemetryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HealthMonitorController extends Controller
{
    public function __construct(
        private readonly TelemetryService $telemetry,
    ) {}

    /**
     * Display the system health dashboard.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('manage-system');

        $metrics = $this->telemetry->getMetrics();
        $systemStats = $this->buildSystemStats($metrics);
        $laravelStats = $this->getLaravelStats();
        $dbStats = $this->getDatabaseStats();

        return Inertia::render('Admin/Health/Index', [
            'systemStats' => $systemStats,
            'laravelStats' => $laravelStats,
            'dbStats' => $dbStats,
        ]);
    }

    /**
     * Build system stats array from TelemetryService metrics.
     */
    private function buildSystemStats(array $metrics): array
    {
        $serverIp = $_SERVER['SERVER_ADDR'] ?? '127.0.0.1';
        if ($serverIp === '::1' || $serverIp === '') {
            $serverIp = '127.0.0.1';
        }

        return [
            'cpu' => [
                'usage' => $metrics['cpu_percent'],
            ],
            'ram' => $metrics['ram'],
            'disk' => $metrics['disk'],
            'info' => [
                'os' => PHP_OS.' ('.php_uname('r').')',
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_ip' => $serverIp,
                'server_time' => now()->toDateTimeString(),
            ],
        ];
    }

    /**
     * Get Laravel Specific Status.
     */
    private function getLaravelStats(): array
    {
        $queueConnection = config('queue.default', 'sync');
        $debugMode = config('app.debug', false);
        $environment = config('app.env', 'production');

        $configCached = app()->configurationIsCached();
        $routesCached = app()->routesAreCached();
        $eventsCached = false;
        if (method_exists(app(), 'eventsAreCached')) {
            $eventsCached = app()->eventsAreCached();
        }

        $pendingJobs = 0;
        if ($queueConnection === 'database') {
            try {
                $pendingJobs = DB::table('jobs')->count();
            } catch (\Exception $e) {
                $pendingJobs = 0;
            }
        }

        return [
            'environment' => $environment,
            'debug_mode' => $debugMode,
            'queue_connection' => $queueConnection,
            'pending_jobs' => $pendingJobs,
            'caches' => [
                'config' => $configCached,
                'routes' => $routesCached,
                'events' => $eventsCached,
            ],
        ];
    }

    /**
     * Get Database Specific Stats.
     */
    private function getDatabaseStats(): array
    {
        $driver = DB::connection()->getDriverName();
        $dbName = DB::connection()->getDatabaseName();
        $tableCount = 0;
        $sizeBytes = 0;
        $status = 'Connected';

        try {
            DB::connection()->getPdo();

            if ($driver === 'sqlite') {
                if ($dbName !== ':memory:' && file_exists($dbName)) {
                    $sizeBytes = filesize($dbName);
                }
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table'");
                $tableCount = count($tables);
            } elseif ($driver === 'mysql') {
                $tables = DB::select('SHOW TABLES');
                $tableCount = count($tables);

                $sizeQuery = DB::select('
                    SELECT SUM(data_length + index_length) AS size 
                    FROM information_schema.TABLES 
                    WHERE table_schema = ?
                ', [$dbName]);

                if (! empty($sizeQuery)) {
                    $sizeBytes = (int) $sizeQuery[0]->size;
                }
            } else {
                $status = 'Connected (Unsupported size check)';
            }
        } catch (\Exception $e) {
            $status = 'Connection Error: '.$e->getMessage();
        }

        return [
            'driver' => $driver,
            'database_name' => basename($dbName),
            'table_count' => $tableCount,
            'size' => $this->telemetry->formatBytes($sizeBytes),
            'size_bytes' => $sizeBytes,
            'status' => $status,
        ];
    }
}
