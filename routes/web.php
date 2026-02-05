<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Diese Routes werden vom Frontend (SPA) genutzt.
| Alle Anfragen, die nicht mit /api beginnen, werden zur index.html weitergeleitet.
|
*/

// Serve the main SPA
Route::get('/', function () {
    return response()->file(base_path('index.html'));
});

// Serve static assets from root (CSS, JS, images)
Route::get('/{file}', function ($file) {
    $path = base_path($file);

    if (file_exists($path) && is_file($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeTypes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'html' => 'text/html',
        ];

        $contentType = $mimeTypes[$extension] ?? 'application/octet-stream';

        return response()->file($path, [
            'Content-Type' => $contentType,
        ]);
    }

    // Fallback to SPA for client-side routing
    return response()->file(base_path('index.html'));
})->where('file', '.*');
