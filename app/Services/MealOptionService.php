<?php

namespace App\Services;

use App\Models\Comida;
use Illuminate\Support\Facades\DB;

class MealOptionService
{
    /**
     * Agregar una opción de comida a un día y tipo específico
     * Máximo 2 opciones por turno
     */
    public function agregarOpcionComida($idDia, $tipoComida, $datosComida)
    {
        // Contar opciones existentes para este día y tipo
        $opcionesExistentes = Comida::where('id_dia', $idDia)
            ->where('tipo_comida', $tipoComida)
            ->count();
        
        // Validar límite de opciones
        if ($opcionesExistentes >= 2) {
            throw new \Exception('No se pueden agregar más de 2 opciones por turno de comida');
        }
        
        // Determinar el número de opción
        $numeroOpcion = $opcionesExistentes + 1;
        
        // Preparar datos de la comida
        $datosComida['id_dia'] = $idDia;
        $datosComida['tipo_comida'] = $tipoComida;
        $datosComida['opcion_numero'] = $numeroOpcion;
        $datosComida['es_alternativa'] = $numeroOpcion > 1;
        
        // Etiquetar automáticamente si no tiene nombre_opcion
        if (!isset($datosComida['nombre_opcion']) && $numeroOpcion > 1) {
            $datosComida['nombre_opcion'] = "Opción {$numeroOpcion}";
        }
        
        // Crear la comida
        return Comida::create($datosComida);
    }
    
    /**
     * Etiquetar opciones automáticamente para un día y tipo
     */
    public function etiquetarOpciones($idDia, $tipoComida)
    {
        $comidas = Comida::where('id_dia', $idDia)
            ->where('tipo_comida', $tipoComida)
            ->orderBy('opcion_numero')
            ->get();
        
        foreach ($comidas as $index => $comida) {
            $numeroOpcion = $index + 1;
            
            // Actualizar opcion_numero si es necesario
            if ($comida->opcion_numero != $numeroOpcion) {
                $comida->opcion_numero = $numeroOpcion;
            }
            
            // Marcar como alternativa si es opción 2 o mayor
            $comida->es_alternativa = $numeroOpcion > 1;
            
            // Etiquetar automáticamente si no tiene nombre personalizado
            if (!$comida->nombre_opcion && $numeroOpcion > 1) {
                $comida->nombre_opcion = "Opción {$numeroOpcion}";
            }
            
            $comida->save();
        }
        
        return $comidas;
    }
    
    /**
     * Validar que no se exceda el límite de opciones
     */
    public function validarLimiteOpciones($idDia, $tipoComida)
    {
        $count = Comida::where('id_dia', $idDia)
            ->where('tipo_comida', $tipoComida)
            ->count();
        
        return $count < 2;
    }
    
    /**
     * Obtener todas las opciones para un día y tipo
     */
    public function obtenerOpciones($idDia, $tipoComida)
    {
        return Comida::where('id_dia', $idDia)
            ->where('tipo_comida', $tipoComida)
            ->orderBy('opcion_numero')
            ->with(['alimentos', 'recetas'])
            ->get();
    }
    
    /**
     * Eliminar una opción y reordenar las restantes
     */
    public function eliminarOpcion($idComida)
    {
        $comida = Comida::findOrFail($idComida);
        $idDia = $comida->id_dia;
        $tipoComida = $comida->tipo_comida;
        
        DB::beginTransaction();
        try {
            // Eliminar la comida
            $comida->delete();
            
            // Reordenar las opciones restantes
            $this->etiquetarOpciones($idDia, $tipoComida);
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Reordenar opciones después de cambios
     */
    public function reordenarOpciones($idDia, $tipoComida, $ordenIds)
    {
        DB::beginTransaction();
        try {
            foreach ($ordenIds as $index => $idComida) {
                $comida = Comida::find($idComida);
                if ($comida) {
                    $numeroOpcion = $index + 1;
                    $comida->opcion_numero = $numeroOpcion;
                    $comida->es_alternativa = $numeroOpcion > 1;
                    
                    if (!$comida->nombre_opcion && $numeroOpcion > 1) {
                        $comida->nombre_opcion = "Opción {$numeroOpcion}";
                    }
                    
                    $comida->save();
                }
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
