import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { 
    Calendar, ArrowLeft, Video, Users, Clock, Brain, Utensils, 
    Edit, Play, CheckCircle, XCircle, FileText, Plus 
} from 'lucide-react';
import api from '../../config/api';

const SesionView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const confirm = useConfirm();

    const [sesion, setSesion] = useState(null);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevaNota, setNuevaNota] = useState({
        contenido: '',
        tipo: 'OBSERVACION',
        privada: false
    });

    useEffect(() => {
        fetchSesion();
        fetchNotas();
    }, [id]);

    const fetchSesion = async () => {
        try {
            const response = await api.get(`/sesiones/${id}`);
            setSesion(response.data.data);
        } catch (error) {
            console.error('Error al cargar sesión:', error);
            toast.error('❌ Error al cargar sesión');
            navigate('/sesiones');
        } finally {
            setLoading(false);
        }
    };

    const fetchNotas = async () => {
        try {
            const response = await api.get(`/sesiones/${id}/notas`);
            setNotas(response.data.data || []);
        } catch (error) {
            console.error('Error al cargar notas:', error);
        }
    };

    const handleIniciarSesion = async () => {
        try {
            await api.post(`/sesiones/${id}/iniciar`);
            toast.success('✅ Sesión iniciada');
            fetchSesion();
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error('❌ Error al iniciar sesión');
        }
    };

    const handleCompletarSesion = async () => {
        const confirmed = await confirm({
            title: 'Completar Sesión',
            message: '¿Estás seguro de que deseas marcar esta sesión como completada?',
            confirmText: 'Sí, completar',
            cancelText: 'Cancelar'
        });

        if (!confirmed) return;

        try {
            await api.post(`/sesiones/${id}/completar`);
            toast.success('✅ Sesión completada');
            fetchSesion();
        } catch (error) {
            console.error('Error al completar sesión:', error);
            toast.error('❌ Error al completar sesión');
        }
    };

    const handleCancelarSesion = async () => {
        const motivo = prompt('Motivo de cancelación:');
        if (!motivo) return;

        try {
            await api.post(`/sesiones/${id}/cancelar`, { motivo_cancelacion: motivo });
            toast.success('✅ Sesión cancelada');
            fetchSesion();
        } catch (error) {
            console.error('Error al cancelar sesión:', error);
            toast.error('❌ Error al cancelar sesión');
        }
    };

    const handleAgregarNota = async (e) => {
        e.preventDefault();
        
        if (!nuevaNota.contenido.trim()) {
            toast.error('❌ El contenido de la nota es requerido');
            return;
        }

        try {
            await api.post(`/sesiones/${id}/notas`, nuevaNota);
            toast.success('✅ Nota agregada');
            setNuevaNota({ contenido: '', tipo: 'OBSERVACION', privada: false });
            fetchNotas();
        } catch (error) {
            console.error('Error al agregar nota:', error);
            toast.error('❌ Error al agregar nota');
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'PROGRAMADA': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            'EN_CURSO': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            'COMPLETADA': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            'CANCELADA': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        };
        return badges[estado] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    const getTipoBadge = (tipo) => {
        const badges = {
            'OBSERVACION': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            'DIAGNOSTICO': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
            'RECOMENDACION': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            'SEGUIMIENTO': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
        };
        return badges[tipo] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="card text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando sesión...</p>
                </div>
            </Layout>
        );
    }

    if (!sesion) return null;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/sesiones')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    Detalle de Sesión
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {formatFecha(sesion.fecha_hora)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                        {sesion.estado === 'PROGRAMADA' && (
                            <>
                                <Link
                                    to={`/sesiones/${id}/editar`}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Link>
                                <button
                                    onClick={handleIniciarSesion}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    Iniciar
                                </button>
                                <button
                                    onClick={handleCancelarSesion}
                                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {sesion.estado === 'EN_CURSO' && (
                            <>
                                {sesion.tipo_sesion === 'VIDEOLLAMADA' && (
                                    <Link
                                        to={`/videollamada/${sesion.id_sesion}`}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Video className="w-4 h-4" />
                                        Unirse a Videollamada
                                    </Link>
                                )}
                                <button
                                    onClick={handleCompletarSesion}
                                    className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Completar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información de la Sesión */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Información de la Sesión
                                </h3>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoBadge(sesion.estado)}`}>
                                    {sesion.estado.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paciente</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                                            {sesion.paciente?.nombre} {sesion.paciente?.apellido}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profesional</p>
                                        <div className="flex items-center gap-2">
                                            {sesion.tipo_profesional === 'PSICOLOGO' 
                                                ? <Brain className="w-4 h-4 text-purple-600" />
                                                : <Utensils className="w-4 h-4 text-green-600" />
                                            }
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                {sesion.tipo_profesional}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tipo de Sesión</p>
                                        <div className="flex items-center gap-2">
                                            {sesion.tipo_sesion === 'VIDEOLLAMADA' 
                                                ? <Video className="w-4 h-4" />
                                                : <Users className="w-4 h-4" />
                                            }
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                {sesion.tipo_sesion}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duración</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                {sesion.duracion_minutos} minutos
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {sesion.motivo && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Motivo</p>
                                        <p className="text-gray-800 dark:text-gray-100">{sesion.motivo}</p>
                                    </div>
                                )}

                                {sesion.notas && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notas</p>
                                        <p className="text-gray-800 dark:text-gray-100">{sesion.notas}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notas de Sesión */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notas de Sesión
                            </h3>

                            {/* Formulario para agregar nota */}
                            {(sesion.estado === 'EN_CURSO' || sesion.estado === 'COMPLETADA') && (
                                <form onSubmit={handleAgregarNota} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="space-y-3">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <select
                                                value={nuevaNota.tipo}
                                                onChange={(e) => setNuevaNota(prev => ({ ...prev, tipo: e.target.value }))}
                                                className="input"
                                            >
                                                <option value="OBSERVACION">Observación</option>
                                                <option value="DIAGNOSTICO">Diagnóstico</option>
                                                <option value="RECOMENDACION">Recomendación</option>
                                                <option value="SEGUIMIENTO">Seguimiento</option>
                                            </select>

                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={nuevaNota.privada}
                                                    onChange={(e) => setNuevaNota(prev => ({ ...prev, privada: e.target.checked }))}
                                                    className="rounded"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Nota privada</span>
                                            </label>
                                        </div>

                                        <textarea
                                            value={nuevaNota.contenido}
                                            onChange={(e) => setNuevaNota(prev => ({ ...prev, contenido: e.target.value }))}
                                            rows="3"
                                            className="input"
                                            placeholder="Escribe una nota sobre la sesión..."
                                            required
                                        />

                                        <button type="submit" className="btn-primary flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Agregar Nota
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Lista de notas */}
                            <div className="space-y-3">
                                {notas.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No hay notas para esta sesión
                                    </p>
                                ) : (
                                    notas.map((nota) => (
                                        <div key={nota.id_nota} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoBadge(nota.tipo)}`}>
                                                    {nota.tipo}
                                                </span>
                                                {nota.privada && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">🔒 Privada</span>
                                                )}
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-100">{nota.contenido}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {formatFecha(nota.created_at)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Link de videollamada */}
                        {sesion.tipo_sesion === 'VIDEOLLAMADA' && sesion.link_videollamada && (
                            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                    <Video className="w-5 h-5" />
                                    Videollamada
                                </h4>
                                <Link
                                    to={`/videollamada/${sesion.id_sesion}`}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Video className="w-4 h-4" />
                                    Unirse a la Sala
                                </Link>
                            </div>
                        )}

                        {/* Información del paciente */}
                        <div className="card">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                                Información del Paciente
                            </h4>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    <strong>Email:</strong> {sesion.paciente?.user?.email}
                                </p>
                                {sesion.paciente?.telefono && (
                                    <p className="text-gray-600 dark:text-gray-400">
                                        <strong>Teléfono:</strong> {sesion.paciente.telefono}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SesionView;
