<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProcedureController extends Controller
{
    public function catalog(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $specialty = $request->query('specialty');
        
        $query = \App\Models\Procedure::with('icdCodes')->withCount('icdCodes');
        if ($specialty) {
            $query->where('speciality', $specialty);
        }
        
        return response()->json([
            'data' => $query->get()
        ]);
    }

    public function specialities(): \Illuminate\Http\JsonResponse
    {
        $specialities = \App\Models\Procedure::distinct()
            ->whereNotNull('speciality')
            ->orderBy('speciality')
            ->pluck('speciality');

        return response()->json([
            'data' => $specialities
        ]);
    }

    public function import(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $path = $file->storeAs('imports', $file->getClientOriginalName());
        $fullPath = storage_path('app/' . $path);

        try {
            $service = new \App\Services\ProcedureImportService();
            $result = $service->import($fullPath);

            // Optional: Run normalization after import
            \Illuminate\Support\Facades\Artisan::call('procedures:normalize-codes');

            return response()->json([
                'message' => 'Import completed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        } finally {
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
    }
}
