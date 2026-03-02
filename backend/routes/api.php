<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProcedureController;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/search', [SearchController::class, 'search']);
Route::get('/procedures/catalog', [ProcedureController::class, 'catalog']);
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
