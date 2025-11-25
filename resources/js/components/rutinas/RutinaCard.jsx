import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Calendar, Dumbbell, Clock } from 'lucide-react';

const RutinaCard = ({ rutina, onIniciar, onVerDetalle }) => {
    const getDificultadColor = (dificultad) => {
        const colores = {
            facil: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            moderada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            dificil: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colores[dificultad] || 'bg-gray-100 text-gray-800';
    };

    const calcularProgreso = () => {
        if (!rutina.sesiones_completadas || !rutina.sesiones_totales) return 0;
        return Math.round((rutina.sesiones_completadas / rutina.sesiones_totales) * 100);
    };

    const progreso = calcularProgreso();

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{rutina.nombre}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Badge className={getDificultadColor(rutina.dificultad)}>
                                {rutina.dificultad}
                            </Badge>
                            {rutina.objetivo && (
                                <Badge variant="outline">
                                    {rutina.objetivo}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {rutina.descripcion}
                </p>

                {/* Información de la rutina */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Dumbbell className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                            {rutina.ejercicios_count || 0} ejercicios
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                            {rutina.duracion_estimada || 'N/A'} min
                        </span>
                    </div>
                    {rutina.frecuencia_semanal && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                {rutina.frecuencia_semanal}x por semana
                            </span>
                        </div>
                    )}
                </div>

                {/* Barra de progreso */}
                {rutina.sesiones_totales > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-medium">{progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progreso}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {rutina.sesiones_completadas} de {rutina.sesiones_totales} sesiones
                        </p>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                    <Button 
                        className="flex-1"
                        onClick={() => onIniciar(rutina.id)}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => onVerDetalle(rutina.id)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default RutinaCard;
