<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LogReaderController extends Controller
{
    /**
     * Display a parsed listing of Laravel system logs.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $filePath = storage_path('logs/laravel.log');
        $logs = [];

        if (file_exists($filePath)) {
            // Memory safe reading (SplFileObject)
            $file = new \SplFileObject($filePath, 'r');
            $file->seek(PHP_INT_MAX);
            $totalLines = $file->key();
            
            // Read last 1200 lines to capture multiple logs with stack traces
            $startLine = max(0, $totalLines - 1200);
            $file->seek($startLine);

            $currentLog = null;

            while (!$file->eof()) {
                $line = $file->current();
                $file->next();

                if ($line === null || $line === '') {
                    continue;
                }

                // Match Laravel log line start: [2026-06-21 10:00:00] local.ERROR: Message
                if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)/', $line, $matches)) {
                    if ($currentLog) {
                        $logs[] = $currentLog;
                    }

                    $currentLog = [
                        'timestamp' => $matches[1],
                        'env' => $matches[2],
                        'level' => strtoupper($matches[3]),
                        'message' => trim($matches[4]),
                        'stack' => '',
                    ];
                } else {
                    if ($currentLog) {
                        $currentLog['stack'] .= $line;
                    }
                }
            }

            if ($currentLog) {
                $logs[] = $currentLog;
            }

            // Show newest log entries first
            $logs = array_reverse($logs);
        }

        return Inertia::render('Admin/Logs/Index', [
            'logs' => array_slice($logs, 0, 100), // Return latest 100 parsed entries
            'logSize' => file_exists($filePath) ? $this->formatBytes(filesize($filePath)) : '0 B',
        ]);
    }

    /**
     * Download the raw laravel.log file.
     */
    public function download(Request $request): BinaryFileResponse|RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $filePath = storage_path('logs/laravel.log');

        if (!file_exists($filePath) || filesize($filePath) === 0) {
            return back()->with('error', 'Log file is empty or does not exist.');
        }

        return response()->download($filePath);
    }

    /**
     * Clear / Empty the laravel.log file.
     */
    public function destroy(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $filePath = storage_path('logs/laravel.log');

        if (file_exists($filePath)) {
            file_put_contents($filePath, '');
        }

        AuditLog::record(
            $request->user(),
            'system.logs.cleared',
            null,
            "Cleared system application error log file (laravel.log)",
            [],
            []
        );

        return back()->with('success', 'Application log cleared successfully.');
    }

    /**
     * Helper to format file sizes.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
