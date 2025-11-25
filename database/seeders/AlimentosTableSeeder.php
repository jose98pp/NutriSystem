<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Alimento;

class AlimentosTableSeeder extends Seeder
{
    public function run()
    {
        $alimentos = [
            // Frutas
            ['nombre' => 'Manzana', 'categoria' => 'fruta', 'calorias_por_100g' => 52, 'proteinas_por_100g' => 0.3, 'carbohidratos_por_100g' => 14, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Plátano', 'categoria' => 'fruta', 'calorias_por_100g' => 89, 'proteinas_por_100g' => 1.1, 'carbohidratos_por_100g' => 23, 'grasas_por_100g' => 0.3],
            ['nombre' => 'Naranja', 'categoria' => 'fruta', 'calorias_por_100g' => 47, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 12, 'grasas_por_100g' => 0.1],
            ['nombre' => 'Fresa', 'categoria' => 'fruta', 'calorias_por_100g' => 32, 'proteinas_por_100g' => 0.7, 'carbohidratos_por_100g' => 8, 'grasas_por_100g' => 0.3],
            ['nombre' => 'Uva', 'categoria' => 'fruta', 'calorias_por_100g' => 69, 'proteinas_por_100g' => 0.7, 'carbohidratos_por_100g' => 18, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Sandía', 'categoria' => 'fruta', 'calorias_por_100g' => 30, 'proteinas_por_100g' => 0.6, 'carbohidratos_por_100g' => 8, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Piña', 'categoria' => 'fruta', 'calorias_por_100g' => 50, 'proteinas_por_100g' => 0.5, 'carbohidratos_por_100g' => 13, 'grasas_por_100g' => 0.1],
            
            // Verduras
            ['nombre' => 'Lechuga', 'categoria' => 'verdura', 'calorias_por_100g' => 15, 'proteinas_por_100g' => 1.4, 'carbohidratos_por_100g' => 2.9, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Tomate', 'categoria' => 'verdura', 'calorias_por_100g' => 18, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 3.9, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Zanahoria', 'categoria' => 'verdura', 'calorias_por_100g' => 41, 'proteinas_por_100g' => 0.9, 'carbohidratos_por_100g' => 10, 'grasas_por_100g' => 0.2],
            ['nombre' => 'Brócoli', 'categoria' => 'verdura', 'calorias_por_100g' => 34, 'proteinas_por_100g' => 2.8, 'carbohidratos_por_100g' => 7, 'grasas_por_100g' => 0.4],
            ['nombre' => 'Espinaca', 'categoria' => 'verdura', 'calorias_por_100g' => 23, 'proteinas_por_100g' => 2.9, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4],
            ['nombre' => 'Cebolla', 'categoria' => 'verdura', 'calorias_por_100g' => 40, 'proteinas_por_100g' => 1.1, 'carbohidratos_por_100g' => 9, 'grasas_por_100g' => 0.1],
            ['nombre' => 'Pepino', 'categoria' => 'verdura', 'calorias_por_100g' => 16, 'proteinas_por_100g' => 0.7, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.1],
            
            // Proteínas
            ['nombre' => 'Pechuga de Pollo', 'categoria' => 'proteina', 'calorias_por_100g' => 165, 'proteinas_por_100g' => 31, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 3.6],
            ['nombre' => 'Salmón', 'categoria' => 'proteina', 'calorias_por_100g' => 208, 'proteinas_por_100g' => 20, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 13],
            ['nombre' => 'Atún', 'categoria' => 'proteina', 'calorias_por_100g' => 132, 'proteinas_por_100g' => 28, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 1.3],
            ['nombre' => 'Huevo', 'categoria' => 'proteina', 'calorias_por_100g' => 155, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 1.1, 'grasas_por_100g' => 11],
            ['nombre' => 'Carne de Res', 'categoria' => 'proteina', 'calorias_por_100g' => 250, 'proteinas_por_100g' => 26, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 15],
            ['nombre' => 'Pavo', 'categoria' => 'proteina', 'calorias_por_100g' => 189, 'proteinas_por_100g' => 29, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 7],
            ['nombre' => 'Tofu', 'categoria' => 'proteina', 'calorias_por_100g' => 76, 'proteinas_por_100g' => 8, 'carbohidratos_por_100g' => 1.9, 'grasas_por_100g' => 4.8],
            
            // Carbohidratos/Cereales
            ['nombre' => 'Arroz Integral', 'categoria' => 'cereal', 'calorias_por_100g' => 111, 'proteinas_por_100g' => 2.6, 'carbohidratos_por_100g' => 23, 'grasas_por_100g' => 0.9],
            ['nombre' => 'Avena', 'categoria' => 'cereal', 'calorias_por_100g' => 389, 'proteinas_por_100g' => 17, 'carbohidratos_por_100g' => 66, 'grasas_por_100g' => 7],
            ['nombre' => 'Pan Integral', 'categoria' => 'cereal', 'calorias_por_100g' => 247, 'proteinas_por_100g' => 13, 'carbohidratos_por_100g' => 41, 'grasas_por_100g' => 4.2],
            ['nombre' => 'Pasta Integral', 'categoria' => 'cereal', 'calorias_por_100g' => 131, 'proteinas_por_100g' => 5, 'carbohidratos_por_100g' => 26, 'grasas_por_100g' => 1.1],
            ['nombre' => 'Quinoa', 'categoria' => 'cereal', 'calorias_por_100g' => 120, 'proteinas_por_100g' => 4.4, 'carbohidratos_por_100g' => 21, 'grasas_por_100g' => 1.9],
            ['nombre' => 'Papa', 'categoria' => 'cereal', 'calorias_por_100g' => 77, 'proteinas_por_100g' => 2, 'carbohidratos_por_100g' => 17, 'grasas_por_100g' => 0.1],
            ['nombre' => 'Batata', 'categoria' => 'cereal', 'calorias_por_100g' => 86, 'proteinas_por_100g' => 1.6, 'carbohidratos_por_100g' => 20, 'grasas_por_100g' => 0.1],
            
            // Lácteos
            ['nombre' => 'Leche Descremada', 'categoria' => 'lacteo', 'calorias_por_100g' => 34, 'proteinas_por_100g' => 3.4, 'carbohidratos_por_100g' => 5, 'grasas_por_100g' => 0.1],
            ['nombre' => 'Yogur Natural', 'categoria' => 'lacteo', 'calorias_por_100g' => 59, 'proteinas_por_100g' => 10, 'carbohidratos_por_100g' => 3.6, 'grasas_por_100g' => 0.4],
            ['nombre' => 'Queso Fresco', 'categoria' => 'lacteo', 'calorias_por_100g' => 264, 'proteinas_por_100g' => 18, 'carbohidratos_por_100g' => 3.1, 'grasas_por_100g' => 21],
            ['nombre' => 'Yogur Griego', 'categoria' => 'lacteo', 'calorias_por_100g' => 97, 'proteinas_por_100g' => 9, 'carbohidratos_por_100g' => 3.9, 'grasas_por_100g' => 5],
            
            // Legumbres
            ['nombre' => 'Lentejas', 'categoria' => 'otro', 'calorias_por_100g' => 116, 'proteinas_por_100g' => 9.0, 'carbohidratos_por_100g' => 20, 'grasas_por_100g' => 0.4],
            ['nombre' => 'Garbanzos', 'categoria' => 'otro', 'calorias_por_100g' => 164, 'proteinas_por_100g' => 8.9, 'carbohidratos_por_100g' => 27, 'grasas_por_100g' => 2.6],
            ['nombre' => 'Frijoles Negros', 'categoria' => 'otro', 'calorias_por_100g' => 132, 'proteinas_por_100g' => 8.9, 'carbohidratos_por_100g' => 24, 'grasas_por_100g' => 0.5],
            ['nombre' => 'Soja', 'categoria' => 'otro', 'calorias_por_100g' => 173, 'proteinas_por_100g' => 17, 'carbohidratos_por_100g' => 9.9, 'grasas_por_100g' => 9],
            
            // Frutos Secos
            ['nombre' => 'Almendras', 'categoria' => 'otro', 'calorias_por_100g' => 579, 'proteinas_por_100g' => 21, 'carbohidratos_por_100g' => 22, 'grasas_por_100g' => 50],
            ['nombre' => 'Nueces', 'categoria' => 'otro', 'calorias_por_100g' => 654, 'proteinas_por_100g' => 15, 'carbohidratos_por_100g' => 14, 'grasas_por_100g' => 65],
            ['nombre' => 'Pistachos', 'categoria' => 'otro', 'calorias_por_100g' => 560, 'proteinas_por_100g' => 20, 'carbohidratos_por_100g' => 28, 'grasas_por_100g' => 45],
            ['nombre' => 'Cacahuates', 'categoria' => 'otro', 'calorias_por_100g' => 567, 'proteinas_por_100g' => 26, 'carbohidratos_por_100g' => 16, 'grasas_por_100g' => 49],
            
            // Grasas Saludables
            ['nombre' => 'Aguacate', 'categoria' => 'grasa', 'calorias_por_100g' => 160, 'proteinas_por_100g' => 2, 'carbohidratos_por_100g' => 9, 'grasas_por_100g' => 15],
            ['nombre' => 'Aceite de Oliva', 'categoria' => 'grasa', 'calorias_por_100g' => 884, 'proteinas_por_100g' => 0, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 100],
            ['nombre' => 'Semillas de Chía', 'categoria' => 'grasa', 'calorias_por_100g' => 486, 'proteinas_por_100g' => 17, 'carbohidratos_por_100g' => 42, 'grasas_por_100g' => 31],
            
            // Bebidas
            ['nombre' => 'Té Verde', 'categoria' => 'otro', 'calorias_por_100g' => 1, 'proteinas_por_100g' => 0, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 0],
            ['nombre' => 'Café Negro', 'categoria' => 'otro', 'calorias_por_100g' => 2, 'proteinas_por_100g' => 0.3, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 0],
            ['nombre' => 'Agua', 'categoria' => 'otro', 'calorias_por_100g' => 0, 'proteinas_por_100g' => 0, 'carbohidratos_por_100g' => 0, 'grasas_por_100g' => 0],
        ];

        foreach ($alimentos as $alimento) {
            Alimento::create($alimento);
        }
    }
}
