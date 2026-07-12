<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(): JsonResponse
    {
        Gate::authorize('manage-roles');

        $roles = Role::with('permissions')->withCount('users')->get();

        return response()->json([
            'data' => RoleResource::collection($roles),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        Gate::authorize('manage-roles');

        $role = Role::with('permissions')->withCount('users')->findOrFail($id);

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }
}
