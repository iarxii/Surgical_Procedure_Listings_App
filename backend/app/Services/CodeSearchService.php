<?php

namespace App\Services;

use App\Models\Procedure;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodeSearchService
{
    private WhoIcdAuthService $authService;

    public function __construct(WhoIcdAuthService $authService)
    {
        $this->authService = $authService;
    }

    public function search(string $query, ?string $specialty = null): array
    {
        // ICD codes are canonically uppercase (e.g. K60.311, C50.9, BA52.0, 2C6Z).
        // Detect code-like patterns: letter(s)+digit, digit+letter, or alphanumeric with dots/ampersands.
        // Leave free-text name searches (e.g. "breast cancer") untouched.
        if (preg_match('/^[a-zA-Z]{1,2}\d|^\d+[a-zA-Z]/', $query)) {
            $query = strtoupper($query);
        }

        $localResults = $this->searchLocal($query, $specialty);
        $nihResults = $this->searchNih($query);
        $whoResults = $this->searchWho($query);

        return [
            'query' => $query,
            'specialty' => $specialty,
            'local_procedures' => $localResults,
            'icd10_suggestions' => $nihResults,
            'icd11_suggestions' => $whoResults,
        ];
    }

    /**
     * Search by procedure: uses ICD codes as primary search parameters.
     */
    public function searchByProcedure(Procedure $procedure): array
    {
        $codes = $procedure->icdCodes;

        // Get unique main codes and individual sub-codes
        $mainCodes = $codes->pluck('main_code')->unique()->filter()->values()->toArray();
        $subCodes = $codes->pluck('code')->unique()->filter()->values()->toArray();

        // Collect all ICD-10 and ICD-11 results
        $icd10Results = [];
        $icd11Results = [];
        $seenIcd10Codes = [];
        $seenIcd11Codes = [];

        // Strategy 1: Search by main code (category-level, e.g. "C50")
        foreach ($mainCodes as $mainCode) {
            $nihHits = $this->searchNih($mainCode);
            foreach ($nihHits as $hit) {
                if (!isset($seenIcd10Codes[$hit['code']])) {
                    $hit['match_source'] = 'code';
                    $hit['matched_query'] = $mainCode;
                    $icd10Results[] = $hit;
                    $seenIcd10Codes[$hit['code']] = true;
                }
            }

            $whoHits = $this->searchWho($mainCode);
            foreach ($whoHits as $hit) {
                if (!empty($hit['code']) && !isset($seenIcd11Codes[$hit['code']])) {
                    $hit['match_source'] = 'code';
                    $hit['matched_query'] = $mainCode;
                    $icd11Results[] = $hit;
                    $seenIcd11Codes[$hit['code']] = true;
                }
            }
        }

        // Strategy 2: Search by full sub-code (e.g. "C50.9") for precision
        foreach ($subCodes as $subCode) {
            // Skip if same as main code (already searched)
            if (in_array(strtoupper($subCode), array_map('strtoupper', $mainCodes))) continue;

            $nihHits = $this->searchNih($subCode);
            foreach ($nihHits as $hit) {
                if (!isset($seenIcd10Codes[$hit['code']])) {
                    $hit['match_source'] = 'sub_code';
                    $hit['matched_query'] = $subCode;
                    $icd10Results[] = $hit;
                    $seenIcd10Codes[$hit['code']] = true;
                }
            }
        }

        // Strategy 3: Search by procedure name (supplementary)
        $nihByName = $this->searchNih($procedure->procedure_name);
        foreach ($nihByName as $hit) {
            if (!isset($seenIcd10Codes[$hit['code']])) {
                $hit['match_source'] = 'name';
                $hit['matched_query'] = $procedure->procedure_name;
                $icd10Results[] = $hit;
                $seenIcd10Codes[$hit['code']] = true;
            }
        }

        $whoByName = $this->searchWho($procedure->procedure_name);
        foreach ($whoByName as $hit) {
            if (!empty($hit['code']) && !isset($seenIcd11Codes[$hit['code']])) {
                $hit['match_source'] = 'name';
                $hit['matched_query'] = $procedure->procedure_name;
                $icd11Results[] = $hit;
                $seenIcd11Codes[$hit['code']] = true;
            }
        }

        return [
            'query' => $procedure->procedure_name,
            'procedure' => $procedure,
            'local_procedures' => [$procedure],
            'local_codes' => $codes,
            'search_strategies' => [
                'main_codes' => $mainCodes,
                'sub_codes' => $subCodes,
             ],
            'icd10_suggestions' => $icd10Results,
            'icd11_suggestions' => $icd11Results,
        ];
    }

    private function searchLocal(string $query, ?string $specialty)
    {
        $q = Procedure::with('icdCodes')
            ->where('procedure_name', 'LIKE', '%' . $query . '%');

        if ($specialty) {
            $q->where('speciality', $specialty);
        }

        return $q->take(10)->get();
    }

    private function searchNih(string $query): array
    {
        try {
            $response = Http::get('https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search', [
                'terms' => $query,
                'sf' => 'code,name',
                'df' => 'code,name',
                'maxList' => 25
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data[3]) && is_array($data[3])) {
                    $results = [];
                    foreach ($data[3] as $item) {
                        $results[] = [
                            'code' => $item[0],
                            'title' => $item[1]
                        ];
                    }
                    return $results;
                }
            }
        } catch (\Exception $e) {
            Log::error('NIH API Error: ' . $e->getMessage());
        }

        return [];
    }

    private function searchWho(string $query): array
    {
        $token = $this->authService->getToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Accept' => 'application/json',
                'API-Version' => 'v2',
                'Accept-Language' => 'en'
            ])->get('https://id.who.int/icd/release/11/2024-01/mms/search', [
                'q' => $query
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['destinationEntities'])) {
                    $results = [];
                    $count = 0;
                    foreach ($data['destinationEntities'] as $entity) {
                        $code = $entity['theCode'] ?? '';
                        $title = isset($entity['title']) ? strip_tags($entity['title']) : '';
                        
                        // Ignore entries without code and title
                        if (empty($code) && empty($title)) continue;

                        $results[] = [
                            'code' => $code,
                            'title' => $title
                        ];
                        $count++;
                        if ($count >= 10) break;
                    }
                    return $results;
                }
            } else {
                 Log::error('WHO API Request Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('WHO API Exception: ' . $e->getMessage());
        }

        return [];
    }
}
