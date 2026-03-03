<?php

namespace App\Services;

use App\Models\Procedure;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MappingVerificationService
{
    private WhoIcdAuthService $authService;

    public function __construct(WhoIcdAuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Verify a single procedure's ICD codes against external APIs.
     *
     * A procedure is only verified if specific ICD codes from the local DB
     * can be confirmed to exist in the external API. No name-based fallback.
     */
    public function verify(Procedure $procedure, bool $verbose = false): array
    {
        $codes = $procedure->icdCodes;
        $icd10Codes = $codes->where('version', 'ICD-10-CM')->pluck('code')->toArray();
        $icd11Codes = $codes->where('version', 'ICD-11')->pluck('code')->toArray();

        // Expand compound codes (e.g. "K04.7, K04.6, K12.2" → ["K04.7", "K04.6", "K12.2"])
        $icd10Codes = $this->expandCompoundCodes($icd10Codes);
        $icd11Codes = $this->expandCompoundCodes($icd11Codes);

        $icd10Verified = false;
        $icd11Verified = false;
        $icd10Details = [];
        $icd11Details = [];

        // Verify ICD-10-CM codes against NIH ClinicalTables
        foreach ($icd10Codes as $code) {
            $found = $this->verifyNihCode($code);
            $icd10Details[$code] = $found;
            if ($found) $icd10Verified = true;
        }

        // Verify ICD-11 codes against WHO API
        foreach ($icd11Codes as $code) {
            $found = $this->verifyWhoCode($code);
            $icd11Details[$code] = $found;
            if ($found) $icd11Verified = true;
        }

        $now = now();

        $procedure->update([
            'icd10_verified_at'   => $icd10Verified ? $now : null,
            'icd11_verified_at'   => $icd11Verified ? $now : null,
            'mapping_verified_at' => $now,
        ]);

        return [
            'procedure'      => $procedure->procedure_name,
            'icd10_verified'  => $icd10Verified,
            'icd11_verified'  => $icd11Verified,
            'icd10_codes'    => $icd10Codes,
            'icd11_codes'    => $icd11Codes,
            'icd10_details'  => $icd10Details,
            'icd11_details'  => $icd11Details,
        ];
    }

    /**
     * Expand compound codes like "K04.7, K04.6, K12.2" into individual codes.
     * Handles commas, semicolons, slashes, and spaces as delimiters.
     */
    private function expandCompoundCodes(array $codes): array
    {
        $expanded = [];
        foreach ($codes as $codeStr) {
            // Split on comma, semicolon, or slash (but not dots within codes)
            $parts = preg_split('/[,;\/]+/', $codeStr);
            foreach ($parts as $part) {
                $part = trim($part);
                // Must look like a valid ICD code: starts with letter or digit, at least 2 chars
                if (!empty($part) && strlen($part) >= 2 && preg_match('/^[A-Za-z0-9]/', $part)) {
                    $expanded[] = strtoupper($part);
                }
            }
        }
        return array_unique($expanded);
    }

    /**
     * Verify an ICD-10-CM code exists via NIH ClinicalTables API.
     */
    private function verifyNihCode(string $code): bool
    {
        try {
            $response = Http::timeout(10)->get('https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search', [
                'terms'   => $code,
                'sf'      => 'code',
                'df'      => 'code',
                'maxList' => 5,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                // $data[1] contains matched code strings
                if (isset($data[1]) && is_array($data[1])) {
                    foreach ($data[1] as $matchedCode) {
                        // Exact match or the searched code is a valid parent category
                        if (strcasecmp($matchedCode, $code) === 0 || str_starts_with($matchedCode, $code)) {
                            return true;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning("NIH verification failed for code {$code}: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Verify an ICD-11 code exists via WHO ICD-11 API.
     */
    private function verifyWhoCode(string $code): bool
    {
        $token = $this->authService->getToken();
        if (!$token) return false;

        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization'   => 'Bearer ' . $token,
                'Accept'          => 'application/json',
                'API-Version'     => 'v2',
                'Accept-Language' => 'en',
            ])->get('https://id.who.int/icd/release/11/2024-01/mms/search', [
                'q' => $code,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['destinationEntities'])) {
                    foreach ($data['destinationEntities'] as $entity) {
                        $theCode = $entity['theCode'] ?? '';
                        if (!empty($theCode) && strcasecmp($theCode, $code) === 0) {
                            return true;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning("WHO verification failed for code {$code}: " . $e->getMessage());
        }

        return false;
    }
}
