<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the application dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = $this->getAdminStats($request);
        $recentActivity = $this->getRecentActivity();
        $telemetry = $this->getTelemetryData();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'telemetry' => $telemetry,
        ]);
    }

    /**
     * Gather system wide statistics.
     */
    private function getAdminStats(Request $request): array
    {
        $backupDir = storage_path('app/backups');
        $backupsCount = 0;
        if (file_exists($backupDir)) {
            $backupsCount = count(glob($backupDir . '/*.{sql,sqlite}', GLOB_BRACE));
        }

        return [
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'total_backups' => $backupsCount,
            'unread_notifications' => $request->user()->unreadNotifications()->count(),
        ];
    }

    /**
     * Get the latest 5 audit log entries.
     */
    private function getRecentActivity(): array
    {
        return AuditLog::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'description' => $log->description,
                    'actor' => $log->user ? $log->user->name : 'System',
                    'created_at' => $log->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    /**
     * Get host telemetry (cached for 10 seconds to optimize page loads).
     */
    private function getTelemetryData(): array
    {
        return cache()->remember('dashboard.telemetry', 10, function () {
            // 1. CPU Usage
            $cpuUsage = 12; // default mock fallback
            if (stristr(PHP_OS, 'win')) {
                $cpuOutput = shell_exec('powershell -Command "(Get-CimInstance Win32_Processor).LoadPercentage"');
                if ($cpuOutput !== null && is_numeric(trim($cpuOutput))) {
                    $cpuUsage = (int) trim($cpuOutput);
                }
            } else {
                if (file_exists('/proc/stat')) {
                    if (function_exists('sys_getloadavg')) {
                        $loads = sys_getloadavg();
                        $cores = 1;
                        $cpuinfo = shell_exec('nproc');
                        if ($cpuinfo !== null && is_numeric(trim($cpuinfo))) {
                            $cores = (int) trim($cpuinfo);
                        }
                        $cpuUsage = min(100, (int)(($loads[0] / $cores) * 100));
                    }
                }
            }

            // 2. RAM Usage
            $totalRam = 0;
            $freeRam = 0;
            if (stristr(PHP_OS, 'win')) {
                $memOutput = shell_exec('powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json"');
                $memData = json_decode($memOutput, true);
                if ($memData) {
                    $totalRam = $memData['TotalVisibleMemorySize'] * 1024; // KB to Bytes
                    $freeRam = $memData['FreePhysicalMemory'] * 1024; // KB to Bytes
                }
            } else {
                if (file_exists('/proc/meminfo')) {
                    $data = file_get_contents('/proc/meminfo');
                    $meminfo = [];
                    foreach (explode("\n", $data) as $line) {
                        if (empty($line) || !str_contains($line, ':')) continue;
                        list($key, $val) = explode(":", $line, 2);
                        $meminfo[trim($key)] = (int) preg_replace('/\D/', '', $val) * 1024;
                    }
                    $totalRam = $meminfo['MemTotal'] ?? 0;
                    $freeRam = $meminfo['MemAvailable'] ?? ($meminfo['MemFree'] ?? 0);
                }
            }

            if ($totalRam === 0) {
                $totalRam = 8 * 1024 * 1024 * 1024; // Mock 8GB
                $freeRam = 5 * 1024 * 1024 * 1024; // Mock 5GB
            }

            $usedRam = $totalRam - $freeRam;
            $ramPercent = round(($usedRam / $totalRam) * 100, 1);

            // 3. Disk Usage
            $diskPath = base_path();
            $diskTotal = disk_total_space($diskPath) ?: 1;
            $diskFree = disk_free_space($diskPath) ?: 0;
            $diskUsed = $diskTotal - $diskFree;
            $diskPercent = round(($diskUsed / $diskTotal) * 100, 1);

            return [
                'cpu_percent' => $cpuUsage,
                'ram_percent' => $ramPercent,
                'disk_percent' => $diskPercent,
                'caches' => [
                    'config' => app()->configurationIsCached(),
                    'routes' => app()->routesAreCached(),
                    'debug' => config('app.debug', false),
                ]
            ];
        });
    }
}
