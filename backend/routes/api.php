<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProcedureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CommentController;

Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/search', [SearchController::class, 'search']);
Route::get('/procedures/catalog', [ProcedureController::class, 'catalog']);
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/comments', [CommentController::class, 'index']);
Route::post('/comments', [CommentController::class, 'store']);
