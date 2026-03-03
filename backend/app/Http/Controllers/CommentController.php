<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    /**
     * List comments for a specific procedure.
     */
    public function index(Request $request): JsonResponse
    {
        $procedureName = $request->query('procedure_name');

        if (!$procedureName) {
            return response()->json(['error' => 'procedure_name is required'], 400);
        }

        $comments = Comment::where('procedure_name', $procedureName)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $comments]);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'procedure_name' => 'required|string|max:255',
            'author'         => 'required|string|max:100',
            'body'           => 'required|string|max:2000',
        ]);

        $comment = Comment::create($validated);

        return response()->json(['data' => $comment], 201);
    }
}
