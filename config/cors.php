<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'oauth/*', 'login', 'logout', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8081',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://192.168.0.88:8081',
        'http://192.168.0.88:5173',
        'http://192.168.0.88:3000',
        'http://192.168.0.88:8000',
        'http://172.30.1.49:8000',
        'http://172.30.1.49:5173',
        'http://172.30.1.49:3000',
        // Producción - Render
        env('APP_URL'),
        env('FRONTEND_URL'),
        'https://nutrisystem.onrender.com',
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
