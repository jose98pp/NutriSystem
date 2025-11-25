<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/oauth/{provider}/redirect', [AuthController::class, 'oauthRedirect']);
Route::get('/oauth/{provider}/callback', [AuthController::class, 'oauthCallback']);

// Sirve la aplicación React solo para rutas específicas, no para API
Route::get('/{view?}', function () {
    return view('app');
})->where('view', '^(?!api).*$');
