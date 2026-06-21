<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Changelog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangelogController extends Controller
{
    public function index(Request $request): Response
    {
        Changelog::syncFromGit();

        $changelogs = Changelog::query()
            ->orderBy('release_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $canManage = $request->user()?->hasRole('superadmin') ?? false;

        return Inertia::render('Admin/Changelog/Index', [
            'changelogs' => $changelogs,
            'canManage' => $canManage,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $validated = $request->validate([
            'version' => 'required|string|unique:changelogs,version|max:30|regex:/^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'release_date' => 'required|date',
            'is_published' => 'required|boolean',
            'changes' => 'required|array|min:1',
            'changes.*.type' => 'required|string|in:Added,Improved,Changed,Fixed,Removed',
            'changes.*.content' => 'required|string|max:500',
        ], [
            'version.regex' => 'The version format must follow Semantic Versioning rules (e.g. v1.2.3 or 2.0.0).',
            'changes.*.content.required' => 'The change detail content is required.',
        ]);

        // Standardize version prepending 'v' if not present
        if (!str_starts_with($validated['version'], 'v')) {
            $validated['version'] = 'v' . $validated['version'];
        }

        $changelog = Changelog::create($validated);

        AuditLog::record(
            $request->user(),
            'changelog.created',
            $changelog,
            "Created changelog version {$changelog->version}: {$changelog->title}",
            [],
            $changelog->toArray()
        );

        return redirect()->back()->with('success', "Version {$changelog->version} created successfully.");
    }

    public function update(Request $request, Changelog $changelog): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $validated = $request->validate([
            'version' => 'required|string|max:30|regex:/^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/|unique:changelogs,version,' . $changelog->id,
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'release_date' => 'required|date',
            'is_published' => 'required|boolean',
            'changes' => 'required|array|min:1',
            'changes.*.type' => 'required|string|in:Added,Improved,Changed,Fixed,Removed',
            'changes.*.content' => 'required|string|max:500',
        ], [
            'version.regex' => 'The version format must follow Semantic Versioning rules (e.g. v1.2.3 or 2.0.0).',
            'changes.*.content.required' => 'The change detail content is required.',
        ]);

        // Standardize version prepending 'v' if not present
        if (!str_starts_with($validated['version'], 'v')) {
            $validated['version'] = 'v' . $validated['version'];
        }

        $oldData = $changelog->toArray();
        $changelog->update($validated);

        AuditLog::record(
            $request->user(),
            'changelog.updated',
            $changelog,
            "Updated changelog version {$changelog->version}",
            $oldData,
            $changelog->toArray()
        );

        return redirect()->back()->with('success', "Version {$changelog->version} updated successfully.");
    }

    public function destroy(Request $request, Changelog $changelog): RedirectResponse
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $version = $changelog->version;
        $oldData = $changelog->toArray();
        
        $changelog->delete();

        AuditLog::record(
            $request->user(),
            'changelog.deleted',
            null,
            "Deleted changelog version {$version}",
            $oldData,
            []
        );

        return redirect()->back()->with('success', "Version {$version} deleted successfully.");
    }
}
