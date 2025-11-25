import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Play, Pause, CheckCircle, Circle, Clock, Zap, 
    ArrowLeft, Flag, AlertTriangle, ChevronDown, ChevronUp 
} from 'lucide-react';
import TemporizadorDescanso from '@/components/rutinas/TemporizadorDescanso';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const SesionEntrenamiento = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sesion, setSesion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enCurso, setEnCurso] = useState(false);
    const [mostrarNotas, setMostrarNotas] = useState(false);
    const [notas, setNotas] = useState('');

    useEffect(() => {
        const cargarSesion = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/sesiones-entrenamiento/${id}`);
                setSesion(response.data);
                setNotas(response.data.notas || '');
            } catch (error) {
                console.error('Error al cargar sesión:', error);
                toast.error('Error al cargar la sesión de entrenamiento');
                navigate('/rutinas');
            } finally {
                setLoading(false);
            }
        };
        
        cargarSesion();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando sesión...</p>
                </div>
            </div>
        );
    }

    if (!sesion) {
        return (
            <div className="p-6 text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Sesión no encontrada</h2>
                <Button onClick={() => navigate('/rutinas')}>
                    Volver a mis rutinas
                </Button>
            </div>
        );
    }

    const iniciarPausar = () => {
        setEnCurso((prev) => !prev);
    };

    const guardarNotas = async () => {
        try {
            await api.put(`/sesiones-entrenamiento/${id}`, { notas });
            toast.success('Notas guardadas');
        } catch (error) {
            toast.error('Error al guardar notas');
        }
    };

    const completarSesion = async () => {
        try {
            await api.post(`/sesiones-entrenamiento/${id}/completar`);
            toast.success('Sesión completada');
            navigate('/rutinas/historial');
        } catch (error) {
            toast.error('Error al completar la sesión');
        }
    };

    const porcentaje = sesion?.porcentaje_completado || 0;
    const ejercicios = sesion?.sesion_ejercicios || sesion?.sesionEjercicios || [];

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/rutinas')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sesión de Entrenamiento</h1>
                    <p className="text-gray-600 dark:text-gray-400">{sesion?.rutina_paciente?.rutina?.nombre || 'Rutina'}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Progreso total</span>
                            </div>
                            <Badge variant="outline">{porcentaje}%</Badge>
                        </div>
                        <Progress value={porcentaje} className="h-3" />
                        <div className="flex gap-2">
                            <Button onClick={iniciarPausar} className="flex items-center gap-2">
                                {enCurso ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {enCurso ? 'Pausar' : 'Iniciar'}
                            </Button>
                            <Button variant="outline" onClick={() => setMostrarNotas((v) => !v)} className="flex items-center gap-2">
                                {mostrarNotas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {mostrarNotas ? 'Ocultar notas' : 'Notas'}
                            </Button>
                            <Button variant="outline" onClick={guardarNotas}>Guardar notas</Button>
                            <Button variant="default" onClick={completarSesion} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Completar sesión
                            </Button>
                        </div>
                        {mostrarNotas && (
                            <div className="mt-3">
                                <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} className="w-full" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ejercicios</CardTitle>
                </CardHeader>
                <CardContent>
                    {ejercicios.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No hay ejercicios cargados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {ejercicios.map((se) => (
                                <div key={se.id} className="p-4 border rounded-lg flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-semibold">{se.ejercicio?.nombre}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{se.ejercicio?.descripcion}</p>
                                        <div className="flex items-center gap-3 mt-2 text-sm">
                                            <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {se.ejercicio?.duracion_estimada || 0} min
                                            </span>
                                            {se.ejercicio?.calorias_estimadas && (
                                                <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Zap className="w-4 h-4" />
                                                    {se.ejercicio.calorias_estimadas} cal/min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="min-w-24 text-center">
                                            {se.completado ? 'Completado' : 'Pendiente'}
                                        </Badge>
                                        <TemporizadorDescanso segundos={se.ejercicio?.descanso_segundos || 60} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        </Layout>
    );
};

export default SesionEntrenamiento;

