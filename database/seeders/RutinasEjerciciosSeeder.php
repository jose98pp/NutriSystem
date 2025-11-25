<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GrupoMuscular;
use App\Models\Ejercicio;
use App\Models\Rutina;

class RutinasEjerciciosSeeder extends Seeder
{
    public function run(): void
    {
        // Crear grupos musculares
        $grupos = [
            ['nombre' => 'Pecho', 'nombre_cientifico' => 'Pectorales', 'zona_corporal' => 'superior', 'svg_path' => 'M150,100 L200,100 L200,150 L150,150 Z', 'color_hex' => '#EF4444', 'orden' => 1],
            ['nombre' => 'Espalda', 'nombre_cientifico' => 'Dorsales', 'zona_corporal' => 'superior', 'svg_path' => 'M150,100 L200,100 L200,150 L150,150 Z', 'color_hex' => '#F59E0B', 'orden' => 2],
            ['nombre' => 'Hombros', 'nombre_cientifico' => 'Deltoides', 'zona_corporal' => 'superior', 'svg_path' => 'M120,80 L150,100 L120,120 Z', 'color_hex' => '#10B981', 'orden' => 3],
            ['nombre' => 'Bíceps', 'nombre_cientifico' => 'Bíceps braquial', 'zona_corporal' => 'superior', 'svg_path' => 'M100,120 L120,120 L120,180 L100,180 Z', 'color_hex' => '#3B82F6', 'orden' => 4],
            ['nombre' => 'Tríceps', 'nombre_cientifico' => 'Tríceps braquial', 'zona_corporal' => 'superior', 'svg_path' => 'M230,120 L250,120 L250,180 L230,180 Z', 'color_hex' => '#8B5CF6', 'orden' => 5],
            ['nombre' => 'Abdominales', 'nombre_cientifico' => 'Recto abdominal', 'zona_corporal' => 'core', 'svg_path' => 'M150,160 L200,160 L200,220 L150,220 Z', 'color_hex' => '#EC4899', 'orden' => 6],
            ['nombre' => 'Oblicuos', 'nombre_cientifico' => 'Oblicuos externos', 'zona_corporal' => 'core', 'svg_path' => 'M130,160 L150,160 L150,220 L130,220 Z', 'color_hex' => '#F43F5E', 'orden' => 7],
            ['nombre' => 'Glúteos', 'nombre_cientifico' => 'Glúteo mayor', 'zona_corporal' => 'inferior', 'svg_path' => 'M150,230 L200,230 L200,260 L150,260 Z', 'color_hex' => '#14B8A6', 'orden' => 8],
            ['nombre' => 'Cuádriceps', 'nombre_cientifico' => 'Cuádriceps femoral', 'zona_corporal' => 'inferior', 'svg_path' => 'M150,260 L180,260 L180,350 L150,350 Z', 'color_hex' => '#06B6D4', 'orden' => 9],
            ['nombre' => 'Isquiotibiales', 'nombre_cientifico' => 'Bíceps femoral', 'zona_corporal' => 'inferior', 'svg_path' => 'M170,260 L200,260 L200,350 L170,350 Z', 'color_hex' => '#0EA5E9', 'orden' => 10],
            ['nombre' => 'Pantorrillas', 'nombre_cientifico' => 'Gastrocnemio', 'zona_corporal' => 'inferior', 'svg_path' => 'M150,350 L180,350 L180,400 L150,400 Z', 'color_hex' => '#6366F1', 'orden' => 11],
            ['nombre' => 'Antebrazos', 'nombre_cientifico' => 'Flexores del antebrazo', 'zona_corporal' => 'superior', 'svg_path' => 'M100,180 L120,180 L120,220 L100,220 Z', 'color_hex' => '#A855F7', 'orden' => 12],
        ];

        foreach ($grupos as $grupo) {
            GrupoMuscular::create($grupo);
        }

        // Obtener IDs de grupos musculares
        $pecho = GrupoMuscular::where('nombre', 'Pecho')->first();
        $espalda = GrupoMuscular::where('nombre', 'Espalda')->first();
        $hombros = GrupoMuscular::where('nombre', 'Hombros')->first();
        $biceps = GrupoMuscular::where('nombre', 'Bíceps')->first();
        $triceps = GrupoMuscular::where('nombre', 'Tríceps')->first();
        $abdominales = GrupoMuscular::where('nombre', 'Abdominales')->first();
        $gluteos = GrupoMuscular::where('nombre', 'Glúteos')->first();
        $cuadriceps = GrupoMuscular::where('nombre', 'Cuádriceps')->first();
        $isquiotibiales = GrupoMuscular::where('nombre', 'Isquiotibiales')->first();
        $pantorrillas = GrupoMuscular::where('nombre', 'Pantorrillas')->first();

        // Crear ejercicios
        $ejercicios = [
            [
                'nombre' => 'Flexiones de pecho',
                'descripcion' => 'Ejercicio clásico para fortalecer el pecho, hombros y tríceps',
                'instrucciones' => '1. Colócate en posición de plancha con las manos al ancho de los hombros\n2. Baja el cuerpo manteniendo la espalda recta\n3. Empuja hacia arriba hasta la posición inicial',
                'nivel_dificultad' => 'principiante',
                'tipo_ejercicio' => 'fuerza',
                'equipo_necesario' => 'Ninguno',
                'calorias_estimadas' => 7,
                'duracion_estimada' => 5,
                'grupos' => [$pecho->id, $triceps->id, $hombros->id],
            ],
            [
                'nombre' => 'Sentadillas',
                'descripcion' => 'Ejercicio fundamental para piernas y glúteos',
                'instrucciones' => '1. Párate con los pies al ancho de los hombros\n2. Baja como si fueras a sentarte\n3. Mantén la espalda recta y las rodillas alineadas\n4. Sube a la posición inicial',
                'nivel_dificultad' => 'principiante',
                'tipo_ejercicio' => 'fuerza',
                'equipo_necesario' => 'Ninguno',
                'calorias_estimadas' => 8,
                'duracion_estimada' => 5,
                'grupos' => [$cuadriceps->id, $gluteos->id],
            ],
            [
                'nombre' => 'Plancha',
                'descripcion' => 'Ejercicio isométrico para fortalecer el core',
                'instrucciones' => '1. Apóyate en los antebrazos y puntas de los pies\n2. Mantén el cuerpo recto como una tabla\n3. Contrae el abdomen\n4. Mantén la posición',
                'nivel_dificultad' => 'principiante',
                'tipo_ejercicio' => 'fuerza',
                'equipo_necesario' => 'Ninguno',
                'calorias_estimadas' => 5,
                'duracion_estimada' => 3,
                'grupos' => [$abdominales->id],
            ],
            [
                'nombre' => 'Dominadas',
                'descripcion' => 'Ejercicio avanzado para espalda y bíceps',
                'instrucciones' => '1. Agarra la barra con las palmas hacia adelante\n2. Cuelga con los brazos extendidos\n3. Tira hacia arriba hasta que la barbilla pase la barra\n4. Baja controladamente',
                'nivel_dificultad' => 'avanzado',
                'tipo_ejercicio' => 'fuerza',
                'equipo_necesario' => 'Barra de dominadas',
                'calorias_estimadas' => 10,
                'duracion_estimada' => 5,
                'grupos' => [$espalda->id, $biceps->id],
            ],
            [
                'nombre' => 'Burpees',
                'descripcion' => 'Ejercicio de cuerpo completo de alta intensidad',
                'instrucciones' => '1. Desde de pie, baja a posición de sentadilla\n2. Coloca las manos en el suelo y salta hacia atrás\n3. Haz una flexión\n4. Salta hacia adelante y salta verticalmente',
                'nivel_dificultad' => 'intermedio',
                'tipo_ejercicio' => 'cardio',
                'equipo_necesario' => 'Ninguno',
                'calorias_estimadas' => 12,
                'duracion_estimada' => 5,
                'grupos' => [$pecho->id, $cuadriceps->id, $abdominales->id],
            ],
        ];

        foreach ($ejercicios as $ejercicioData) {
            $grupos = $ejercicioData['grupos'];
            unset($ejercicioData['grupos']);
            
            $ejercicio = Ejercicio::create($ejercicioData);
            
            // Vincular grupos musculares
            foreach ($grupos as $index => $grupoId) {
                $ejercicio->gruposMusculares()->attach($grupoId, [
                    'es_principal' => $index === 0
                ]);
            }
        }

        // Crear rutinas predeterminadas
        $rutinaPrincipiante = Rutina::create([
            'nombre' => 'Rutina Principiante - Cuerpo Completo',
            'descripcion' => 'Rutina ideal para comenzar con ejercicio físico',
            'nivel_dificultad' => 'principiante',
            'duracion_estimada' => 30,
            'frecuencia_semanal' => 3,
            'objetivo' => 'Acondicionamiento físico general',
            'es_predeterminada' => true,
            'activo' => true,
        ]);

        // Agregar ejercicios a la rutina
        $rutinaPrincipiante->ejercicios()->attach(Ejercicio::where('nombre', 'Flexiones de pecho')->first()->id, [
            'orden' => 1,
            'series' => 3,
            'repeticiones' => '10-12',
            'descanso_segundos' => 60,
        ]);

        $rutinaPrincipiante->ejercicios()->attach(Ejercicio::where('nombre', 'Sentadillas')->first()->id, [
            'orden' => 2,
            'series' => 3,
            'repeticiones' => '15',
            'descanso_segundos' => 60,
        ]);

        $rutinaPrincipiante->ejercicios()->attach(Ejercicio::where('nombre', 'Plancha')->first()->id, [
            'orden' => 3,
            'series' => 3,
            'repeticiones' => '30 segundos',
            'descanso_segundos' => 45,
        ]);
    }
}
