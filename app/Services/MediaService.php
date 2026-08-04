<?php

namespace App\Services;

use App\Models\Media;
use App\Models\MediaFolder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    /**
     * Whitelist of MIME types (sniffed from file content) mapped to the
     * extension used for the stored filename. The client-supplied extension
     * is never trusted.
     *
     * @var array<string, string>
     */
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'image/bmp' => 'bmp',
        'image/x-icon' => 'ico',
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.ms-excel' => 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.ms-powerpoint' => 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
        'text/csv' => 'csv',
        'text/plain' => 'txt',
        'application/zip' => 'zip',
        'application/x-rar-compressed' => 'rar',
        'application/x-7z-compressed' => '7z',
        'video/mp4' => 'mp4',
        'audio/mpeg' => 'mp3',
        'video/quicktime' => 'mov',
        'video/webm' => 'webm',
    ];

    /**
     * Sniff the real MIME type from the file content and return a whitelisted
     * safe extension, or null if the file type is not supported.
     */
    public function safeExtension(string $realPath): ?string
    {
        $detected = (new \finfo(FILEINFO_MIME_TYPE))->file($realPath);

        return $detected !== false
            ? (self::MIME_EXTENSIONS[$detected] ?? null)
            : null;
    }

    public function upload(UploadedFile $file, ?string $folder = null): Media
    {
        $extension = $this->safeExtension((string) $file->getRealPath());

        if ($extension === null) {
            abort(422, 'Unsupported file type.');
        }

        $detectedMime = (new \finfo(FILEINFO_MIME_TYPE))->file((string) $file->getRealPath());
        $fileName = time().'_'.uniqid().'.'.$extension;
        $path = $file->storeAs('media', $fileName, 'public');

        return Media::create([
            'name' => $file->getClientOriginalName(),
            'file_name' => $fileName,
            'mime_type' => $detectedMime ?: $file->getClientMimeType(),
            'path' => $path,
            'size' => $file->getSize(),
            'folder' => filled($folder) ? trim($folder) : null,
            'disk' => 'public',
        ]);
    }

    public function rename(Media $media, string $name): string
    {
        $oldName = $media->name;
        $media->update(['name' => $name]);

        return $oldName;
    }

    public function delete(Media $media): string
    {
        $name = $media->name;

        if (Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $media->delete();

        return $name;
    }

    /** @param array<int, int|string> $ids */
    public function deleteMany(array $ids): int
    {
        $mediaItems = Media::whereIn('id', $ids)->get();

        foreach ($mediaItems as $media) {
            $this->delete($media);
        }

        return $mediaItems->count();
    }

    /** @return array<int, string> */
    public function folders(): array
    {
        $dbFolders = Media::whereNotNull('folder')
            ->where('folder', '!=', '')
            ->distinct()
            ->orderBy('folder')
            ->pluck('folder')
            ->toArray();

        $createdFolders = MediaFolder::orderBy('name')
            ->pluck('name')
            ->toArray();

        return array_values(array_unique([...$createdFolders, ...$dbFolders]));
    }

    public function createFolder(string $name): MediaFolder
    {
        return MediaFolder::firstOrCreate(['name' => trim($name)]);
    }

    public function deleteFolder(string $name): bool
    {
        $deleted = MediaFolder::where('name', $name)->delete();

        Media::where('folder', $name)->update(['folder' => null]);

        return $deleted > 0;
    }
}
