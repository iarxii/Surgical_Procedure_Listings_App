<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhoIcdAuthService
{
    private const TOKEN_CACHE_KEY = 'who_api_token';
    // Access token valid duration given by WHO is usually 3600s, caching for 55m
    private const CACHE_TTL = 3300; 

    public function getToken(): ?string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, self::CACHE_TTL, function () {
            // WHO Token URL
            $url = 'https://icdaccessmanagement.who.int/connect/token';
            $clientId = env('WHO_API_CLIENT_ID');
            $clientSecret = env('WHO_API_CLIENT_SECRET');

            try {
                $response = Http::asForm()->post($url, [
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'scope' => 'icdapi_access',
                    'grant_type' => 'client_credentials'
                ]);

                if ($response->successful()) {
                    return $response->json()['access_token'] ?? null;
                }

                Log::error('WHO API Token Error: ' . $response->body());
                return null;
            } catch (\Exception $e) {
                Log::error('WHO API Token Exception: ' . $e->getMessage());
                return null;
            }
        });
    }
}
