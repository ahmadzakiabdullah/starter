<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MediaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('manage-media');

        $query = Media::query()->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('folder')) {
            $query->where('folder', $request->folder);
        }

        if ($request->filled('type')) {
            $type = $request->type;
            if ($type === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($type === 'document') {
                $query->where('mime_type', 'not like', 'image/%');
            }
        }

        $perPage = min((int) $request->input('per_page', 24), 100);
        $files = $query->paginate($perPage);

        return response()->json([
            'data' => MediaResource::collection($files),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        Gate::authorize('manage-media');

        $media = Media::findOrFail($id);

        return response()->json([
            'data' => new MediaResource($media),
        ]);
    }
}
