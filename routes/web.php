<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Static files (HTML, CSS, JS, images) are served directly by Apache
| from the public/ directory. These routes handle dynamic content only.
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Fallback for SPA routing - serve index.html for non-API, non-file routes
Route::fallback(function () {
    return response()->file(public_path('index.html'));
});
