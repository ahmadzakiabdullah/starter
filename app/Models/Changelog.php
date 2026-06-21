<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Changelog extends Model
{
    protected $fillable = [
        'version',
        'title',
        'description',
        'changes',
        'release_date',
        'is_published',
    ];

    protected $casts = [
        'changes' => 'array',
        'release_date' => 'date',
        'is_published' => 'boolean',
    ];

    /**
     * Get the latest published version of the application.
     */
    public static function latestVersion(): string
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('changelogs')) {
            return 'v1.0.0';
        }

        return static::where('is_published', true)
            ->orderBy('release_date', 'desc')
            ->orderBy('id', 'desc')
            ->value('version') ?? 'v1.0.0';
    }
}
