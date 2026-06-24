<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class SessionController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless(Setting::values()['module_active_sessions'] ?? true, 403, 'Active Sessions module is disabled.');

            return $next($request);
        });
    }

    /**
     * Get active sessions for the authenticated user.
     */
    public function getActiveSessions(Request $request)
    {
        $userId = $request->user()->id;
        $currentSessionId = Session::getId();

        $sessions = DB::table('sessions')
            ->where('user_id', $userId)
            ->get()
            ->map(function ($session) use ($currentSessionId) {
                $agent = $this->parseUserAgent($session->user_agent);

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'is_current_device' => $session->id === $currentSessionId,
                    'browser' => $agent['browser'],
                    'os' => $agent['os'],
                    'device' => $agent['device'],
                    'last_active' => date('c', $session->last_activity),
                    'last_active_formatted' => $this->formatLastActive($session->last_activity),
                ];
            });

        return response()->json([
            'sessions' => $sessions,
        ]);
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, $id)
    {
        $userId = $request->user()->id;

        DB::table('sessions')
            ->where('user_id', $userId)
            ->where('id', $id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully.',
        ]);
    }

    /**
     * Revoke all other sessions.
     */
    public function revokeOtherSessions(Request $request)
    {
        $userId = $request->user()->id;
        $currentSessionId = Session::getId();

        DB::table('sessions')
            ->where('user_id', $userId)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'All other sessions revoked successfully.',
        ]);
    }

    /**
     * Parse User Agent into readable OS, Browser, and Device.
     */
    private function parseUserAgent($userAgent)
    {
        if (empty($userAgent)) {
            return [
                'browser' => 'Unknown',
                'os' => 'Unknown',
                'device' => 'Desktop',
            ];
        }

        // Parse OS
        $os = 'Unknown OS';
        $osArray = [
            '/windows nt 10/i' => 'Windows 10/11',
            '/windows nt 6.3/i' => 'Windows 8.1',
            '/windows nt 6.2/i' => 'Windows 8',
            '/windows nt 6.1/i' => 'Windows 7',
            '/windows nt 6.0/i' => 'Windows Vista',
            '/windows nt 5.2/i' => 'Windows Server 2003/XP x64',
            '/windows nt 5.1/i' => 'Windows XP',
            '/macintosh|mac os x/i' => 'macOS',
            '/linux/i' => 'Linux',
            '/ubuntu/i' => 'Ubuntu',
            '/iphone/i' => 'iPhone',
            '/ipod/i' => 'iPod',
            '/ipad/i' => 'iPad',
            '/android/i' => 'Android',
            '/blackberry/i' => 'BlackBerry',
            '/webos/i' => 'Mobile',
        ];

        foreach ($osArray as $regex => $value) {
            if (preg_match($regex, $userAgent)) {
                $os = $value;
                break;
            }
        }

        // Parse Browser
        $browser = 'Unknown Browser';
        $browserArray = [
            '/msie/i' => 'Internet Explorer',
            '/firefox/i' => 'Firefox',
            '/safari/i' => 'Safari',
            '/chrome/i' => 'Chrome',
            '/edge/i' => 'Edge',
            '/opera/i' => 'Opera',
            '/netscape/i' => 'Netscape',
            '/maxthon/i' => 'Maxthon',
            '/konqueror/i' => 'Konqueror',
            '/mobile/i' => 'Handheld Browser',
        ];

        foreach ($browserArray as $regex => $value) {
            if (preg_match($regex, $userAgent)) {
                $browser = $value;
                break;
            }
        }

        // Exclude Chrome from Safari
        if (preg_match('/chrome/i', $userAgent) && preg_match('/safari/i', $userAgent)) {
            $browser = 'Chrome';
        }
        // Exclude Edge from Chrome/Safari
        if (preg_match('/edge/i', $userAgent) || preg_match('/edg/i', $userAgent)) {
            $browser = 'Edge';
        }

        // Parse Device
        $device = 'Desktop';
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*mobile))/i', $userAgent)) {
            $device = 'Tablet';
        } elseif (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iphone|ipad|ipod)/i', strtolower($userAgent))) {
            $device = 'Mobile';
        }

        return [
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
        ];
    }

    /**
     * Format last active timestamp.
     */
    private function formatLastActive($timestamp)
    {
        $seconds = time() - $timestamp;

        if ($seconds < 60) {
            return 'Just now';
        }

        $minutes = round($seconds / 60);
        if ($minutes < 60) {
            return $minutes.' '.($minutes == 1 ? 'minute' : 'minutes').' ago';
        }

        $hours = round($seconds / 3600);
        if ($hours < 24) {
            return $hours.' '.($hours == 1 ? 'hour' : 'hours').' ago';
        }

        $days = round($seconds / 86400);

        return $days.' '.($days == 1 ? 'day' : 'days').' ago';
    }
}
