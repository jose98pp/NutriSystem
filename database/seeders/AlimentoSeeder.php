<?php

namespace Database\Seeders;

use App\Models\Alimento;
use Illuminate\Database\Seeder;

class AlimentoSeeder extends Seeder
{
    public function run(): void
    {
        $alimentos = [
            // Frutas
            ['nombre' => 'Manzana', 'categoria' => 'fruta', 'calorias_por_100g' => 52, 'proteinas_por_100g' => 0.3, 'carbohidratos_por_100g' => 14, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            ['nombre' => 'Banana', 'categoria' => 'fruta', 'calorias_por_100g' => 89, 'proteinas_por_100g' => 1.1, 'carbohidratos_por_100g' => 23, 'grasas_por_100g' => 0.3, 'restricciones' => null],
            ['nombre' => 'Naranja', 'categoria' => 'fruta', 'calorias_por_100g' => 47, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 12, 'grasas_por_100g' => 0.1, 'restricciones' => null],
            ['nombre' => 'Fresa', 'categoria' => 'fruta', 'calorias_por_100g' => 32, 'proteinas_por_100g' => 0.7, 'carbohidratos_por_100g' => 8, 'grasas_por_100g' => 0.3, 'restricciones' => null],
            ['nombre' => 'Pera', 'categoria' => 'fruta', 'calorias_por_100g' => 57, 'proteinas_por_100g' => 0.4, 'carbohidratos_por_100g' => 15, 'grasas_por_100g' => 0.1, 'restricciones' => null],
            
            // Verduras
            ['nombre' => 'Brócoli', 'categoria' => 'verdura', 'calorias_por_100g' => 34, 'proteinas_por_100g' => 2.8, 'carbohidratos_por_100g' => 7, 'grasas_por_100g' => 0.4, 'restricciones' => null],
            ['nombre' => 'Espinaca', 'categoria' => 'verdura', 'calorias_por_100g' => 23, 'proteinas_por_100g' => 2.9, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4, 'restricciones' => null],
            ['nombre' => 'Zanahoria', 'categoria' => 'verdura', 'calorias_por_100g' => 41, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 10, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            ['nombre' => 'Tomate', 'categoria' => 'verdura', 'calorias_por_100g' => 18, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 3.9, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            ['nombre' => 'Lechuga', 'categoria' => 'verdura', 'calorias_por_100g' => 15, 'proteinas_por_100g' => 1.4, 'carbohidratos_por_100g' => 2.9, 'grasas_por_100g' => 0.2, 'restricciones' => null],
            
            // Cereales
            ['nombre' => 'Arroz blanco', 'categoria' => 'cereal', 'calorias_por_100g' => 130, 'proteinas_por_100g' => 2.7, 'carbohidratos_por_100g' => 28, 'grasas_por_100g' => 0.3, 'restricciones' => null],
            ['nombre' => 'Avena', 'categoria' => 'cereal', 'calorias_por_100g' => 389, 'proteinas_por_100g' => 16.9, 'carbohidratos_por_100g' => 66, 'grasas_por_100g' => 6.9, 'restricciones' => 'Puede contener gluten'],
            ['nombre' => 'Pan integral', 'categoria' => 'cereal', 'calorias_por_100g' => 247, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 41, 'grasas_por_100g' => 3.5, 'restricciones' => 'Gluten'],
            ['nombre' => 'Pasta', 'categoria' => 'cereal', 'calorias_por_100g' => 371, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 75, 'grasas_por_100g' => 1.5, 'restricciones' => 'Gluten'],
            ['nombre' => 'Quinoa', 'categoria' => 'cereal', 'calorias_por_100g' => 368, 'proteinas_por_100g' => 14, 'carbohidratos_por_100g' => 64, 'grasas_por_100g' => 6, 'restricciones' => null],
            
            // Proteínas
            ['nombre' => 'Pollo pechuga', 'categoria' => 'proteina', 'calorias_por_100g' => 165, 'proteinas_por_100g' => 31, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 3.6, 'restricciones' => null],
            ['nombre' => 'Huevo', 'categoria' => 'proteina', 'calorias_por_100g' => 155, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 1.1, 'grasas_por_100g' => 11, 'restricciones' => null],
            ['nombre' => 'Atún', 'categoria' => 'proteina', 'calorias_por_100g' => 132, 'proteinas_por_100g' => 28, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 1.3, 'restricciones' => null],
            ['nombre' => 'Salmón', 'categoria' => 'proteina', 'calorias_por_100g' => 208, 'proteinas_por_100g' => 20, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 13, 'restricciones' => null],
            ['nombre' => 'Lentejas', 'categoria' => 'proteina', 'calorias_por_100g' => 116, 'proteinas_por_100g' => 9, 'carbohidratos_por_100g' => 20, 'grasas_por_100g' => 0.4, 'restricciones' => null],
            ['nombre' => 'Carne res', 'categoria' => 'proteina', 'calorias_por_100g' => 250, 'proteinas_por_100g' => 26, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 15, 'restricciones' => null],
            
            // Lácteos
            ['nombre' => 'Leche entera', 'categoria' => 'lacteo', 'calorias_por_100g' => 61, 'proteinas_por_100g' => 3.2, 'carbohidratos_por_100g' => 4.8, 'grasas_por_100g' => 3.3, 'restricciones' => 'Lactosa'],
            ['nombre' => 'Yogur natural', 'categoria' => 'lacteo', 'calorias_por_100g' => 59, 'proteinas_por_100g' => 10, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4, 'restricciones' => 'Lactosa'],
            ['nombre' => 'Queso fresco', 'categoria' => 'lacteo', 'calorias_por_100g' => 264, 'proteinas_por_100g' => 18, 'carbohidratos_por_100g' => 3.4, 'grasas_por_100g' => 21, 'restricciones' => 'Lactosa'],
            ['nombre' => 'Queso mozzarella', 'categoria' => 'lacteo', 'calorias_por_100g' => 280, 'proteinas_por_100g' => 28, 'carbohidratos_por_100g' => 2.2, 'grasas_por_100g' => 17, 'restricciones' => 'Lactosa'],
            
            // Grasas
            ['nombre' => 'Aguacate', 'categoria' => 'grasa', 'calorias_por_100g' => 160, 'proteinas_por_100g' => 2, 'carbohidratos_por_100g' => 9, 'grasas_por_100g' => 15, 'restricciones' => null],
            ['nombre' => 'Aceite de oliva', 'categoria' => 'grasa', 'calorias_por_100g' => 884, 'proteinas_por_100g' => 0, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 100, 'restricciones' => null],
            ['nombre' => 'Almendras', 'categoria' => 'grasa', 'calorias_por_100g' => 579, 'proteinas_por_100g' => 21, 'carbohidratos_por_100g' => 22, 'grasas_por_100g' => 50, 'restricciones' => 'Frutos secos'],
            ['nombre' => 'Nueces', 'categoria' => 'grasa', 'calorias_por_100g' => 654, 'proteinas_por_100g' => 15, 'carbohidratos_por_100g' => 14, 'grasas_por_100g' => 65, 'restricciones' => 'Frutos secos'],
            ['nombre' => 'Mantequilla de maní', 'categoria' => 'grasa', 'calorias_por_100g' => 588, 'proteinas_por_100g' => 25, 'carbohidratos_por_100g' => 20, 'grasas_por_100g' => 50, 'restricciones' => 'Cacahuates'],
        ];

        foreach ($alimentos as $alimento) {
            Alimento::create($alimento);
        }
    }
}
