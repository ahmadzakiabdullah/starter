<?php

namespace App\Http\Controllers;

use App\Jobs\CreateBackupJob;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function __construct(
        private readonly BackupService $backups,
    ) {}

    /**
     * Display a listing of database backups.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('manage-system');

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $this->backups->list(),
        ]);
    }

    /**
     * Trigger a database backup via queued job.
     */
    public function create(Request $request): RedirectResponse
    {
        Gate::authorize('manage-system');

        CreateBackupJob::dispatch($request->user()->id);

        return back()->with('success', 'Database backup has been queued for creation.');
    }

    /**
     * Download a specific backup file (decrypted on the fly).
     */
    public function download(Request $request, string $filename): StreamedResponse|RedirectResponse
    {
        Gate::authorize('manage-system');

        $filePath = $this->backups->filePath($filename);

        if ($filePath === null) {
            return back()->with('error', 'File not found or invalid filename.');
        }

        $downloadName = str_replace('.enc', '.sql', $filename);

        return response()->streamDownload(
            function () use ($filePath): void {
                $this->backups->streamDecrypted($filePath);
            },
            $downloadName,
            ['Content-Type' => 'application/sql; charset=utf-8']
        );
    }

    /**
     * Delete a specific backup file.
     */
    public function destroy(Request $request, string $filename): RedirectResponse
    {
        Gate::authorize('manage-system');

        if (! $this->backups->delete($filename)) {
            return back()->with('error', 'File not found or invalid filename.');
        }

        return back()->with('success', 'Backup file deleted successfully.');
    }
}
