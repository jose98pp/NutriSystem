<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comida extends Model
{
    use HasFactory;

    protected $table = 'comidas';
    protected $primaryKey = 'id_comida';

    protected $fillable = [
        'id_dia',
        'tipo_comida',
        'hora_recomendada',
        'nombre',
        'descripcion',
        'instrucciones',
        'orden',
        'opcion_numero',
        'es_alternativa',
        'nombre_opcion',
    ];

    protected $casts = [
        'orden' => 'integer',
        'opcion_numero' => 'integer',
        'es_alternativa' => 'boolean',
    ];

    // Relaciones
    public function dia()
    {
        return $this->belongsTo(PlanDia::class, 'id_dia');
    }
    
    public function planDia()
    {
        return $this->belongsTo(PlanDia::class, 'id_dia', 'id_dia');
    }

    public function alimentos()
    {
        return $this->belongsToMany(Alimento::class, 'alimento_comida', 'id_comida', 'id_alimento')
                    ->withPivot('cantidad_gramos', 'id_alimento_comida')
                    ->withTimestamps();
    }

    public function recetas()
    {
        return $this->belongsToMany(Receta::class, 'comida_receta', 'id_comida', 'id_receta')
                    ->withPivot('porciones')
                    ->withTimestamps();
    }

    public function entregas()
    {
        return $this->hasMany(EntregaProgramada::class, 'id_comida', 'id_comida');
    }

    // Accessors y Mutators para opciones
    
    /**
     * Get the nombre_opcion attribute with automatic labeling
     */
    public function getNombreOpcionAttribute($value)
    {
        // Si ya tiene un nombre personalizado, usarlo
        if ($value) {
            return $value;
        }
        
        // Si no, generar automáticamente basado en opcion_numero
        if ($this->opcion_numero && $this->opcion_numero > 1) {
            return "Opción {$this->opcion_numero}";
        }
        
        return null;
    }
    
    /**
     * Set the opcion_numero attribute with validation
     */
    public function setOpcionNumeroAttribute($value)
    {
        // Validar que opcion_numero esté entre 1 y 2
        if ($value < 1 || $value > 2) {
            throw new \InvalidArgumentException('El número de opción debe estar entre 1 y 2');
        }
        
        $this->attributes['opcion_numero'] = $value;
    }
    
    /**
     * Scope para obtener solo la primera opción
     */
    public function scopePrimeraOpcion($query)
    {
        return $query->where('opcion_numero', 1);
    }
    
    /**
     * Scope para obtener opciones alternativas
     */
    public function scopeAlternativas($query)
    {
        return $query->where('opcion_numero', '>', 1);
    }
    
    /**
     * Scope para obtener comidas por día y tipo con todas sus opciones
     */
    public function scopeConOpciones($query, $idDia, $tipoComida)
    {
        return $query->where('id_dia', $idDia)
                    ->where('tipo_comida', $tipoComida)
                    ->orderBy('opcion_numero');
    }

    // Método helper para calcular totales nutricionales de la comida
    public function calcularTotales()
    {
        $totales = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
        ];

        foreach ($this->alimentos as $alimento) {
            $cantidad = $alimento->pivot->cantidad_gramos;
            $nutrientes = $alimento->calcularNutrientes($cantidad);
            
            $totales['calorias'] += $nutrientes['calorias'];
            $totales['proteinas'] += $nutrientes['proteinas'];
            $totales['carbohidratos'] += $nutrientes['carbohidratos'];
            $totales['grasas'] += $nutrientes['grasas'];
        }

        return $totales;
    }
}

