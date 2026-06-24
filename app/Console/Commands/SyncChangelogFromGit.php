<?php

namespace App\Console\Commands;

use App\Models\Changelog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class SyncChangelogFromGit extends Command
{
    protected $signature = 'changelog:sync';

    protected $description = 'Synchronize changelog entries from Git log tags and commits';

    public function handle(): int
    {
        if (! Schema::hasTable('changelogs')) {
            $this->error('Changelogs table does not exist. Run migrations first.');

            return self::FAILURE;
        }

        $output = [];
        $returnVar = 0;

        @exec('git log --decorate --date=short --pretty=format:"%H|%s|%ad|%d"', $output, $returnVar);

        if ($returnVar !== 0 || empty($output)) {
            $this->warn('Could not read Git log. Ensure Git is installed and this is a Git repository.');

            return self::FAILURE;
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
                if (! str_starts_with($currentTag, 'v')) {
                    $currentTag = 'v'.$currentTag;
                }
            }

            // Exclude merge, chore, build, testing, and seeder commits
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
                'date' => $date,
            ];
        }

        $synced = 0;

        foreach ($commitsByVersion as $tag => $changes) {
            if (empty($changes)) {
                continue;
            }

            $releaseDate = $changes[0]['date'];

            $existing = Changelog::where('version', $tag)->first();

            $title = $existing ? $existing->title : ($tag === 'vNext' ? 'Development Version (Pending Release)' : 'Release '.$tag);
            $description = $existing ? $existing->description : ($tag === 'vNext' ? 'Unreleased modifications in the workspace.' : 'Release versions compiled from Git history.');

            Changelog::updateOrCreate(
                ['version' => $tag],
                [
                    'title' => $title,
                    'description' => $description,
                    'release_date' => $releaseDate,
                    'is_published' => $tag !== 'vNext',
                    'changes' => $changes,
                ]
            );

            $synced++;
        }

        $this->info("Synced {$synced} changelog versions from Git.");

        return self::SUCCESS;
    }
}
