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

    public function searchByProcedure(int $id): \Illuminate\Http\JsonResponse
    {
        $procedure = \App\Models\Procedure::with('icdCodes')->find($id);

        if (!$procedure) {
            return response()->json(['error' => 'Procedure not found'], 404);
        }

        $results = $this->searchService->searchByProcedure($procedure);

        return response()->json($results);
    }
}
