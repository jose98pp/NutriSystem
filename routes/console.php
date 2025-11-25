<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Programar notificaciones de comidas cada 15 minutos
Schedule::command('notificaciones:comidas')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Programar limpieza de sesiones huérfanas cada 15 minutos
Schedule::command('videollamadas:cleanup')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();
