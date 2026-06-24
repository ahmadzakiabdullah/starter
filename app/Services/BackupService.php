<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class BackupService
{
    public function __construct(
        private readonly TelemetryService $telemetry,
    ) {}

    /** @return array<int, array{filename: string, size: string, created_at: string}> */
    public function list(): array
    {
        $files = glob($this->directory().'/*.{sql,sqlite}', GLOB_BRACE) ?: [];
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => $this->telemetry->formatBytes((int) filesize($file)),
                'created_at' => date('Y-m-d H:i:s', filemtime($file)),
            ];
        }

        usort($backups, fn (array $a, array $b): int => strcmp($b['created_at'], $a['created_at']));

        return $backups;
    }

    public function create(): string
    {
        $directory = $this->directory();
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $databasePath = DB::connection()->getDatabaseName();

            if ($databasePath === ':memory:') {
                throw new RuntimeException('Backup is not supported for in-memory SQLite databases.');
            }

            $filename = 'backup_'.now()->format('Y_m_d_His').'.sqlite';

            if (! copy($databasePath, $directory.DIRECTORY_SEPARATOR.$filename)) {
                throw new RuntimeException('Could not copy the SQLite database file.');
            }

            return $filename;
        }

        $filename = 'backup_'.now()->format('Y_m_d_His').'.sql';
        $contents = "-- Database Backup\n-- Connection: {$driver}\n-- Date: ".now()->toDateTimeString()."\n\n";
        $pdo = DB::connection()->getPdo();
        $tables = collect(DB::select('SHOW TABLES'))->map(fn ($table) => current((array) $table))->all();

        foreach ($tables as $table) {
            $quotedTable = str_replace('`', '``', $table);
            $createStatement = (array) DB::select("SHOW CREATE TABLE `{$quotedTable}`")[0];
            $contents .= $createStatement['Create Table'].";\n\n";

            foreach (DB::table($table)->get() as $row) {
                $rowValues = array_map(function ($value) use ($pdo): string {
                    return $value === null ? 'NULL' : $pdo->quote((string) $value);
                }, (array) $row);

                $columns = array_map(fn (string $column): string => '`'.str_replace('`', '``', $column).'`', array_keys((array) $row));
                $contents .= "INSERT INTO `{$quotedTable}` (".implode(',', $columns).') VALUES ('.implode(',', $rowValues).");\n";
            }

            $contents .= "\n\n";
        }

        if (file_put_contents($directory.DIRECTORY_SEPARATOR.$filename, $contents) === false) {
            throw new RuntimeException('Could not write the backup file.');
        }

        return $filename;
    }

    public function filePath(string $filename): ?string
    {
        if (! $this->isSafeFilename($filename)) {
            return null;
        }

        $path = $this->directory().DIRECTORY_SEPARATOR.$filename;

        return is_file($path) ? $path : null;
    }

    public function delete(string $filename): bool
    {
        $path = $this->filePath($filename);

        return $path !== null && unlink($path);
    }

    private function directory(): string
    {
        $directory = storage_path('app/backups');

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException('Could not create the backup directory.');
        }

        return $directory;
    }

    private function isSafeFilename(string $filename): bool
    {
        return $filename !== ''
            && ! str_contains($filename, '..')
            && ! str_contains($filename, '/')
            && ! str_contains($filename, '\\');
    }
}
