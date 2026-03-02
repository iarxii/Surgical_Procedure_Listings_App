<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SearchController extends Controller
{
    private \App\Services\CodeSearchService $searchService;

    public function __construct(\App\Services\CodeSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function search(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $query = $request->query('query');
        $specialty = $request->query('specialty');
        
        if (!$query) {
            return response()->json(['error' => 'Query parameter is required'], 400);
        }

        $results = $this->searchService->search($query, $specialty);

        return response()->json($results);
    }
}
