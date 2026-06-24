<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Services\TelemetryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LogReaderController extends Controller
{
    public function __construct(
        private readonly TelemetryService $telemetry,
    ) {}

    /**
     * Display a parsed listing of Laravel system logs.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('manage-system');

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

            while (! $file->eof()) {
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
            'logSize' => file_exists($filePath) ? $this->telemetry->formatBytes(filesize($filePath)) : '0 B',
        ]);
    }

    /**
     * Download the raw laravel.log file.
     */
    public function download(Request $request): BinaryFileResponse|RedirectResponse
    {
        Gate::authorize('manage-system');

        $filePath = storage_path('logs/laravel.log');

        if (! file_exists($filePath) || filesize($filePath) === 0) {
            return back()->with('error', 'Log file is empty or does not exist.');
        }

        return response()->download($filePath);
    }

    /**
     * Clear / Empty the laravel.log file.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Gate::authorize('manage-system');

        $filePath = storage_path('logs/laravel.log');

        if (file_exists($filePath)) {
            file_put_contents($filePath, '');
        }

        AuditLog::record(
            $request->user(),
            'system.logs.cleared',
            null,
            'Cleared system application error log file (laravel.log)',
            [],
            []
        );

        return back()->with('success', 'Application log cleared successfully.');
    }
}
