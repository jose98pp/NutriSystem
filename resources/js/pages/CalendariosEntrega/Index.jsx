import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';

const CalendariosEntregaIndex = () => {
    const [calendarios, setCalendarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generando, setGenerando] = useState(null);
    const [contratos, setContratos] = useState([]);
    const toast = useToast();

    useEffect(() => {
        fetchCalendarios();
        fetchContratos();
    }, []);

    const fetchCalendarios = async () => {
        try {
            const response = await api.get('/calendarios-entrega');
            setCalendarios(response.data.data.data || response.data.data);
        } catch (error) {
            console.error('Error al cargar calendarios:', error);
            toast.error('Error al cargar los calendarios');
        } finally {
            setLoading(false);
        }
    };

    const fetchContratos = async () => {
        try {
            const response = await api.get('/contratos');
            setContratos(response.data.data);
        } catch (error) {
            console.error('Error al cargar contratos:', error);
        }
    };

    const handleGenerarEntregas = async (id_calendario) => {
        // Usar window.confirm temporalmente para debugging
        const confirmed = window.confirm('¿Desea generar entregas automáticamente para este calendario? Se crearán entregas para todos los días del período.');
        
        if (confirmed) {
            try {
                setGenerando(id_calendario);
                const response = await api.post(`/entregas-programadas/generar/${id_calendario}`);
                toast.success(response.data.message || 'Entregas generadas exitosamente');
                fetchCalendarios();
            } catch (error) {
                console.error('Error al generar entregas:', error);
                const errorMessage = error.response?.data?.message || 'Error al generar entregas';
                toast.error(errorMessage);
            } finally {
                setGenerando(null);
            }
        }
    };

    const handleDelete = async (id) => {
        // Usar window.confirm temporalmente para debugging
        const confirmed = window.confirm('¿Está seguro de eliminar este calendario? Esto eliminará todas las entregas asociadas.');
        
        if (confirmed) {
            try {
                await api.delete(`/calendarios-entrega/${id}`);
                toast.success('Calendario eliminado exitosamente');
                fetchCalendarios();
            } catch (error) {
                console.error('Error al eliminar calendario:', error);
                toast.error('Error al eliminar el calendario');
            }
        }
    };

    const isActivo = (calendario) => {
        const hoy = new Date();
        const inicio = new Date(calendario.fecha_inicio);
        const fin = new Date(calendario.fecha_fin);
        return hoy >= inicio && hoy <= fin;
    };

    const getDiasRestantes = (calendario) => {
        const hoy = new Date();
        const fin = new Date(calendario.fecha_fin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Calendarios de Entrega</h2>
                        <p className="text-gray-600 mt-1">Gestión de calendarios para servicios de catering</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/entregas" className="btn-secondary">
                            📦 Ver Entregas
                        </Link>
                        <Link to="/calendarios-entrega/nuevo" className="btn-primary">
                            + Nuevo Calendario
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : calendarios.length === 0 ? (
                    <div className="card text-center py-12 text-gray-500">
                        <p>No hay calendarios de entrega registrados</p>
                        <p className="text-sm mt-2">Crea un calendario para comenzar a programar entregas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {calendarios.map((calendario) => (
                            <div key={calendario.id_calendario} className="card hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            Calendario #{calendario.id_calendario}
                                        </h3>
                                        {calendario.contrato?.paciente && (
                                            <p className="text-sm text-gray-600">
                                                {calendario.contrato.paciente.nombre} {calendario.contrato.paciente.apellido}
                                            </p>
                                        )}
                                    </div>
                                    {isActivo(calendario) ? (
                                        <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                            ✅ Activo
                                        </span>
                                    ) : (
                                        <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                            ⏸️ Inactivo
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Inicio:</span>
                                        <span className="font-medium">
                                            {new Date(calendario.fecha_inicio).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fin:</span>
                                        <span className="font-medium">
                                            {new Date(calendario.fecha_fin).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {calendario.entregas && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Entregas:</span>
                                            <span className="font-medium">
                                                {calendario.entregas.length} programadas
                                            </span>
                                        </div>
                                    )}
                                    {isActivo(calendario) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Días restantes:</span>
                                            <span className="font-medium text-primary-600">
                                                {getDiasRestantes(calendario)} días
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleGenerarEntregas(calendario.id_calendario)}
                                        disabled={generando === calendario.id_calendario}
                                        className="btn-success text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {generando === calendario.id_calendario ? (
                                            <>
                                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Generando...
                                            </>
                                        ) : (
                                            <>🔄 Generar Entregas Automáticas</>
                                        )}
                                    </button>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/entregas?id_calendario=${calendario.id_calendario}`}
                                            className="flex-1 text-center btn-secondary text-sm"
                                        >
                                            Ver Entregas
                                        </Link>
                                        <Link
                                            to={`/calendarios-entrega/${calendario.id_calendario}/editar`}
                                            className="flex-1 text-center btn-secondary text-sm"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(calendario.id_calendario)}
                                            className="flex-1 text-center btn-danger text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CalendariosEntregaIndex;
