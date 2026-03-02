<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProcedureController extends Controller
{
    public function catalog(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $specialty = $request->query('specialty');
        
        $query = \App\Models\Procedure::with('icdCodes');
        if ($specialty) {
            $query->where('speciality', $specialty);
        }
        
        return response()->json([
            'data' => $query->get()
        ]);
    }
}
