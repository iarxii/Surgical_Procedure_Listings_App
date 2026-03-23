<?php

namespace App\Services;

use App\Models\Procedure;
use App\Models\IcdCode;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class ProcedureImportService
{
    public function import(string $filePath): array
    {
        $csvPath = str_replace('.xlsx', '.csv', $filePath);
        
        // Use python to convert xlsx to csv
        $pythonScript = "
import pandas as pd
import sys
try:
    df = pd.read_excel(sys.argv[1], sheet_name=0, header=None)
    df.to_csv(sys.argv[2], index=False, header=False)
except Exception as e:
    print(str(e))
    sys.exit(1)
";
        $tempScript = storage_path('app/convert.py');
        file_put_contents($tempScript, $pythonScript);

        $result = Process::run(['python', $tempScript, $filePath, $csvPath]);

        if ($result->failed()) {
            Log::error('Excel to CSV conversion failed: ' . $result->errorOutput());
            throw new \Exception('Failed to convert Excel to CSV: ' . $result->errorOutput());
        }

        return $this->processCsv($csvPath);
    }

    private function processCsv(string $csvPath): array
    {
        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            throw new \Exception('Failed to open generated CSV file.');
        }

        $importedCount = 0;
        $rowCount = 0;
        $errors = [];

        // Mapping based on Row 11 of the Excel
        // [0] Speciality | [1] Procedure | [2] ICD-10 | [3] Level | [4] Care/ICU | [5] TTG | [6] TTG Days | [7] 70% | [8] 90%
        
        while (($data = fgetcsv($handle)) !== false) {
            $rowCount++;
            if ($rowCount <= 11) continue; // Skip headers and intro

            try {
                $speciality = trim($data[0] ?? '');
                $procedureName = trim($data[1] ?? '');
                
                if (empty($speciality) || empty($procedureName)) continue;

                $procedure = Procedure::updateOrCreate(
                    [
                        'speciality' => $speciality,
                        'procedure_name' => $procedureName,
                    ],
                    [
                        'level' => $data[3] ?? null,
                        'care_icu' => $data[4] ?? null,
                        'ttg_months' => $data[5] ?? null,
                        'ttg_days' => is_numeric($data[6]) ? (int)$data[6] : null,
                        'ttg_minimum_70_pct' => is_numeric($data[7]) ? (int)$data[7] : null,
                        'ttg_alert_90_pct' => is_numeric($data[8]) ? (int)$data[8] : null,
                    ]
                );

                // Handle ICD codes
                $icdRaw = $data[2] ?? '';
                if (!empty($icdRaw)) {
                    // Split by /, ;, ,
                    $codes = preg_split('/[,;\/]+/', $icdRaw);
                    foreach ($codes as $codeStr) {
                        $codeStr = trim($codeStr);
                        if (empty($codeStr)) continue;

                        $icdCode = IcdCode::firstOrCreate(
                            ['code' => $codeStr, 'version' => 'ICD-10-CM'],
                            ['description' => 'Imported from Master TTGs']
                        );

                        $procedure->icdCodes()->syncWithoutDetaching([$icdCode->id => ['mapping_type' => 'Primary']]);
                    }
                }

                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Row {$rowCount}: " . $e->getMessage();
            }
        }

        fclose($handle);
        unlink($csvPath);

        return [
            'total_imported' => $importedCount,
            'errors' => $errors
        ];
    }
}
