<?php

namespace App\Services;

use App\Models\Alimento;
use App\Models\Comida;
use App\Models\Receta;
use Illuminate\Support\Facades\DB;

class AlimentoUsageChecker
{
    /**
     * Verificar si un alimento está en uso
     */
    public function verificarUso($idAlimento)
    {
        $enPlanesActivos = $this->verificarEnPlanesActivos($idAlimento);
        $enRecetas = $this->verificarEnRecetas($idAlimento);
        
        return [
            'en_uso' => $enPlanesActivos['en_uso'] || $enRecetas['en_uso'],
            'planes_activos' => $enPlanesActivos,
            'recetas' => $enRecetas,
            'puede_eliminar' => !($enPlanesActivos['en_uso'] || $enRecetas['en_uso'])
        ];
    }
    
    /**
     * Verificar si el alimento está en planes activos
     */
    public function verificarEnPlanesActivos($idAlimento)
    {
        $planesActivos = DB::table('comida_alimento')
            ->join('comidas', 'comida_alimento.id_comida', '=', 'comidas.id_comida')
            ->join('plan_dias', 'comidas.id_dia', '=', 'plan_dias.id_dia')
            ->join('planes_alimentacion', 'plan_dias.id_plan', '=', 'planes_alimentacion.id_plan')
            ->where('comida_alimento.id_alimento', $idAlimento)
            ->where('planes_alimentacion.fecha_fin', '>=', now())
            ->select(
                'planes_alimentacion.id_plan',
                'planes_alimentacion.nombre_plan',
                'planes_alimentacion.fecha_inicio',
                'planes_alimentacion.fecha_fin'
            )
            ->distinct()
            ->get();
        
        return [
            'en_uso' => $planesActivos->count() > 0,
            'cantidad' => $planesActivos->count(),
            'planes' => $planesActivos
        ];
    }
    
    /**
     * Verificar si el alimento está en recetas
     */
    public function verificarEnRecetas($idAlimento)
    {
        $recetas = DB::table('alimento_receta')
            ->join('recetas', 'alimento_receta.id_receta', '=', 'recetas.id_receta')
            ->where('alimento_receta.id_alimento', $idAlimento)
            ->select(
                'recetas.id_receta',
                'recetas.nombre',
                'recetas.descripcion'
            )
            ->get();
        
        return [
            'en_uso' => $recetas->count() > 0,
            'cantidad' => $recetas->count(),
            'recetas' => $recetas
        ];
    }
    
    /**
     * Obtener información detallada de uso
     */
    public function obtenerDetalleUso($idAlimento)
    {
        $alimento = Alimento::findOrFail($idAlimento);
        $uso = $this->verificarUso($idAlimento);
        
        return [
            'alimento' => $alimento,
            'uso' => $uso,
            'mensaje' => $this->generarMensajeUso($uso)
        ];
    }
    
    /**
     * Generar mensaje descriptivo del uso
     */
    private function generarMensajeUso($uso)
    {
        if (!$uso['en_uso']) {
            return 'Este alimento no está siendo utilizado y puede ser eliminado.';
        }
        
        $mensajes = [];
        
        if ($uso['planes_activos']['en_uso']) {
            $cantidad = $uso['planes_activos']['cantidad'];
            $mensajes[] = "Está en {$cantidad} plan(es) de alimentación activo(s)";
        }
        
        if ($uso['recetas']['en_uso']) {
            $cantidad = $uso['recetas']['cantidad'];
            $mensajes[] = "Está en {$cantidad} receta(s)";
        }
        
        return 'Este alimento está en uso: ' . implode(', ', $mensajes) . '. No puede ser eliminado.';
    }
}
