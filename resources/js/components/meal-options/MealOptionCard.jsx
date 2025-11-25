import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

/**
 * Componente para mostrar una opción de comida a los pacientes
 * Feature: mejoras-sistema-core, Tarea 3.8
 */
const MealOptionCard = ({ 
    opcion,
    isSelected = false,
    onSelect,
    showDetails = false
}) => {
    const [expanded, setExpanded] = useState(showDetails);

    const calcularTotales = () => {
        if (!opcion.alimentos || opcion.alimentos.length === 0) {
            return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
        }

        return opcion.alimentos.reduce((totales, alimento) => {
            const factor = alimento.cantidad_gramos / 100;
            return {
                calorias: totales.calorias + ((alimento.calorias_por_100g || 0) * factor),
                proteinas: totales.proteinas + ((alimento.proteinas_por_100g || 0) * factor),
                carbohidratos: totales.carbohidratos + ((alimento.carbohidratos_por_100g || 0) * factor),
                grasas: totales.grasas + ((alimento.grasas_por_100g || 0) * factor)
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const totales = calcularTotales();
    const tieneAlimentos = opcion.alimentos && opcion.alimentos.length > 0;

    return (
        <Card 
            className={`
                transition-all duration-200 cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}
            `}
            onClick={() => onSelect && onSelect(opcion)}
        >
            <CardContent className="p-4">
                {/* Encabezado */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant={opcion.es_alternativa ? 'secondary' : 'default'}>
                            {opcion.nombre_opcion || (opcion.es_alternativa ? 'Opción 2' : 'Opción 1')}
                        </Badge>
                        {isSelected && (
                            <div className="flex items-center gap-1 text-blue-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm font-medium">Seleccionada</span>
                            </div>
                        )}
                    </div>
                    
                    {tieneAlimentos && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                        >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    )}
                </div>

                {/* Resumen nutricional */}
                {tieneAlimentos && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 bg-orange-50 rounded">
                            <p className="text-xs text-gray-600">Calorías</p>
                            <p className="font-semibold text-sm">{Math.round(totales.calorias)}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="text-xs text-gray-600">Proteínas</p>
                            <p className="font-semibold text-sm">{Math.round(totales.proteinas)}g</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-xs text-gray-600">Carbohidratos</p>
                            <p className="font-semibold text-sm">{Math.round(totales.carbohidratos)}g</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                            <p className="text-xs text-gray-600">Grasas</p>
                            <p className="font-semibold text-sm">{Math.round(totales.grasas)}g</p>
                        </div>
                    </div>
                )}

                {/* Lista de alimentos (expandible) */}
                {expanded && tieneAlimentos && (
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Alimentos:</p>
                        {opcion.alimentos.map((alimento, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{alimento.nombre}</p>
                                    <p className="text-xs text-gray-500">
                                        {Math.round((alimento.calorias_por_100g || 0) * alimento.cantidad_gramos / 100)} kcal
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{alimento.cantidad_gramos}g</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mensaje si no hay alimentos */}
                {!tieneAlimentos && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                            Esta opción aún no tiene alimentos asignados
                        </p>
                    </div>
                )}

                {/* Indicador de selección */}
                {onSelect && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(opcion);
                            }}
                        >
                            {isSelected ? 'Opción seleccionada' : 'Seleccionar esta opción'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MealOptionCard;
