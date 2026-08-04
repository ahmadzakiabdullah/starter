<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class BackupService
{
    private const MAGIC = 'ENC1';

    private const CHUNK_SIZE = 65536;

    public function __construct(
        private readonly TelemetryService $telemetry,
    ) {}

    /** @return array<int, array{filename: string, size: string, created_at: string}> */
    public function list(): array
    {
        $files = glob($this->directory().'/*.enc') ?: [];
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

        $filename = 'backup_'.now()->format('Y_m_d_His').'.enc';
        $path = $directory.DIRECTORY_SEPARATOR.$filename;

        // Streamed AES-256-GCM encryption: rows are written chunk by chunk so
        // memory usage stays flat and the data is encrypted at rest. Each chunk
        // is its own GCM message keyed by a unique nonce, giving authenticated
        // encryption without needing the sodium extension.
        $salt = random_bytes(16);
        $key = $this->encryptionKey($salt);

        $handle = fopen($path, 'wb');
        if ($handle === false) {
            throw new RuntimeException('Could not create the backup file.');
        }

        fwrite($handle, self::MAGIC.$salt);

        $chunkIndex = 0;

        try {
            if ($driver === 'sqlite') {
                $this->dumpSqlite($handle, $key, $chunkIndex);
            } else {
                $this->dumpMysql($handle, $key, $chunkIndex, $driver);
            }
        } catch (\Throwable $e) {
            fclose($handle);
            @unlink($path);

            throw $e;
        }

        fclose($handle);

        return $filename;
    }

    /**
     * Stream a decrypted backup to the current output buffer (for downloads).
     */
    public function streamDecrypted(string $filePath): void
    {
        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            abort(500, 'Could not open the backup file.');
        }

        $header = $this->readExactly($handle, strlen(self::MAGIC) + 16);
        if ($header === null || substr($header, 0, strlen(self::MAGIC)) !== self::MAGIC) {
            fclose($handle);
            abort(500, 'The backup file is corrupted or unreadable.');
        }

        $key = $this->encryptionKey(substr($header, strlen(self::MAGIC)));

        while (! feof($handle)) {
            $lengthBytes = $this->readExactly($handle, 4);
            if ($lengthBytes === null) {
                break;
            }

            $length = unpack('N', $lengthBytes)[1];
            $iv = $this->readExactly($handle, 12);
            $ciphertext = $this->readExactly($handle, $length);
            $tag = $this->readExactly($handle, 16);

            if ($iv === null || $ciphertext === null || $tag === null) {
                fclose($handle);
                abort(500, 'The backup file is corrupted or unreadable.');
            }

            $plaintext = openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);

            if ($plaintext === false) {
                fclose($handle);
                abort(500, 'The backup file could not be decrypted.');
            }

            echo $plaintext;
        }

        fclose($handle);
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

    /**
     * @param  resource  $handle
     */
    private function dumpSqlite($handle, string $key, int &$chunkIndex): void
    {
        $databasePath = DB::connection()->getDatabaseName();

        if ($databasePath === ':memory:') {
            throw new RuntimeException('Backup is not supported for in-memory SQLite databases.');
        }

        $source = fopen($databasePath, 'rb');
        if ($source === false) {
            throw new RuntimeException('Could not open the SQLite database file.');
        }

        while (! feof($source)) {
            $chunk = fread($source, self::CHUNK_SIZE);
            if ($chunk === false || $chunk === '') {
                break;
            }

            $this->pushChunk($handle, $key, $chunkIndex, $chunk);
        }

        fclose($source);
    }

    /**
     * @param  resource  $handle
     */
    private function dumpMysql($handle, string $key, int &$chunkIndex, string $driver): void
    {
        $pdo = DB::connection()->getPdo();
        $tables = collect(DB::select('SHOW TABLES'))->map(fn ($table) => current((array) $table))->all();

        $this->pushChunk($handle, $key, $chunkIndex, "-- Database Backup\n-- Connection: {$driver}\n-- Date: ".now()->toDateTimeString()."\n\n");

        foreach ($tables as $table) {
            $quotedTable = str_replace('`', '``', $table);
            $createStatement = (array) DB::select("SHOW CREATE TABLE `{$quotedTable}`")[0];
            $this->pushChunk($handle, $key, $chunkIndex, $createStatement['Create Table'].";\n\n");

            DB::table($table)->orderBy(DB::raw('1'))->chunk(500, function ($rows) use ($handle, $key, &$chunkIndex, $pdo, $quotedTable): void {
                foreach ($rows as $row) {
                    $rowValues = array_map(function ($value) use ($pdo): string {
                        return $value === null ? 'NULL' : $pdo->quote((string) $value);
                    }, (array) $row);

                    $columns = array_map(fn (string $column): string => '`'.str_replace('`', '``', $column).'`', array_keys((array) $row));
                    $this->pushChunk($handle, $key, $chunkIndex, "INSERT INTO `{$quotedTable}` (".implode(',', $columns).') VALUES ('.implode(',', $rowValues).");\n");
                }
            });

            $this->pushChunk($handle, $key, $chunkIndex, "\n\n");
        }
    }

    /**
     * Encrypt a chunk as its own GCM message and append it to the backup file.
     *
     * @param  resource  $handle
     */
    private function pushChunk($handle, string $key, int &$chunkIndex, string $chunk): void
    {
        if ($chunk === '') {
            return;
        }

        // 12-byte nonce: 8-byte big-endian chunk index + 4 random bytes. The
        // counter guarantees uniqueness within the file; the random tail adds
        // entropy so a truncated file never reuses a nonce with a new stream.
        $nonce = pack('J', $chunkIndex).random_bytes(4);

        $ciphertext = openssl_encrypt($chunk, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $nonce, $tag);

        if ($ciphertext === false) {
            throw new RuntimeException('Could not encrypt the backup file.');
        }

        $frame = pack('N', strlen($ciphertext)).$nonce.$ciphertext.$tag;

        if (fwrite($handle, $frame) === false) {
            throw new RuntimeException('Could not write to the backup file.');
        }

        $chunkIndex++;
    }

    /**
     * Derive a 32-byte encryption key from the application key and file salt.
     */
    private function encryptionKey(string $salt): string
    {
        return hash_hmac('sha256', 'laravel-backup:'.$salt, (string) config('app.key'), true);
    }

    /**
     * @param  resource  $handle
     */
    private function readExactly($handle, int $length): ?string
    {
        $data = '';
        $remaining = $length;

        while ($remaining > 0 && ! feof($handle)) {
            $part = fread($handle, $remaining);
            if ($part === false || $part === '') {
                break;
            }

            $data .= $part;
            $remaining -= strlen($part);
        }

        return strlen($data) === $length ? $data : null;
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
