<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Changelog extends Model
{
    use HasFactory;

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

    protected static function booted(): void
    {
        static::saved(function (): void {
            Cache::forget('changelog.latest_version');
        });

        static::deleted(function (): void {
            Cache::forget('changelog.latest_version');
        });
    }

    /**
     * Get the latest published version of the application (cached 60s).
     */
    public static function latestVersion(): string
    {
        if (! Schema::hasTable('changelogs')) {
            return 'v1.0.0';
        }

        return Cache::remember('changelog.latest_version', 60, function () {
            return static::where('is_published', true)
                ->orderBy('release_date', 'desc')
                ->orderBy('id', 'desc')
                ->value('version') ?? 'v1.0.0';
        });
    }
}
