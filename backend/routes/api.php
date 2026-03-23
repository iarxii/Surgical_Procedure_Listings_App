<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProcedureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CommentController;

use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::middleware('admin')->group(function () {
        Route::post('/procedures/import', [ProcedureController::class, 'import']);
    });
});

Route::get('/search', [SearchController::class, 'search']);
Route::get('/search/by-procedure/{id}', [SearchController::class, 'searchByProcedure']);
Route::get('/procedures/catalog', [ProcedureController::class, 'catalog']);
Route::get('/procedures/specialities', [ProcedureController::class, 'specialities']);
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/comments', [CommentController::class, 'index']);
Route::post('/comments', [CommentController::class, 'store']);
