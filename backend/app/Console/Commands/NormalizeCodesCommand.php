<?php

namespace App\Console\Commands;

use App\Models\IcdCode;
use App\Models\Procedure;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class NormalizeCodesCommand extends Command
{
    protected $signature = 'procedures:normalize-codes
                            {--dry-run : Show what would change without modifying DB}
                            {--enrich : Fetch descriptions from NIH API for ICD-10 codes}';

    protected $description = 'Normalize compound ICD codes, compute main_code, remove non-code entries';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $enrich = $this->option('enrich');

        if ($dryRun) {
            $this->warn('DRY RUN — no changes will be made.');
        }

        $this->info('Step 1: Splitting compound codes...');
        $this->splitCompoundCodes($dryRun);

        $this->newLine();
        $this->info('Step 2: Removing non-code entries...');
        $this->removeNonCodes($dryRun);

        $this->newLine();
        $this->info('Step 3: Computing main_code for all entries...');
        $this->computeMainCodes($dryRun);

        if ($enrich) {
            $this->newLine();
            $this->info('Step 4: Enriching descriptions from NIH API...');
            $this->enrichDescriptions($dryRun);
        }

        $this->newLine();
        $this->info('✓ Normalization complete.');

        // Summary
        $total = IcdCode::count();
        $withMain = IcdCode::whereNotNull('main_code')->count();
        $this->table(['Metric', 'Count'], [
            ['Total ICD codes', $total],
            ['With main_code', $withMain],
            ['Without main_code', $total - $withMain],
        ]);

        return self::SUCCESS;
    }

    private function splitCompoundCodes(bool $dryRun): void
    {
        $compoundPattern = '/[,;]+/';
        $compounds = IcdCode::where('code', 'REGEXP', '[,;]')->get();

        $splitCount = 0;
        foreach ($compounds as $code) {
            $parts = preg_split($compoundPattern, $code->code);
            $validParts = [];

            foreach ($parts as $part) {
                $part = trim($part);
                if (!empty($part) && strlen($part) >= 2 && preg_match('/^[A-Za-z0-9]/', $part)) {
                    $validParts[] = strtoupper($part);
                }
            }

            if (count($validParts) <= 1) continue;

            // Get all procedures linked to this compound code
            $procedureIds = $code->procedures()->pluck('procedures.id')->toArray();

            $this->line("  Split: <fg=yellow>{$code->code}</> → <fg=green>" . implode(', ', $validParts) . "</>");

            if (!$dryRun) {
                foreach ($validParts as $newCode) {
                    $newModel = IcdCode::firstOrCreate(
                        ['version' => $code->version, 'code' => $newCode],
                        ['description' => $code->description]
                    );

                    // Link to same procedures
                    foreach ($procedureIds as $procId) {
                        $newModel->procedures()->syncWithoutDetaching([$procId => ['mapping_type' => 'Primary']]);
                    }
                }

                // Remove the old compound entry and its pivot rows
                $code->procedures()->detach();
                $code->delete();
            }
            $splitCount++;
        }

        $this->info("  {$splitCount} compound entries " . ($dryRun ? 'would be' : '') . " split.");
    }

    private function removeNonCodes(bool $dryRun): void
    {
        // ICD codes must start with a letter followed by a digit, or a digit
        $nonCodes = IcdCode::get()->filter(function ($code) {
            $c = trim($code->code);
            return !preg_match('/^[A-Za-z]\d/', $c) && !preg_match('/^\d[A-Za-z0-9]/', $c);
        });

        foreach ($nonCodes as $code) {
            $this->line("  Remove: <fg=red>{$code->code}</> (version: {$code->version})");
            if (!$dryRun) {
                $code->procedures()->detach();
                $code->delete();
            }
        }

        $this->info("  {$nonCodes->count()} non-code entries " . ($dryRun ? 'would be' : '') . " removed.");
    }

    private function computeMainCodes(bool $dryRun): void
    {
        $codes = IcdCode::all();
        $updated = 0;

        foreach ($codes as $code) {
            $raw = trim($code->code);

            // Extract main code: everything before the decimal, or entire code if no decimal
            if (str_contains($raw, '.')) {
                $mainCode = strtoupper(substr($raw, 0, strpos($raw, '.')));
            } else {
                // For ICD-11 codes like "2D02" or ICD-10 category codes like "C50"
                $mainCode = strtoupper($raw);
            }

            // Limit to 5 chars (safety)
            $mainCode = substr($mainCode, 0, 5);

            if ($code->main_code !== $mainCode) {
                if (!$dryRun) {
                    $code->update(['main_code' => $mainCode]);
                }
                $updated++;
            }
        }

        $this->info("  {$updated} codes " . ($dryRun ? 'would be' : '') . " updated with main_code.");
    }

    private function enrichDescriptions(bool $dryRun): void
    {
        $codes = IcdCode::where('version', 'ICD-10-CM')
            ->where(function ($q) {
                $q->whereNull('description')
                  ->orWhere('description', 'Imported from Master TTGs');
            })
            ->get();

        $enriched = 0;
        foreach ($codes as $code) {
            try {
                $response = Http::timeout(10)->get('https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search', [
                    'terms' => $code->code,
                    'sf' => 'code',
                    'df' => 'code,name',
                    'maxList' => 3,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data[3]) && is_array($data[3])) {
                        foreach ($data[3] as $item) {
                            if (strcasecmp($item[0], $code->code) === 0 || str_starts_with($item[0], $code->code)) {
                                $desc = $item[1] ?? '';
                                if (!empty($desc) && !$dryRun) {
                                    $code->update(['description' => $desc]);
                                    $enriched++;
                                    $this->line("  Enriched: <fg=green>{$code->code}</> → {$desc}");
                                }
                                break;
                            }
                        }
                    }
                }

                usleep(100000); // 100ms rate limit
            } catch (\Exception $e) {
                $this->warn("  Failed to enrich {$code->code}: {$e->getMessage()}");
            }
        }

        $this->info("  {$enriched} descriptions enriched from NIH API.");
    }
}
