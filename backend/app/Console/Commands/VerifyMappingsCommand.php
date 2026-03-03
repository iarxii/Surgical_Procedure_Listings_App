<?php

namespace App\Console\Commands;

use App\Models\Procedure;
use App\Services\MappingVerificationService;
use Illuminate\Console\Command;

class VerifyMappingsCommand extends Command
{
    protected $signature = 'procedures:verify-mappings
                            {--specialty= : Only verify procedures of a specific speciality}
                            {--delay=200 : Delay in ms between API calls to avoid throttling}
                            {--verbose-debug : Show per-code verification results}';

    protected $description = 'Verify procedure ICD code mappings against external NIH and WHO APIs';

    public function handle(MappingVerificationService $service): int
    {
        $query = Procedure::with('icdCodes');

        if ($specialty = $this->option('specialty')) {
            $query->where('speciality', $specialty);
            $this->info("Filtering to speciality: {$specialty}");
        }

        $procedures = $query->get();
        $total = $procedures->count();
        $verbose = $this->option('verbose-debug');

        $this->info("Verifying {$total} procedures against external APIs...");
        if ($verbose) {
            $this->info("Verbose mode: showing per-code verification details.");
        }
        $this->newLine();

        $bar = null;
        if (!$verbose) {
            $bar = $this->output->createProgressBar($total);
            $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
            $bar->setMessage('Starting...');
            $bar->start();
        }

        $icd10Count = 0;
        $icd11Count = 0;
        $bothCount  = 0;
        $noneCount  = 0;
        $noCodesCount = 0;
        $delay = (int) $this->option('delay');

        foreach ($procedures as $i => $procedure) {
            if ($bar) {
                $bar->setMessage($procedure->procedure_name);
            }

            $result = $service->verify($procedure, $verbose);

            if ($verbose) {
                $status = [];
                if ($result['icd10_verified']) $status[] = '<fg=green>ICD-10 ✓</>';
                if ($result['icd11_verified']) $status[] = '<fg=cyan>ICD-11 ✓</>';
                if (empty($status)) $status[] = '<fg=red>✗ None</>';

                $this->line(sprintf(
                    "  [%d/%d] <fg=white;options=bold>%s</> — %s",
                    $i + 1, $total, $result['procedure'], implode(' ', $status)
                ));

                // Show per-code details
                if (!empty($result['icd10_details'])) {
                    foreach ($result['icd10_details'] as $code => $found) {
                        $icon = $found ? '<fg=green>✓</>' : '<fg=red>✗</>';
                        $this->line("      ICD-10 {$icon} {$code}");
                    }
                } elseif (empty($result['icd10_codes'])) {
                    $this->line("      <fg=yellow>No local ICD-10 codes</>");
                }

                if (!empty($result['icd11_details'])) {
                    foreach ($result['icd11_details'] as $code => $found) {
                        $icon = $found ? '<fg=cyan>✓</>' : '<fg=red>✗</>';
                        $this->line("      ICD-11 {$icon} {$code}");
                    }
                } elseif (empty($result['icd11_codes'])) {
                    $this->line("      <fg=yellow>No local ICD-11 codes</>");
                }
            }

            if ($result['icd10_verified'] && $result['icd11_verified']) {
                $bothCount++;
            } elseif ($result['icd10_verified']) {
                $icd10Count++;
            } elseif ($result['icd11_verified']) {
                $icd11Count++;
            } else {
                $noneCount++;
            }

            if (empty($result['icd10_codes']) && empty($result['icd11_codes'])) {
                $noCodesCount++;
            }

            if ($bar) $bar->advance();

            // Rate-limit to avoid API throttling
            if ($delay > 0) {
                usleep($delay * 1000);
            }
        }

        if ($bar) {
            $bar->setMessage('Done!');
            $bar->finish();
        }
        $this->newLine(2);

        // Summary table
        $this->table(
            ['Status', 'Count'],
            [
                ['ICD-10 + ICD-11 (both)',  $bothCount],
                ['ICD-10 only',             $icd10Count],
                ['ICD-11 only',             $icd11Count],
                ['Neither verified',        $noneCount],
                ['─────────────────',       '─────'],
                ['No local codes at all',   $noCodesCount],
                ['Total processed',         $total],
            ]
        );

        $verified = $bothCount + $icd10Count + $icd11Count;
        $this->info("✓ {$verified}/{$total} procedures have at least one verified mapping.");

        return self::SUCCESS;
    }
}
