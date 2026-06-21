<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiTokenController extends Controller
{
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
                    'last_used_at' => $token->last_used_at ? $token->last_used_at->toIso8601String() : null,
                    'last_used_formatted' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never used',
                    'created_at' => $token->created_at->toIso8601String(),
                    'created_formatted' => $token->created_at->diffForHumans(),
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
        ]);

        $tokenName = $request->input('name');
        $token = $request->user()->createToken($tokenName);

        return response()->json([
            'token' => [
                'id' => $token->accessToken->id,
                'name' => $token->accessToken->name,
                'created_at' => $token->accessToken->created_at->toIso8601String(),
                'created_formatted' => $token->accessToken->created_at->diffForHumans(),
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
