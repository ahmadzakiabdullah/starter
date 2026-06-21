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

    /**
     * Synchronize version releases and commits dynamically from Git log.
     */
    public static function syncFromGit(): void
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('changelogs')) {
            return;
        }

        $output = [];
        $returnVar = 0;
        
        // Execute git log with decorations and date
        @exec('git log --decorate --date=short --pretty=format:"%H|%s|%ad|%d"', $output, $returnVar);
        
        if ($returnVar !== 0 || empty($output)) {
            return;
        }

        $commitsByVersion = [];
        $currentTag = 'vNext';

        foreach ($output as $line) {
            $parts = explode('|', $line);
            if (count($parts) < 3) {
                continue;
            }

            $hash = $parts[0];
            $subject = trim($parts[1]);
            $date = $parts[2];
            $decorations = $parts[3] ?? '';

            // Check if this commit marks a tagged release
            if (preg_match('/tag:\s*(v?\d+\.\d+\.\d+[^,\)]*)/', $decorations, $matches)) {
                $currentTag = $matches[1];
                if (!str_starts_with($currentTag, 'v')) {
                    $currentTag = 'v' . $currentTag;
                }
            }

            // Exclude merge, chore, build, testing, and seeder commits to keep changelogs clean
            if (preg_match('/^(merge|chore|seeder|test|build):/i', $subject) || str_starts_with(strtolower($subject), 'merge branch')) {
                continue;
            }

            // Parse Conventional Commits to assign appropriate change types
            $type = 'Changed';
            $content = $subject;

            if (preg_match('/^(feat|add)(\([^\)]+\))?:\s*(.*)$/i', $subject, $matchContent)) {
                $type = 'Added';
                $content = ucfirst(trim($matchContent[3]));
            } elseif (preg_match('/^(fix|bug|patch)(\([^\)]+\))?:\s*(.*)$/i', $subject, $matchContent)) {
                $type = 'Fixed';
                $content = ucfirst(trim($matchContent[3]));
            } elseif (preg_match('/^(perf|improve|refactor|style)(\([^\)]+\))?:\s*(.*)$/i', $subject, $matchContent)) {
                $type = 'Improved';
                $content = ucfirst(trim($matchContent[3]));
            } elseif (preg_match('/^(remove|del)(\([^\)]+\))?:\s*(.*)$/i', $subject, $matchContent)) {
                $type = 'Removed';
                $content = ucfirst(trim($matchContent[3]));
            }

            $commitsByVersion[$currentTag][] = [
                'type' => $type,
                'content' => $content,
                'hash' => substr($hash, 0, 7),
                'date' => $date
            ];
        }

        // Upsert logs into database
        foreach ($commitsByVersion as $tag => $changes) {
            if (empty($changes)) {
                continue;
            }

            $releaseDate = $changes[0]['date'];
            
            $existing = static::where('version', $tag)->first();
            
            $title = $existing ? $existing->title : ($tag === 'vNext' ? 'Development Version (Pending Release)' : 'Release ' . $tag);
            $description = $existing ? $existing->description : ($tag === 'vNext' ? 'Unreleased modifications in the workspace.' : 'Release versions compiled from Git history.');
            
            static::updateOrCreate(
                ['version' => $tag],
                [
                    'title' => $title,
                    'description' => $description,
                    'release_date' => $releaseDate,
                    'is_published' => $tag !== 'vNext',
                    'changes' => $changes,
                ]
            );
        }
    }
}
