<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Services\BackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
     * Trigger a database backup.
     */
    public function create(Request $request): RedirectResponse
    {
        Gate::authorize('manage-system');

        try {
            $filename = $this->backups->create();

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
            return back()->with('error', 'Backup failed: '.$e->getMessage());
        }
    }

    /**
     * Download a specific backup file.
     */
    public function download(Request $request, string $filename): BinaryFileResponse|RedirectResponse
    {
        Gate::authorize('manage-system');

        $filePath = $this->backups->filePath($filename);

        if ($filePath === null) {
            return back()->with('error', 'File not found or invalid filename.');
        }

        return response()->download($filePath);
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
}
