<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'guard_name' => $this->resource->guard_name,
            'permissions' => $this->resource->relationLoaded('permissions') ? $this->resource->permissions->pluck('name') : [],
            'users_count' => $this->resource->users_count ?? 0,
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
