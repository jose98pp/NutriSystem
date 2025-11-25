import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

const TemporizadorDescanso = ({ segundos, onFinalizar, autoInicio = false }) => {
    const [tiempoRestante, setTiempoRestante] = useState(segundos);
    const [activo, setActivo] = useState(autoInicio);
    const [completado, setCompletado] = useState(false);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Crear audio para notificación
        audioRef.current = new Audio('/sounds/timer-complete.mp3');
        audioRef.current.volume = 0.5;

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (activo && tiempoRestante > 0) {
            intervalRef.current = setInterval(() => {
                setTiempoRestante((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setActivo(false);
                        setCompletado(true);
                        reproducirSonido();
                        if (onFinalizar) {
                            setTimeout(() => onFinalizar(), 500);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [activo, tiempoRestante, onFinalizar]);

    const reproducirSonido = () => {
        try {
            audioRef.current?.play().catch(err => {
                console.log('No se pudo reproducir el sonido:', err);
            });
        } catch (error) {
            console.log('Error al reproducir sonido:', error);
        }
    };

    const togglePausa = () => {
        setActivo(!activo);
    };

    const reiniciar = () => {
        setTiempoRestante(segundos);
        setActivo(false);
        setCompletado(false);
    };

    const saltar = () => {
        setTiempoRestante(0);
        setActivo(false);
        setCompletado(true);
        if (onFinalizar) {
            onFinalizar();
        }
    };

    const formatearTiempo = (segundos) => {
        const mins = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const porcentaje = ((segundos - tiempoRestante) / segundos) * 100;
    const circunferencia = 2 * Math.PI * 90;
    const offset = circunferencia - (porcentaje / 100) * circunferencia;

    return (
        <Card className={`${completado ? 'ring-2 ring-green-500' : activo ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                    {/* Temporizador circular */}
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Círculo de fondo */}
                            <circle
                                cx="96"
                                cy="96"
                                r="90"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            {/* Círculo de progreso */}
                            <circle
                                cx="96"
                                cy="96"
                                r="90"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={circunferencia}
                                strokeDashoffset={offset}
                                className={`transition-all duration-1000 ${
                                    completado
                                        ? 'text-green-500'
                                        : activo
                                        ? 'text-blue-500'
                                        : 'text-gray-400'
                                }`}
                                strokeLinecap="round"
                            />
                        </svg>
                        
                        {/* Tiempo en el centro */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${
                                completado
                                    ? 'text-green-600 dark:text-green-400'
                                    : activo
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}>
                                {formatearTiempo(tiempoRestante)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {completado ? '¡Listo!' : activo ? 'Descansando...' : 'En pausa'}
                            </span>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex gap-2">
                        {!completado && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={togglePausa}
                                    className="flex items-center gap-2"
                                >
                                    {activo ? (
                                        <>
                                            <Pause className="w-4 h-4" />
                                            Pausar
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Reanudar
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={reiniciar}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reiniciar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={saltar}
                                    className="flex items-center gap-2"
                                >
                                    <SkipForward className="w-4 h-4" />
                                    Saltar
                                </Button>
                            </>
                        )}
                        {completado && (
                            <Button
                                onClick={reiniciar}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reiniciar Descanso
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TemporizadorDescanso;
