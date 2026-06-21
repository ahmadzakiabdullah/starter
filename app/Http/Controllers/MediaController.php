<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::query()->latest();

        // Search name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
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

        $files = $query->get();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'files' => $files,
                'folders' => $folders,
            ]);
        }

        return Inertia::render('Admin/Media/Index', [
            'files' => $files,
            'folders' => $folders,
            'filters' => $request->only(['search', 'folder', 'type']),
        ]);
    }

    public function upload(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
            'folder' => 'nullable|string|max:50',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $size = $file->getSize();

        // Safe unique file name
        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('media', $fileName, 'public');

        $media = Media::create([
            'name' => $originalName,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'path' => $path,
            'size' => $size,
            'folder' => $request->filled('folder') ? trim($request->folder) : null,
            'disk' => 'public',
        ]);

        AuditLog::record(
            $request->user(),
            'media.uploaded',
            null,
            "Uploaded media file: {$originalName}.",
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

        $oldName = $media->name;
        $media->update([
            'name' => $request->name,
        ]);

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
        // Delete from disk
        if (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $fileName = $media->name;
        $media->delete();

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

        $files = Media::whereIn('id', $request->ids)->get();

        foreach ($files as $media) {
            if (Storage::disk($media->disk)->exists($media->path)) {
                Storage::disk($media->disk)->delete($media->path);
            }
            $media->delete();
        }

        AuditLog::record(
            $request->user(),
            'media.bulk_deleted',
            null,
            "Bulk deleted " . count($files) . " media files.",
            [],
            ['count' => count($files)]
        );

        return back()->with('success', 'Selected files deleted successfully.');
    }
}
