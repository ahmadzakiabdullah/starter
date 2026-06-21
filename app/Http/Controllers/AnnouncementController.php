<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless(\App\Models\Setting::values()['module_announcements'] ?? true, 403, 'Announcement module is disabled.');
            return $next($request);
        });
    }

    /**
     * Store a newly created announcement in storage.
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'style' => 'required|in:info,warning,danger,success',
            'is_active' => 'required|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $validated['created_by'] = $request->user()->id;

        $announcement = Announcement::create($validated);

        AuditLog::record(
            $request->user(),
            'announcement.created',
            $announcement->id,
            "Created announcement: {$announcement->title}",
            [],
            $validated
        );

        return back()->with('success', 'Announcement created successfully.');
    }

    /**
     * Update the specified announcement in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'style' => 'required|in:info,warning,danger,success',
            'is_active' => 'required|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $oldData = $announcement->toArray();
        $announcement->update($validated);

        AuditLog::record(
            $request->user(),
            'announcement.updated',
            $announcement->id,
            "Updated announcement: {$announcement->title}",
            $oldData,
            $validated
        );

        return back()->with('success', 'Announcement updated successfully.');
    }

    /**
     * Toggle the active status of an announcement.
     */
    public function toggle(Request $request, Announcement $announcement)
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $oldActive = $announcement->is_active;
        $announcement->update(['is_active' => !$oldActive]);

        AuditLog::record(
            $request->user(),
            'announcement.toggled',
            $announcement->id,
            "Toggled announcement active state: {$announcement->title}",
            ['is_active' => $oldActive],
            ['is_active' => !$oldActive]
        );

        return back()->with('success', 'Announcement status updated.');
    }

    /**
     * Remove the specified announcement from storage.
     */
    public function destroy(Request $request, Announcement $announcement)
    {
        abort_unless($request->user()->hasRole('superadmin'), 403);

        $oldData = $announcement->toArray();
        $title = $announcement->title;
        $announcement->delete();

        AuditLog::record(
            $request->user(),
            'announcement.deleted',
            null,
            "Deleted announcement: {$title}",
            $oldData,
            []
        );

        return back()->with('success', 'Announcement deleted successfully.');
    }
}
