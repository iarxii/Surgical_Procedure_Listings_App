<?php

namespace App\Http\Controllers;

use App\Models\Procedure;
use App\Models\IcdCode;
use App\Models\ProcedureIcdMapping;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalProcedures = Procedure::count();
        $totalSpecialities = Procedure::distinct('speciality')->count('speciality');
        $totalIcdCodes = IcdCode::count();
        $totalMappings = ProcedureIcdMapping::count();
        $avgTtgDays = round(Procedure::whereNotNull('ttg_days')->avg('ttg_days') ?? 0);

        // Procedures grouped by speciality
        $bySpeciality = Procedure::selectRaw('speciality, COUNT(*) as count')
            ->groupBy('speciality')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => ['name' => $row->speciality, 'count' => $row->count]);

        // Procedures grouped by level
        $byLevel = Procedure::selectRaw("COALESCE(level, 'Unspecified') as name, COUNT(*) as count")
            ->groupBy('level')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => ['name' => $row->name, 'count' => $row->count]);

        // TTG day distribution buckets
        $ttgDistribution = collect([
            ['label' => '0–30 days',   'min' => 0,   'max' => 30],
            ['label' => '31–60 days',  'min' => 31,  'max' => 60],
            ['label' => '61–90 days',  'min' => 61,  'max' => 90],
            ['label' => '91–180 days', 'min' => 91,  'max' => 180],
            ['label' => '180+ days',   'min' => 181, 'max' => 99999],
        ])->map(function ($bucket) {
            return [
                'label' => $bucket['label'],
                'count' => Procedure::whereNotNull('ttg_days')
                    ->whereBetween('ttg_days', [$bucket['min'], $bucket['max']])
                    ->count(),
            ];
        });

        // Procedures by care setting
        $byCareSetting = Procedure::selectRaw("COALESCE(care_icu, 'Unspecified') as name, COUNT(*) as count")
            ->groupBy('care_icu')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => ['name' => $row->name, 'count' => $row->count]);

        // Recent procedures
        $recentProcedures = Procedure::orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'procedure_name', 'speciality', 'level', 'ttg_days', 'ttg_months']);

        return response()->json([
            'total_procedures'   => $totalProcedures,
            'total_specialities' => $totalSpecialities,
            'total_icd_codes'    => $totalIcdCodes,
            'total_mappings'     => $totalMappings,
            'avg_ttg_days'       => $avgTtgDays,
            'by_speciality'      => $bySpeciality->values(),
            'by_level'           => $byLevel->values(),
            'ttg_distribution'   => $ttgDistribution->values(),
            'by_care_setting'    => $byCareSetting->values(),
            'recent_procedures'  => $recentProcedures,
        ]);
    }
}
