<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class ApiTokenController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless(Setting::values()['module_api_keys'] ?? true, 403, 'API Keys module is disabled.');

            return $next($request);
        });
    }

    /**
     * Get the active API tokens for the user.
     */
    public function index(Request $request)
    {
        return response()->json([
            'tokens' => $request->user()->tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'abilities' => $token->abilities,
                    'last_used_at' => $token->last_used_at ? $token->last_used_at->toIso8601String() : null,
                    'last_used_formatted' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never used',
                    'created_at' => $token->created_at->toIso8601String(),
                    'created_formatted' => $token->created_at->diffForHumans(),
                    'expires_at' => $token->expires_at?->toIso8601String(),
                    'expires_formatted' => $token->expires_at ? $token->expires_at->diffForHumans() : 'Never expires',
                ];
            }),
        ]);
    }

    /**
     * Store a new API token.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => ['nullable', 'array'],
            'abilities.*' => ['in:user:read,users:read,roles:read,media:read,audit-logs:read'],
        ]);

        $tokenName = $request->input('name');
        $abilities = $request->input('abilities', ['user:read', 'users:read', 'roles:read', 'media:read', 'audit-logs:read']);
        $token = $request->user()->createToken($tokenName, $abilities);

        return response()->json([
            'token' => [
                'id' => $token->accessToken->id,
                'name' => $token->accessToken->name,
                'abilities' => $token->accessToken->abilities,
                'created_at' => $token->accessToken->created_at->toIso8601String(),
                'created_formatted' => $token->accessToken->created_at->diffForHumans(),
                'expires_at' => $token->accessToken->expires_at?->toIso8601String(),
                'expires_formatted' => $token->accessToken->expires_at ? $token->accessToken->expires_at->diffForHumans() : 'Never expires',
            ],
            'plainTextToken' => $token->plainTextToken,
        ], 201);
    }

    /**
     * Revoke a specific API token.
     */
    public function destroy(Request $request, $id)
    {
        $request->user()->tokens()->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'API Access Key revoked successfully.',
        ]);
    }
}
