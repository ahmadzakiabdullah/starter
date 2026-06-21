<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    /**
     * Display a listing of database backups.
     */
    public function index(Request $request): Response
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $backupDir = storage_path('app/backups');
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $files = glob($backupDir . '/*.{sql,sqlite}', GLOB_BRACE);
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $backups[] = [
                'filename' => $filename,
                'size' => $this->formatBytes(filesize($file)),
                'created_at' => date('Y-m-d H:i:s', filemtime($file)),
            ];
        }

        // Sort backups by creation time descending
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Trigger a database backup.
     */
    public function create(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        try {
            $backupDir = storage_path('app/backups');
            if (!file_exists($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $driver = DB::connection()->getDriverName();
            
            // Fallback dump for sqlite (highly useful for local PHPUnit tests!)
            if ($driver === 'sqlite') {
                $dbPath = DB::connection()->getDatabaseName();
                if ($dbPath === ':memory:') {
                    return back()->with('error', 'Backup is not supported for in-memory SQLite databases.');
                }
                $filename = 'backup_' . now()->format('Y_m_d_His') . '.sqlite';
                copy($dbPath, $backupDir . '/' . $filename);
            } else {
                $tables = collect(DB::select('SHOW TABLES'))->map(fn($t) => current((array)$t))->all();
                $sqlDump = "-- Database Backup\n-- Connection: {$driver}\n-- Date: " . now()->toDateTimeString() . "\n\n";

                foreach ($tables as $table) {
                    $createSql = DB::select("SHOW CREATE TABLE `{$table}`");
                    $createSqlArray = (array)$createSql[0];
                    $sqlDump .= $createSqlArray['Create Table'] . ";\n\n";

                    $rows = DB::table($table)->get();
                    foreach ($rows as $row) {
                        $rowArray = (array)$row;
                        $rowValues = array_map(function ($val) {
                            if (is_null($val)) {
                                return 'NULL';
                            }
                            return "'" . addslashes($val) . "'";
                        }, $rowArray);
                        
                        $sqlDump .= "INSERT INTO `{$table}` (`" . implode('`,`', array_keys($rowArray)) . "`) VALUES (" . implode(',', $rowValues) . ");\n";
                    }
                    $sqlDump .= "\n\n";
                }

                $filename = 'backup_' . now()->format('Y_m_d_His') . '.sql';
                file_put_contents($backupDir . '/' . $filename, $sqlDump);
            }

            AuditLog::record(
                $request->user(),
                'backup.created',
                null,
                "Created database backup archive: {$filename}",
                [],
                ['filename' => $filename]
            );

            return back()->with('success', "Database backup created successfully: {$filename}");
        } catch (\Exception $e) {
            return back()->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    /**
     * Download a specific backup file.
     */
    public function download(Request $request, string $filename): BinaryFileResponse|RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $filePath = storage_path('app/backups/' . $filename);

        if (!file_exists($filePath) || str_contains($filename, '..') || str_contains($filename, '/')) {
            return back()->with('error', 'File not found or invalid filename.');
        }

        return response()->download($filePath);
    }

    /**
     * Delete a specific backup file.
     */
    public function destroy(Request $request, string $filename): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $filePath = storage_path('app/backups/' . $filename);

        if (!file_exists($filePath) || str_contains($filename, '..') || str_contains($filename, '/')) {
            return back()->with('error', 'File not found or invalid filename.');
        }

        unlink($filePath);

        AuditLog::record(
            $request->user(),
            'backup.deleted',
            null,
            "Deleted database backup archive: {$filename}",
            ['filename' => $filename],
            []
        );

        return back()->with('success', 'Backup file deleted successfully.');
    }

    /**
     * Helper to format file sizes.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
