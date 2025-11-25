import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Dumbbell } from 'lucide-react';

const EjercicioCard = ({ ejercicio, onVerDetalle }) => {
    const getNivelColor = (nivel) => {
        const colores = {
            principiante: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            avanzado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return colores[nivel] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{ejercicio.nombre}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Badge className={getNivelColor(ejercicio.nivel)}>
                                {ejercicio.nivel}
                            </Badge>
                            <Badge variant="outline">
                                {ejercicio.grupo_muscular}
                            </Badge>
                        </div>
                    </div>
                    <Dumbbell className="h-8 w-8 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {ejercicio.descripcion}
                </p>
                
                <div className="space-y-2 mb-4">
                    {ejercicio.equipamiento && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Equipamiento:</span>
                            <span className="font-medium">{ejercicio.equipamiento}</span>
                        </div>
                    )}
                    {ejercicio.calorias_por_minuto && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Calorías/min:</span>
                            <span className="font-medium">{ejercicio.calorias_por_minuto}</span>
                        </div>
                    )}
                </div>

                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onVerDetalle(ejercicio.id)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                </Button>
            </CardContent>
        </Card>
    );
};

export default EjercicioCard;
