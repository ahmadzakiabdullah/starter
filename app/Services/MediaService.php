<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    public function upload(UploadedFile $file, ?string $folder = null): Media
    {
        $fileName = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('media', $fileName, 'public');

        return Media::create([
            'name' => $file->getClientOriginalName(),
            'file_name' => $fileName,
            'mime_type' => $file->getClientMimeType(),
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
}
