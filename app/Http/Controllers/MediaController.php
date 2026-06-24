<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadMediaRequest;
use App\Models\AuditLog;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $media,
    ) {
        $this->middleware(function ($request, $next) {
            Gate::authorize('manage-media');

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Media::query()->latest();

        // Search name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Folder penapisan
        if ($request->filled('folder')) {
            $query->where('folder', $request->folder);
        }

        // Type filter (e.g. image, document)
        if ($request->filled('type')) {
            $type = $request->type;
            if ($type === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($type === 'document') {
                $query->where('mime_type', 'not like', 'image/%');
            }
        }

        // Dynamic folders list
        $folders = Media::whereNotNull('folder')
            ->where('folder', '!=', '')
            ->distinct()
            ->pluck('folder');

        $files = $query->paginate(24)->withQueryString();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'files' => $files->items(),
                'pagination' => [
                    'current_page' => $files->currentPage(),
                    'last_page' => $files->lastPage(),
                    'per_page' => $files->perPage(),
                    'total' => $files->total(),
                ],
                'folders' => $folders,
            ]);
        }

        return Inertia::render('Admin/Media/Index', [
            'files' => $files,
            'folders' => $folders,
            'filters' => $request->only(['search', 'folder', 'type']),
        ]);
    }

    public function upload(UploadMediaRequest $request): RedirectResponse
    {
        $media = $this->media->upload($request->file('file'), $request->input('folder'));

        AuditLog::record(
            $request->user(),
            'media.uploaded',
            null,
            "Uploaded media file: {$media->name}.",
            [],
            $media->toArray()
        );

        return back()->with('success', 'File uploaded successfully.');
    }

    public function rename(Request $request, Media $media): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $oldName = $this->media->rename($media, $request->name);

        AuditLog::record(
            $request->user(),
            'media.renamed',
            null,
            "Renamed media file from '{$oldName}' to '{$request->name}'.",
            ['name' => $oldName],
            ['name' => $request->name]
        );

        return back()->with('success', 'File renamed successfully.');
    }

    public function destroy(Media $media): RedirectResponse
    {
        $fileName = $this->media->delete($media);

        AuditLog::record(
            request()->user(),
            'media.deleted',
            null,
            "Deleted media file: {$fileName}.",
            [],
            []
        );

        return back()->with('success', 'File deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:media,id',
        ]);

        $deletedCount = $this->media->deleteMany($request->ids);

        AuditLog::record(
            $request->user(),
            'media.bulk_deleted',
            null,
            "Bulk deleted {$deletedCount} media files.",
            [],
            ['count' => $deletedCount]
        );

        return back()->with('success', 'Selected files deleted successfully.');
    }
}
