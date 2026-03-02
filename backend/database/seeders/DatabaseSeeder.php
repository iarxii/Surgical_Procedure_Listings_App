<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $jsonStr = \Illuminate\Support\Facades\File::get(database_path('seeders/master_ttgs.json'));
        $data = json_decode($jsonStr, true);

        foreach ($data as $row) {
            $speciality = $row['Speciality'] ?? 'Unknown';
            $procedureName = $row['Procedure'] ?? '';
            if (empty($procedureName)) continue;

            $procedure = \App\Models\Procedure::create([
                'speciality' => $speciality,
                'procedure_name' => $procedureName,
                'level' => $row['Level'] ?? null,
                'care_icu' => $row['Care / ICU'] ?? null,
                'ttg_months' => $row['Treatment Time Gurantee (TTG)'] ?? null,
                'ttg_days' => $row['TTGs Days'] ?? null,
                'ttg_minimum_70_pct' => $row['1st Minimum = 70% of TTG'] ?? null,
                'ttg_alert_90_pct' => $row['2nd Alert = 90% of TTG'] ?? null,
            ]);

            $icd10 = $row['ICD -10'] ?? null;
            if ($icd10) {
                $codeStr = trim((string)$icd10);
                if (!empty($codeStr)) {
                    $codeModel = \App\Models\IcdCode::firstOrCreate(
                        ['version' => 'ICD-10-CM', 'code' => $codeStr],
                        ['description' => 'Imported from Master TTGs']
                    );

                    $procedure->icdCodes()->attach($codeModel->id, ['mapping_type' => 'Primary']);
                }
            }
        }
    }
}
