<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class TelemetryService
{
    /**
     * Get system telemetry data (CPU, RAM, Disk).
     * Cached for 15 seconds to prevent repeated system calls.
     */
    public function getMetrics(): array
    {
        return Cache::remember('telemetry.metrics', 15, function () {
            return [
                'cpu_percent' => $this->getCpuUsage(),
                'ram' => $this->getRamUsage(),
                'disk' => $this->getDiskUsage(),
            ];
        });
    }

    /**
     * Get CPU usage percentage.
     * Uses safe, read-only system calls with no user input.
     */
    private function getCpuUsage(): int
    {
        $cpuUsage = 0;

        try {
            if ($this->isWindows()) {
                $output = @shell_exec('powershell -NoProfile -Command "(Get-CimInstance Win32_Processor).LoadPercentage"');
                if ($output !== null && is_numeric(trim($output))) {
                    $cpuUsage = (int) trim($output);
                }
            } else {
                if (function_exists('sys_getloadavg')) {
                    $loads = sys_getloadavg();
                    $cores = $this->getCpuCoreCount();
                    $cpuUsage = min(100, (int) (($loads[0] / $cores) * 100));
                }
            }
        } catch (\Throwable) {
            // Silently fall back to 0
        }

        return $cpuUsage;
    }

    /**
     * Get RAM usage stats.
     */
    private function getRamUsage(): array
    {
        $totalRam = 0;
        $freeRam = 0;

        try {
            if ($this->isWindows()) {
                $output = @shell_exec('powershell -NoProfile -Command "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json"');
                $memData = json_decode((string) $output, true);
                if ($memData) {
                    $totalRam = ($memData['TotalVisibleMemorySize'] ?? 0) * 1024;
                    $freeRam = ($memData['FreePhysicalMemory'] ?? 0) * 1024;
                }
            } else {
                if (file_exists('/proc/meminfo')) {
                    $data = file_get_contents('/proc/meminfo');
                    $meminfo = [];
                    foreach (explode("\n", $data) as $line) {
                        if (empty($line) || ! str_contains($line, ':')) {
                            continue;
                        }
                        [$key, $val] = explode(':', $line, 2);
                        $meminfo[trim($key)] = (int) preg_replace('/\D/', '', $val) * 1024;
                    }
                    $totalRam = $meminfo['MemTotal'] ?? 0;
                    $freeRam = $meminfo['MemAvailable'] ?? ($meminfo['MemFree'] ?? 0);
                }
            }
        } catch (\Throwable) {
            // Silently fall back
        }

        // Fallback if detection failed
        if ($totalRam === 0) {
            $totalRam = 8 * 1024 * 1024 * 1024; // Mock 8GB
            $freeRam = 5 * 1024 * 1024 * 1024;  // Mock 5GB
        }

        $usedRam = $totalRam - $freeRam;
        $percent = $totalRam > 0 ? round(($usedRam / $totalRam) * 100, 1) : 0;

        return [
            'total' => $this->formatBytes($totalRam),
            'used' => $this->formatBytes($usedRam),
            'free' => $this->formatBytes($freeRam),
            'percent' => $percent,
        ];
    }

    /**
     * Get disk usage stats.
     */
    private function getDiskUsage(): array
    {
        $diskPath = base_path();
        $diskTotal = disk_total_space($diskPath) ?: 1;
        $diskFree = disk_free_space($diskPath) ?: 0;
        $diskUsed = $diskTotal - $diskFree;
        $diskPercent = round(($diskUsed / $diskTotal) * 100, 1);

        return [
            'total' => $this->formatBytes($diskTotal),
            'used' => $this->formatBytes($diskUsed),
            'free' => $this->formatBytes($diskFree),
            'percent' => $diskPercent,
        ];
    }

    /**
     * Get CPU core count (Linux only).
     */
    private function getCpuCoreCount(): int
    {
        if ($this->isWindows()) {
            return 1;
        }

        try {
            $output = @shell_exec('nproc');
            if ($output !== null && is_numeric(trim($output))) {
                return (int) trim($output);
            }
        } catch (\Throwable) {
            // fallback
        }

        return 1;
    }

    private function isWindows(): bool
    {
        return stristr(PHP_OS, 'win') !== false;
    }

    /**
     * Format bytes into human-readable size string.
     */
    public function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision).' '.$units[$pow];
    }
}
