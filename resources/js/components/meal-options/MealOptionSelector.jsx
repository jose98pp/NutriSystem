import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente para seleccionar y gestionar múltiples opciones de comidas (máximo 2)
 * Feature: mejoras-sistema-core, Tarea 3.7
 */
const MealOptionSelector = ({ 
    opciones = [],
    onOpcionesChange,
    alimentos = [],
    readonly = false,
    tipoComida = ''
}) => {
    const [busquedaAlimento, setBusquedaAlimento] = useState({});

    const agregarOpcion = () => {
        if (opciones.length >= 2) {
            toast.warning('Máximo 2 opciones por turno de comida');
            return;
        }

        const nuevaOpcion = {
            opcion_numero: opciones.length + 1,
            es_alternativa: opciones.length > 0,
            nombre_opcion: opciones.length === 0 ? 'Principal' : `Opción ${opciones.length + 1}`,
            alimentos: []
        };

        onOpcionesChange([...opciones, nuevaOpcion]);
        toast.success(`Opción ${opciones.length + 1} agregada`);
    };

    const eliminarOpcion = (opcionIndex) => {
        if (opciones.length === 1) {
            toast.warning('Debe haber al menos una opción de comida');
            return;
        }

        const nuevasOpciones = opciones.filter((_, index) => index !== opcionIndex);
        
        // Renumerar opciones
        nuevasOpciones.forEach((opcion, index) => {
            opcion.opcion_numero = index + 1;
            opcion.es_alternativa = index > 0;
            opcion.nombre_opcion = index === 0 ? 'Principal' : `Opción ${index + 1}`;
        });

        onOpcionesChange(nuevasOpciones);
        toast.success('Opción eliminada');
    };

    const copiarOpcion = (opcionIndex) => {
        if (opciones.length >= 2) {
            toast.warning('Máximo 2 opciones por turno de comida');
            return;
        }

        const opcionCopiada = JSON.parse(JSON.stringify(opciones[opcionIndex]));
        opcionCopiada.opcion_numero = opciones.length + 1;
        opcionCopiada.es_alternativa = true;
        opcionCopiada.nombre_opcion = `Opción ${opciones.length + 1}`;

        onOpcionesChange([...opciones, opcionCopiada]);
        toast.success('Opción copiada');
    };

    const agregarAlimento = (opcionIndex, alimento) => {
        const nuevasOpciones = [...opciones];
        const alimentoExiste = nuevasOpciones[opcionIndex].alimentos
            .find(a => a.id_alimento === alimento.id_alimento);

        if (alimentoExiste) {
            toast.warning('Este alimento ya está en esta opción');
            return;
        }

        nuevasOpciones[opcionIndex].alimentos.push({
            id_alimento: alimento.id_alimento,
            nombre: alimento.nombre,
            calorias_por_100g: alimento.calorias_por_100g,
            proteinas_por_100g: alimento.proteinas_por_100g,
            carbohidratos_por_100g: alimento.carbohidratos_por_100g,
            grasas_por_100g: alimento.grasas_por_100g,
            cantidad_gramos: 100
        });

        onOpcionesChange(nuevasOpciones);
        limpiarBusqueda(opcionIndex);
    };

    const actualizarCantidad = (opcionIndex, alimentoIndex, cantidad) => {
        const nuevasOpciones = [...opciones];
        nuevasOpciones[opcionIndex].alimentos[alimentoIndex].cantidad_gramos = parseFloat(cantidad) || 0;
        onOpcionesChange(nuevasOpciones);
    };

    const eliminarAlimento = (opcionIndex, alimentoIndex) => {
        const nuevasOpciones = [...opciones];
        nuevasOpciones[opcionIndex].alimentos.splice(alimentoIndex, 1);
        onOpcionesChange(nuevasOpciones);
    };

    const limpiarBusqueda = (opcionIndex) => {
        setBusquedaAlimento(prev => ({ ...prev, [opcionIndex]: '' }));
    };

    const calcularTotalesOpcion = (opcion) => {
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

    const alimentosFiltrados = (opcionIndex) => {
        const busqueda = busquedaAlimento[opcionIndex] || '';
        if (!busqueda) return [];
        
        return alimentos.filter(a => 
            a.nombre.toLowerCase().includes(busqueda.toLowerCase())
        ).slice(0, 5);
    };

    return (
        <div className="space-y-4">
            {/* Botón para agregar opción */}
            {!readonly && opciones.length < 2 && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={agregarOpcion}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar opción alternativa
                    </Button>
                </div>
            )}

            {/* Lista de opciones */}
            {opciones.map((opcion, opcionIndex) => {
                const totales = calcularTotalesOpcion(opcion);
                
                return (
                    <Card key={opcionIndex} className={`${opcion.es_alternativa ? 'border-blue-300' : 'border-green-300'}`}>
                        <CardContent className="p-4">
                            {/* Encabezado de la opción */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant={opcion.es_alternativa ? 'secondary' : 'default'}>
                                        {opcion.nombre_opcion}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        {opcion.alimentos.length} alimento{opcion.alimentos.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                {!readonly && (
                                    <div className="flex gap-2">
                                        {opciones.length < 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copiarOpcion(opcionIndex)}
                                                title="Copiar opción"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {opciones.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => eliminarOpcion(opcionIndex)}
                                                className="text-red-600 hover:text-red-700"
                                                title="Eliminar opción"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Búsqueda de alimentos */}
                            {!readonly && (
                                <div className="mb-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar alimento..."
                                            value={busquedaAlimento[opcionIndex] || ''}
                                            onChange={(e) => setBusquedaAlimento(prev => ({ 
                                                ...prev, 
                                                [opcionIndex]: e.target.value 
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        
                                        {/* Resultados de búsqueda */}
                                        {alimentosFiltrados(opcionIndex).length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {alimentosFiltrados(opcionIndex).map(alimento => (
                                                    <button
                                                        key={alimento.id_alimento}
                                                        type="button"
                                                        onClick={() => agregarAlimento(opcionIndex, alimento)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between items-center"
                                                    >
                                                        <span>{alimento.nombre}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {Math.round(alimento.calorias_por_100g)} kcal
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lista de alimentos */}
                            <div className="space-y-2 mb-4">
                                {opcion.alimentos.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No hay alimentos en esta opción
                                    </p>
                                ) : (
                                    opcion.alimentos.map((alimento, alimentoIndex) => (
                                        <div key={alimentoIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{alimento.nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    {Math.round((alimento.calorias_por_100g || 0) * alimento.cantidad_gramos / 100)} kcal
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={alimento.cantidad_gramos}
                                                    onChange={(e) => actualizarCantidad(opcionIndex, alimentoIndex, e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    min="0"
                                                    step="10"
                                                    disabled={readonly}
                                                />
                                                <span className="text-xs text-gray-500">g</span>
                                                
                                                {!readonly && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => eliminarAlimento(opcionIndex, alimentoIndex)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Totales nutricionales */}
                            {opcion.alimentos.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Calorías</p>
                                        <p className="font-semibold text-sm">{Math.round(totales.calorias)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Proteínas</p>
                                        <p className="font-semibold text-sm">{Math.round(totales.proteinas)}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Carbohidratos</p>
                                        <p className="font-semibold text-sm">{Math.round(totales.carbohidratos)}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Grasas</p>
                                        <p className="font-semibold text-sm">{Math.round(totales.grasas)}g</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Información sobre límite */}
            {opciones.length >= 2 && !readonly && (
                <div className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded">
                    Máximo 2 opciones por turno de comida alcanzado
                </div>
            )}
        </div>
    );
};

export default MealOptionSelector;
