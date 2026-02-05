<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AIController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AchievementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Alle API-Endpunkte für die Gamification-Plattform.
| Prefix: /api
|
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'version' => '1.0.0',
    ]);
});

// AI Proxy Routes (OpenAI/Anthropic)
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AIController::class, 'chat']);
    Route::post('/validate-answer', [AIController::class, 'validateAnswer']);
    Route::post('/generate-task', [AIController::class, 'generateTask']);
    Route::post('/explain', [AIController::class, 'explain']);
});

// User Routes
Route::prefix('users')->group(function () {
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/stats', [UserController::class, 'stats']);
    Route::post('/xp', [UserController::class, 'addXP']);
    Route::post('/coins', [UserController::class, 'addCoins']);
});

// Task Routes
Route::prefix('tasks')->group(function () {
    Route::get('/', [TaskController::class, 'index']);
    Route::post('/', [TaskController::class, 'store']);
    Route::get('/{id}', [TaskController::class, 'show']);
    Route::put('/{id}', [TaskController::class, 'update']);
    Route::delete('/{id}', [TaskController::class, 'destroy']);
    Route::post('/{id}/attempt', [TaskController::class, 'recordAttempt']);
});

// Achievement Routes
Route::prefix('achievements')->group(function () {
    Route::get('/', [AchievementController::class, 'index']);
    Route::get('/user', [AchievementController::class, 'userAchievements']);
    Route::post('/check', [AchievementController::class, 'checkAchievements']);
});
