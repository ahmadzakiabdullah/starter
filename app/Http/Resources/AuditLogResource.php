<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'event' => $this->resource->event,
            'description' => $this->resource->description,
            'actor' => $this->resource->relationLoaded('user') && $this->resource->user
                ? ['name' => $this->resource->user->name, 'username' => $this->resource->user->username]
                : null,
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'old_values' => $this->redact($this->resource->old_values),
            'new_values' => $this->redact($this->resource->new_values),
            'ip_address' => $this->resource->ip_address,
            'user_agent' => $this->resource->user_agent,
            'auditable_type' => $this->resource->auditable_type ? class_basename($this->resource->auditable_type) : null,
            'auditable_id' => $this->resource->auditable_id,
        ];
    }

    /**
     * Defense-in-depth: never expose credentials stored inside audit diff values.
     *
     * @param  mixed  $values
     * @return mixed
     */
    private function redact($values)
    {
        if (! is_array($values)) {
            return $values;
        }

        foreach (['mail_password', 'mail_username'] as $key) {
            if (array_key_exists($key, $values)) {
                $values[$key] = filled($values[$key]) ? '[REDACTED]' : '';
            }
        }

        return $values;
    }
}
