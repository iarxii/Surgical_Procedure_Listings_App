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
                'maxList' => 10
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
