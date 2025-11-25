<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Paciente;
use App\Models\Servicio;
use App\Models\Contrato;
use App\Models\Alimento;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Models\Ingesta;
use App\Models\Evaluacion;
use App\Models\Medicion;
use App\Models\ProgressPhoto;
use App\Models\Message;

class CompleteDataSeeder extends Seeder
{
    public function run()
    {
        // 1. USUARIOS Y NUTRICIONISTAS
        echo "Creando usuarios y nutricionistas...\n";
        
        // Admin
        User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@nutricion.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // Nutricionista 1
        $user1 = User::create([
            'name' => 'Dr. Carlos Ramírez',
            'email' => 'carlos@nutricion.com',
            'password' => Hash::make('password'),
            'role' => 'nutricionista'
        ]);

        $nutricionista1 = Nutricionista::create([
            'user_id' => $user1->id,
            'nombre' => 'Carlos',
            'apellido' => 'Ramírez',
            'email' => 'carlos@nutricion.com',
            'telefono' => '+1-555-1001',
            'especialidad' => 'Nutrición Deportiva'
        ]);

        // Nutricionista 2
        $user2 = User::create([
            'name' => 'Dra. María González',
            'email' => 'maria@nutricion.com',
            'password' => Hash::make('password'),
            'role' => 'nutricionista'
        ]);

        $nutricionista2 = Nutricionista::create([
            'user_id' => $user2->id,
            'nombre' => 'María',
            'apellido' => 'González',
            'email' => 'maria@nutricion.com',
            'telefono' => '+1-555-1002',
            'especialidad' => 'Nutrición Clínica'
        ]);

        // Nutricionista 3
        $user3 = User::create([
            'name' => 'Dr. Luis Martínez',
            'email' => 'luis@nutricion.com',
            'password' => Hash::make('password'),
            'role' => 'nutricionista'
        ]);

        $nutricionista3 = Nutricionista::create([
            'user_id' => $user3->id,
            'nombre' => 'Luis',
            'apellido' => 'Martínez',
            'email' => 'luis@nutricion.com',
            'telefono' => '+1-555-1003',
            'especialidad' => 'Nutrición Pediátrica'
        ]);

        // Array de nutricionistas para usar después
        $nutricionistas = [$nutricionista1, $nutricionista2, $nutricionista3];

        // 2. PACIENTES
        echo "Creando pacientes...\n";
        
        $pacientesData = [
            [
                'user' => ['name' => 'Juan Pérez', 'email' => 'juan@example.com'],
                'paciente' => [
                    'nombre' => 'Juan', 'apellido' => 'Pérez',
                    'fecha_nacimiento' => '1990-05-15', 'genero' => 'M',
                    'telefono' => '+1-555-0101', 'peso_inicial' => 80.0,
                    'estatura' => 1.75, 'alergias' => 'Intolerancia a la lactosa',
                    'id_nutricionista' => $nutricionista1->id_nutricionista
                ]
            ],
            [
                'user' => ['name' => 'Ana Martínez', 'email' => 'ana@example.com'],
                'paciente' => [
                    'nombre' => 'Ana', 'apellido' => 'Martínez',
                    'fecha_nacimiento' => '1985-08-22', 'genero' => 'F',
                    'telefono' => '+1-555-0102', 'peso_inicial' => 62.0,
                    'estatura' => 1.62, 'alergias' => 'Alergia al maní',
                    'id_nutricionista' => $nutricionista1->id_nutricionista
                ]
            ],
            [
                'user' => ['name' => 'Pedro García', 'email' => 'pedro@example.com'],
                'paciente' => [
                    'nombre' => 'Pedro', 'apellido' => 'García',
                    'fecha_nacimiento' => '1995-03-10', 'genero' => 'M',
                    'telefono' => '+1-555-0103', 'peso_inicial' => 90.0,
                    'estatura' => 1.80, 'alergias' => null,
                    'id_nutricionista' => $nutricionista2->id_nutricionista
                ]
            ],
            [
                'user' => ['name' => 'Laura Rodríguez', 'email' => 'laura@example.com'],
                'paciente' => [
                    'nombre' => 'Laura', 'apellido' => 'Rodríguez',
                    'fecha_nacimiento' => '1992-11-30', 'genero' => 'F',
                    'telefono' => '+1-555-0104', 'peso_inicial' => 68.0,
                    'estatura' => 1.68, 'alergias' => 'Hipotiroidismo controlado',
                    'id_nutricionista' => $nutricionista1->id_nutricionista
                ]
            ],
            [
                'user' => ['name' => 'Roberto Fernández', 'email' => 'roberto@example.com'],
                'paciente' => [
                    'nombre' => 'Roberto', 'apellido' => 'Fernández',
                    'fecha_nacimiento' => '1988-07-18', 'genero' => 'M',
                    'telefono' => '+1-555-0105', 'peso_inicial' => 78.0,
                    'estatura' => 1.72, 'alergias' => 'Diabetes tipo 2',
                    'id_nutricionista' => $nutricionista2->id_nutricionista
                ]
            ],
            [
                'user' => ['name' => 'Carmen López', 'email' => 'carmen@example.com'],
                'paciente' => [
                    'nombre' => 'Carmen', 'apellido' => 'López',
                    'fecha_nacimiento' => '1998-02-14', 'genero' => 'F',
                    'telefono' => '+1-555-0106', 'peso_inicial' => 58.0,
                    'estatura' => 1.60, 'alergias' => 'Celiaquía',
                    'id_nutricionista' => $nutricionista3->id_nutricionista
                ]
            ],
        ];

        $pacientes = [];
        foreach ($pacientesData as $data) {
            $user = User::create([
                'name' => $data['user']['name'],
                'email' => $data['user']['email'],
                'password' => Hash::make('password'),
                'role' => 'paciente'
            ]);

            $paciente = Paciente::create(array_merge(
                $data['paciente'],
                [
                    'user_id' => $user->id,
                    'email' => $data['user']['email']
                ]
            ));

            $pacientes[] = $paciente;
        }

        // 3. SERVICIOS
        echo "Creando servicios...\n";
        
        $servicios = [
            [
                'nombre' => 'Plan Nutricional Mensual',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 30,
                'costo' => 150.00,
                'descripcion' => 'Plan alimenticio personalizado con seguimiento mensual y ajustes semanales.'
            ],
            [
                'nombre' => 'Plan Nutricional Trimestral',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 90,
                'costo' => 400.00,
                'descripcion' => 'Plan alimenticio de 3 meses con seguimiento continuo y evaluaciones mensuales.'
            ],
            [
                'nombre' => 'Asesoramiento Nutricional Individual',
                'tipo_servicio' => 'asesoramiento',
                'duracion_dias' => 15,
                'costo' => 80.00,
                'descripcion' => 'Consulta individual con evaluación completa y recomendaciones personalizadas.'
            ],
            [
                'nombre' => 'Programa Deportivo',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 60,
                'costo' => 250.00,
                'descripcion' => 'Plan especializado para deportistas con objetivos de rendimiento.'
            ],
            [
                'nombre' => 'Catering Saludable Semanal',
                'tipo_servicio' => 'catering',
                'duracion_dias' => 7,
                'costo' => 120.00,
                'descripcion' => 'Servicio de comidas preparadas saludables entregadas a domicilio.'
            ],
        ];

        $serviciosCreados = [];
        foreach ($servicios as $servicio) {
            $serviciosCreados[] = Servicio::create($servicio);
        }

        // 4. CONTRATOS
        echo "Creando contratos...\n";
        
        $contratos = [
            [
                'id_paciente' => $pacientes[0]->id_paciente,
                'id_servicio' => $serviciosCreados[0]->id_servicio,
                'fecha_inicio' => now()->subDays(15),
                'fecha_fin' => now()->addDays(15),
                'costo_contratado' => 150.00,
                'estado' => 'ACTIVO',
                'observaciones' => 'Paciente con buen progreso'
            ],
            [
                'id_paciente' => $pacientes[1]->id_paciente,
                'id_servicio' => $serviciosCreados[1]->id_servicio,
                'fecha_inicio' => now()->subDays(30),
                'fecha_fin' => now()->addDays(60),
                'costo_contratado' => 400.00,
                'estado' => 'ACTIVO',
                'observaciones' => 'Plan trimestral en curso'
            ],
            [
                'id_paciente' => $pacientes[2]->id_paciente,
                'id_servicio' => $serviciosCreados[3]->id_servicio,
                'fecha_inicio' => now()->subDays(10),
                'fecha_fin' => now()->addDays(50),
                'costo_contratado' => 250.00,
                'estado' => 'ACTIVO',
                'observaciones' => 'Enfoque en rendimiento deportivo'
            ],
            [
                'id_paciente' => $pacientes[3]->id_paciente,
                'id_servicio' => $serviciosCreados[2]->id_servicio,
                'fecha_inicio' => now()->addDays(5),
                'fecha_fin' => now()->addDays(20),
                'costo_contratado' => 80.00,
                'estado' => 'PENDIENTE',
                'observaciones' => 'Primera consulta programada'
            ],
            [
                'id_paciente' => $pacientes[4]->id_paciente,
                'id_servicio' => $serviciosCreados[0]->id_servicio,
                'fecha_inicio' => now()->subDays(60),
                'fecha_fin' => now()->subDays(30),
                'costo_contratado' => 150.00,
                'estado' => 'FINALIZADO',
                'observaciones' => 'Completado con éxito'
            ],
        ];

        foreach ($contratos as $contrato) {
            Contrato::create($contrato);
        }

        // 5. ALIMENTOS (algunos básicos)
        echo "Creando alimentos básicos...\n";
        
        $alimentos = [
            ['nombre' => 'Pechuga de Pollo', 'categoria' => 'proteina', 'calorias_por_100g' => 165, 'proteinas_por_100g' => 31, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 3.6, 'restricciones' => null],
            ['nombre' => 'Arroz Integral', 'categoria' => 'cereal', 'calorias_por_100g' => 111, 'proteinas_por_100g' => 2.6, 'carbohidratos_por_100g' => 23, 'grasas_por_100g' => 0.9, 'restricciones' => null],
            ['nombre' => 'Brócoli', 'categoria' => 'verdura', 'calorias_por_100g' => 34, 'proteinas_por_100g' => 2.8, 'carbohidratos_por_100g' => 7, 'grasas_por_100g' => 0.4, 'restricciones' => null],
            ['nombre' => 'Aguacate', 'categoria' => 'grasa', 'calorias_por_100g' => 160, 'proteinas_por_100g' => 2, 'carbohidratos_por_100g' => 9, 'grasas_por_100g' => 15, 'restricciones' => null],
            ['nombre' => 'Huevo', 'categoria' => 'proteina', 'calorias_por_100g' => 155, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 1.1, 'grasas_por_100g' => 11, 'restricciones' => null],
            ['nombre' => 'Avena', 'categoria' => 'cereal', 'calorias_por_100g' => 389, 'proteinas_por_100g' => 16.9, 'carbohidratos_por_100g' => 66, 'grasas_por_100g' => 6.9, 'restricciones' => null],
            ['nombre' => 'Salmón', 'categoria' => 'proteina', 'calorias_por_100g' => 208, 'proteinas_por_100g' => 20, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 13, 'restricciones' => null],
            ['nombre' => 'Espinaca', 'categoria' => 'verdura', 'calorias_por_100g' => 23, 'proteinas_por_100g' => 2.9, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4, 'restricciones' => null],
            ['nombre' => 'Plátano', 'categoria' => 'fruta', 'calorias_por_100g' => 89, 'proteinas_por_100g' => 1.1, 'carbohidratos_por_100g' => 23, 'grasas_por_100g' => 0.3, 'restricciones' => null],
            ['nombre' => 'Almendras', 'categoria' => 'grasa', 'calorias_por_100g' => 579, 'proteinas_por_100g' => 21, 'carbohidratos_por_100g' => 22, 'grasas_por_100g' => 50, 'restricciones' => 'Alergia a frutos secos'],
            ['nombre' => 'Leche Descremada', 'categoria' => 'lacteo', 'calorias_por_100g' => 34, 'proteinas_por_100g' => 3.4, 'carbohidratos_por_100g' => 5, 'grasas_por_100g' => 0.1, 'restricciones' => 'Intolerancia a la lactosa'],
            ['nombre' => 'Pan Integral', 'categoria' => 'cereal', 'calorias_por_100g' => 247, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 41, 'grasas_por_100g' => 3.4, 'restricciones' => 'Celiaquía'],
            ['nombre' => 'Manzana', 'categoria' => 'fruta', 'calorias_por_100g' => 52, 'proteinas_por_100g' => 0.3, 'carbohidratos_por_100g' => 14, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            ['nombre' => 'Zanahoria', 'categoria' => 'verdura', 'calorias_por_100g' => 41, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 10, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            ['nombre' => 'Yogurt Natural', 'categoria' => 'lacteo', 'calorias_por_100g' => 59, 'proteinas_por_100g' => 10, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4, 'restricciones' => 'Intolerancia a la lactosa'],
        ];

        $alimentosCreados = [];
        foreach ($alimentos as $alimento) {
            $alimentosCreados[] = Alimento::create($alimento);
        }

        // 6. PLANES DE ALIMENTACIÓN (3 planes de ejemplo)
        echo "Creando planes de alimentación...\n";
        
        // Plan 1: Para Juan García (paciente de Carlos)
        $plan1 = PlanAlimentacion::create([
            'nombre' => 'Plan Deportivo - Juan García',
            'nombre_plan' => 'Plan Deportivo - Juan García',
            'descripcion' => 'Plan enfocado en ganancia muscular y rendimiento deportivo',
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addDays(30),
            'objetivo' => 'GANANCIA_MUSCULAR',
            'estado' => 'ACTIVO',
            'duracion_dias' => 30,
            'id_paciente' => $pacientes[0]->id_paciente,
            'id_nutricionista' => $nutricionistas[0]->id_nutricionista, // Carlos
        ]);

        // Día 1 del Plan 1
        $dia1 = PlanDia::create([
            'id_plan' => $plan1->id_plan,
            'dia_index' => 1,
        ]);

        // Desayuno
        $desayuno1 = Comida::create([
            'id_dia' => $dia1->id_dia,
            'tipo_comida' => 'DESAYUNO',
            'orden' => 1,
        ]);
        $desayuno1->alimentos()->attach([
            $alimentosCreados[5]->id_alimento => ['cantidad_gramos' => 80], // Avena
            $alimentosCreados[10]->id_alimento => ['cantidad_gramos' => 200], // Leche
            $alimentosCreados[8]->id_alimento => ['cantidad_gramos' => 100], // Plátano
        ]);

        // Almuerzo
        $almuerzo1 = Comida::create([
            'id_dia' => $dia1->id_dia,
            'tipo_comida' => 'ALMUERZO',
            'orden' => 2,
        ]);
        $almuerzo1->alimentos()->attach([
            $alimentosCreados[0]->id_alimento => ['cantidad_gramos' => 200], // Pechuga de pollo
            $alimentosCreados[1]->id_alimento => ['cantidad_gramos' => 150], // Arroz integral
            $alimentosCreados[2]->id_alimento => ['cantidad_gramos' => 100], // Brócoli
        ]);

        // Cena
        $cena1 = Comida::create([
            'id_dia' => $dia1->id_dia,
            'tipo_comida' => 'CENA',
            'orden' => 3,
        ]);
        $cena1->alimentos()->attach([
            $alimentosCreados[6]->id_alimento => ['cantidad_gramos' => 180], // Salmón
            $alimentosCreados[7]->id_alimento => ['cantidad_gramos' => 150], // Espinaca
            $alimentosCreados[3]->id_alimento => ['cantidad_gramos' => 50], // Aguacate
        ]);

        // Plan 2: Para Ana Martínez
        $plan2 = PlanAlimentacion::create([
            'nombre' => 'Plan Equilibrado - Ana Martínez',
            'nombre_plan' => 'Plan Equilibrado - Ana Martínez',
            'descripcion' => 'Plan balanceado para mantenimiento y salud general',
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addDays(90),
            'objetivo' => 'MANTENIMIENTO',
            'estado' => 'ACTIVO',
            'duracion_dias' => 90,
            'id_paciente' => $pacientes[1]->id_paciente,
            'id_nutricionista' => $nutricionistas[0]->id_nutricionista, // Carlos
        ]);

        // Día 1 del Plan 2
        $dia2 = PlanDia::create([
            'id_plan' => $plan2->id_plan,
            'dia_index' => 1,
        ]);

        // Desayuno
        $desayuno2 = Comida::create([
            'id_dia' => $dia2->id_dia,
            'tipo_comida' => 'DESAYUNO',
            'orden' => 1,
        ]);
        $desayuno2->alimentos()->attach([
            $alimentosCreados[11]->id_alimento => ['cantidad_gramos' => 60], // Pan integral
            $alimentosCreados[4]->id_alimento => ['cantidad_gramos' => 100], // Huevo
            $alimentosCreados[12]->id_alimento => ['cantidad_gramos' => 150], // Manzana
        ]);

        // Almuerzo
        $almuerzo2 = Comida::create([
            'id_dia' => $dia2->id_dia,
            'tipo_comida' => 'ALMUERZO',
            'orden' => 2,
        ]);
        $almuerzo2->alimentos()->attach([
            $alimentosCreados[0]->id_alimento => ['cantidad_gramos' => 150], // Pechuga de pollo
            $alimentosCreados[1]->id_alimento => ['cantidad_gramos' => 120], // Arroz integral
            $alimentosCreados[13]->id_alimento => ['cantidad_gramos' => 100], // Zanahoria
        ]);

        // Snack
        $snack2 = Comida::create([
            'id_dia' => $dia2->id_dia,
            'tipo_comida' => 'COLACION_VESPERTINA',
            'orden' => 3,
        ]);
        $snack2->alimentos()->attach([
            $alimentosCreados[14]->id_alimento => ['cantidad_gramos' => 150], // Yogurt
            $alimentosCreados[9]->id_alimento => ['cantidad_gramos' => 30], // Almendras
        ]);

        // Cena
        $cena2 = Comida::create([
            'id_dia' => $dia2->id_dia,
            'tipo_comida' => 'CENA',
            'orden' => 4,
        ]);
        $cena2->alimentos()->attach([
            $alimentosCreados[6]->id_alimento => ['cantidad_gramos' => 150], // Salmón
            $alimentosCreados[7]->id_alimento => ['cantidad_gramos' => 200], // Espinaca
        ]);

        // Plan 3: Para María Rodríguez
        $plan3 = PlanAlimentacion::create([
            'nombre' => 'Plan Fitness - María Rodríguez',
            'nombre_plan' => 'Plan Fitness - María Rodríguez',
            'descripcion' => 'Plan para pérdida de grasa y tonificación',
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addDays(60),
            'objetivo' => 'PERDIDA_PESO',
            'estado' => 'ACTIVO',
            'duracion_dias' => 60,
            'id_paciente' => $pacientes[3]->id_paciente,
            'id_nutricionista' => $nutricionistas[1]->id_nutricionista, // María López
        ]);

        // Día 1 del Plan 3
        $dia3 = PlanDia::create([
            'id_plan' => $plan3->id_plan,
            'dia_index' => 1,
        ]);

        // Desayuno
        $desayuno3 = Comida::create([
            'id_dia' => $dia3->id_dia,
            'tipo_comida' => 'DESAYUNO',
            'orden' => 1,
        ]);
        $desayuno3->alimentos()->attach([
            $alimentosCreados[5]->id_alimento => ['cantidad_gramos' => 60], // Avena
            $alimentosCreados[4]->id_alimento => ['cantidad_gramos' => 100], // Huevo
            $alimentosCreados[8]->id_alimento => ['cantidad_gramos' => 80], // Plátano
        ]);

        // Almuerzo
        $almuerzo3 = Comida::create([
            'id_dia' => $dia3->id_dia,
            'tipo_comida' => 'ALMUERZO',
            'orden' => 2,
        ]);
        $almuerzo3->alimentos()->attach([
            $alimentosCreados[0]->id_alimento => ['cantidad_gramos' => 180], // Pechuga de pollo
            $alimentosCreados[2]->id_alimento => ['cantidad_gramos' => 150], // Brócoli
            $alimentosCreados[13]->id_alimento => ['cantidad_gramos' => 100], // Zanahoria
        ]);

        // Cena
        $cena3 = Comida::create([
            'id_dia' => $dia3->id_dia,
            'tipo_comida' => 'CENA',
            'orden' => 3,
        ]);
        $cena3->alimentos()->attach([
            $alimentosCreados[6]->id_alimento => ['cantidad_gramos' => 150], // Salmón
            $alimentosCreados[7]->id_alimento => ['cantidad_gramos' => 180], // Espinaca
            $alimentosCreados[3]->id_alimento => ['cantidad_gramos' => 40], // Aguacate
        ]);

        // 7. EVALUACIONES (3 evaluaciones de ejemplo)
        echo "Creando evaluaciones...\n";
        
        // Evaluación 1: Inicial para Juan García
        $evaluacion1 = Evaluacion::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'id_nutricionista' => $nutricionistas[0]->id_nutricionista,
            'tipo' => 'INICIAL',
            'fecha' => now()->subDays(30),
            'observaciones' => 'Evaluación inicial. Paciente busca aumentar masa muscular.',
        ]);
        
        Medicion::create([
            'id_evaluacion' => $evaluacion1->id_evaluacion,
            'peso_kg' => 80.0,
            'altura_m' => 1.75,
            'porc_grasa' => 18.5,
            'masa_magra_kg' => 65.2,
            'cintura_cm' => 85.0,
            'cadera_cm' => 98.0,
            'brazo_cm' => 32.0,
            'pierna_cm' => 56.0,
        ]);

        // Evaluación 2: Periódica para Juan García
        $evaluacion2 = Evaluacion::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'id_nutricionista' => $nutricionistas[0]->id_nutricionista,
            'tipo' => 'PERIODICA',
            'fecha' => now()->subDays(15),
            'observaciones' => 'Progreso positivo. Aumento de masa muscular visible.',
        ]);
        
        Medicion::create([
            'id_evaluacion' => $evaluacion2->id_evaluacion,
            'peso_kg' => 82.5,
            'altura_m' => 1.75,
            'porc_grasa' => 17.2,
            'masa_magra_kg' => 68.3,
            'cintura_cm' => 84.0,
            'cadera_cm' => 99.0,
            'brazo_cm' => 33.5,
            'pierna_cm' => 57.5,
        ]);

        // Evaluación 3: Inicial para Ana Martínez
        $evaluacion3 = Evaluacion::create([
            'id_paciente' => $pacientes[1]->id_paciente,
            'id_nutricionista' => $nutricionistas[0]->id_nutricionista,
            'tipo' => 'INICIAL',
            'fecha' => now()->subDays(25),
            'observaciones' => 'Evaluación inicial. Objetivo: mantenimiento y salud general.',
        ]);
        
        Medicion::create([
            'id_evaluacion' => $evaluacion3->id_evaluacion,
            'peso_kg' => 62.0,
            'altura_m' => 1.65,
            'porc_grasa' => 24.5,
            'masa_magra_kg' => 46.8,
            'cintura_cm' => 72.0,
            'cadera_cm' => 95.0,
            'brazo_cm' => 26.0,
            'pierna_cm' => 52.0,
        ]);

        // 8. INGESTAS (5 ingestas de ejemplo de los últimos días)
        echo "Creando ingestas...\n";
        
        // Ingesta 1: Desayuno de Juan - Hoy
        $ingesta1 = Ingesta::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'fecha_hora' => now()->setTime(8, 30),
        ]);
        $ingesta1->alimentos()->attach([
            $alimentosCreados[5]->id_alimento => ['cantidad_gramos' => 80], // Avena
            $alimentosCreados[10]->id_alimento => ['cantidad_gramos' => 200], // Leche
            $alimentosCreados[8]->id_alimento => ['cantidad_gramos' => 100], // Plátano
        ]);

        // Ingesta 2: Almuerzo de Juan - Hoy
        $ingesta2 = Ingesta::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'fecha_hora' => now()->setTime(13, 0),
        ]);
        $ingesta2->alimentos()->attach([
            $alimentosCreados[0]->id_alimento => ['cantidad_gramos' => 200], // Pechuga de pollo
            $alimentosCreados[1]->id_alimento => ['cantidad_gramos' => 150], // Arroz integral
            $alimentosCreados[2]->id_alimento => ['cantidad_gramos' => 100], // Brócoli
        ]);

        // Ingesta 3: Cena de Juan - Ayer
        $ingesta3 = Ingesta::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'fecha_hora' => now()->subDay()->setTime(20, 0),
        ]);
        $ingesta3->alimentos()->attach([
            $alimentosCreados[6]->id_alimento => ['cantidad_gramos' => 180], // Salmón
            $alimentosCreados[7]->id_alimento => ['cantidad_gramos' => 150], // Espinaca
            $alimentosCreados[3]->id_alimento => ['cantidad_gramos' => 50], // Aguacate
        ]);

        // Ingesta 4: Desayuno de Ana - Hoy
        $ingesta4 = Ingesta::create([
            'id_paciente' => $pacientes[1]->id_paciente,
            'fecha_hora' => now()->setTime(7, 30),
        ]);
        $ingesta4->alimentos()->attach([
            $alimentosCreados[11]->id_alimento => ['cantidad_gramos' => 60], // Pan integral
            $alimentosCreados[4]->id_alimento => ['cantidad_gramos' => 100], // Huevo
            $alimentosCreados[12]->id_alimento => ['cantidad_gramos' => 150], // Manzana
        ]);

        // Ingesta 5: Snack de Ana - Hoy
        $ingesta5 = Ingesta::create([
            'id_paciente' => $pacientes[1]->id_paciente,
            'fecha_hora' => now()->setTime(16, 0),
        ]);
        $ingesta5->alimentos()->attach([
            $alimentosCreados[14]->id_alimento => ['cantidad_gramos' => 150], // Yogurt
            $alimentosCreados[9]->id_alimento => ['cantidad_gramos' => 30], // Almendras
        ]);

        // 9. FOTOS DE PROGRESO (4 fotos de ejemplo)
        echo "Creando fotos de progreso...\n";
        
        // Foto 1: Antes - Juan García
        ProgressPhoto::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'titulo' => 'Foto Inicial - Inicio del Plan',
            'descripcion' => 'Primera foto del proceso. Objetivo: aumentar masa muscular.',
            'foto_url' => 'progress_photos/placeholder_antes.jpg',
            'tipo' => 'antes',
            'peso_kg' => 80.0,
            'fecha' => now()->subDays(30),
        ]);

        // Foto 2: Durante - Juan García
        ProgressPhoto::create([
            'id_paciente' => $pacientes[0]->id_paciente,
            'titulo' => 'Progreso 15 días',
            'descripcion' => 'Se nota el aumento de masa muscular en brazos y pecho.',
            'foto_url' => 'progress_photos/placeholder_durante.jpg',
            'tipo' => 'durante',
            'peso_kg' => 82.5,
            'fecha' => now()->subDays(15),
        ]);

        // Foto 3: Antes - Ana Martínez
        ProgressPhoto::create([
            'id_paciente' => $pacientes[1]->id_paciente,
            'titulo' => 'Foto Inicial',
            'descripcion' => 'Inicio del plan de mantenimiento y salud general.',
            'foto_url' => 'progress_photos/placeholder_antes2.jpg',
            'tipo' => 'antes',
            'peso_kg' => 62.0,
            'fecha' => now()->subDays(25),
        ]);

        // Foto 4: Durante - Ana Martínez
        ProgressPhoto::create([
            'id_paciente' => $pacientes[1]->id_paciente,
            'titulo' => 'Progreso 10 días',
            'descripcion' => 'Mejora en la composición corporal y energía.',
            'foto_url' => 'progress_photos/placeholder_durante2.jpg',
            'tipo' => 'durante',
            'peso_kg' => 61.5,
            'fecha' => now()->subDays(10),
        ]);

        // 10. MENSAJES (Conversaciones de ejemplo)
        echo "Creando mensajes...\n";
        
        // Obtener usuarios para mensajes
        $userJuan = User::where('email', 'juan@example.com')->first();
        $userCarlos = User::where('email', 'carlos@nutricion.com')->first();
        $userAna = User::where('email', 'ana@example.com')->first();
        $userMaria = User::where('email', 'maria@nutricion.com')->first();

        // Conversación 1: Juan (paciente) con Carlos (nutricionista)
        Message::create([
            'id_remitente' => $userJuan->id,
            'id_destinatario' => $userCarlos->id,
            'mensaje' => 'Hola Dr. Carlos, tengo una duda sobre mi plan de alimentación.',
            'leido' => true,
            'created_at' => now()->subDays(2)->setTime(10, 30),
        ]);

        Message::create([
            'id_remitente' => $userCarlos->id,
            'id_destinatario' => $userJuan->id,
            'mensaje' => 'Hola Juan, claro que sí. ¿En qué te puedo ayudar?',
            'leido' => true,
            'created_at' => now()->subDays(2)->setTime(10, 45),
        ]);

        Message::create([
            'id_remitente' => $userJuan->id,
            'id_destinatario' => $userCarlos->id,
            'mensaje' => '¿Puedo sustituir el arroz integral por quinoa en el almuerzo?',
            'leido' => true,
            'created_at' => now()->subDays(2)->setTime(11, 0),
        ]);

        Message::create([
            'id_remitente' => $userCarlos->id,
            'id_destinatario' => $userJuan->id,
            'mensaje' => '¡Por supuesto! La quinoa es una excelente opción. Usa la misma cantidad que el arroz.',
            'leido' => true,
            'created_at' => now()->subDays(2)->setTime(11, 15),
        ]);

        Message::create([
            'id_remitente' => $userJuan->id,
            'id_destinatario' => $userCarlos->id,
            'mensaje' => 'Perfecto, muchas gracias. También quería comentarte que he notado buenos resultados.',
            'leido' => false,
            'created_at' => now()->subHours(3),
        ]);

        // Conversación 2: Ana (paciente) con Carlos (nutricionista)
        Message::create([
            'id_remitente' => $userAna->id,
            'id_destinatario' => $userCarlos->id,
            'mensaje' => 'Buenos días Dr. Carlos, ¿cuándo sería mi próxima evaluación?',
            'leido' => true,
            'created_at' => now()->subDays(1)->setTime(9, 0),
        ]);

        Message::create([
            'id_remitente' => $userCarlos->id,
            'id_destinatario' => $userAna->id,
            'mensaje' => 'Buenos días Ana. Tu próxima evaluación está programada para la próxima semana.',
            'leido' => true,
            'created_at' => now()->subDays(1)->setTime(9, 30),
        ]);

        Message::create([
            'id_remitente' => $userAna->id,
            'id_destinatario' => $userCarlos->id,
            'mensaje' => 'Genial, ahí estaré. Gracias!',
            'leido' => false,
            'created_at' => now()->subHours(12),
        ]);

        // Conversación 3: Juan con María (otro nutricionista)
        Message::create([
            'id_remitente' => $userJuan->id,
            'id_destinatario' => $userMaria->id,
            'mensaje' => 'Hola Dra. María, me recomendó el Dr. Carlos que consultara con usted sobre suplementación.',
            'leido' => false,
            'created_at' => now()->subHours(5),
        ]);

        echo "✅ Seeder completado exitosamente!\n";
        echo "Usuarios creados: 1 Admin, 3 Nutricionistas, 6 Pacientes\n";
        echo "Servicios creados: 5\n";
        echo "Contratos creados: 5\n";
        echo "Alimentos creados: 15\n";
        echo "Planes de Alimentación creados: 3 (con días y comidas)\n";
        echo "Evaluaciones creadas: 3 (con mediciones)\n";
        echo "Ingestas creadas: 5 (últimos 2 días)\n";
        echo "Fotos de Progreso creadas: 4\n";
        echo "Mensajes creados: 10 (3 conversaciones)\n";
        echo "\n📧 Credenciales de acceso:\n";
        echo "Admin: admin@nutricion.com / password\n";
        echo "Nutricionista 1: carlos@nutricion.com / password\n";
        echo "Nutricionista 2: maria@nutricion.com / password\n";
        echo "Paciente: juan@example.com / password\n";
    }
}
