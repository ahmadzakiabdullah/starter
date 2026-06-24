<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'file_name' => $this->file_name, 'mime_type' => $this->mime_type, 'path' => $this->path, 'size' => $this->size, 'formatted_size' => $this->formatted_size, 'folder' => $this->folder, 'url' => $this->url, 'created_at' => $this->created_at?->toIso8601String()];
    }
}
