import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const EntregasIndex = () => {
    const [entregas, setEntregas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEstado, setFilterEstado] = useState('');
    const [filterFecha, setFilterFecha] = useState('');
    const [view, setView] = useState('todas'); // 'todas', 'hoy', 'pendientes'

    useEffect(() => {
        fetchEntregas();
    }, [filterEstado, filterFecha, view]);

    const fetchEntregas = async () => {
        try {
            let url = '/entregas-programadas';
            let params = {};

            if (view === 'hoy') {
                url = '/entregas-del-dia';
                params.fecha = new Date().toISOString().split('T')[0];
            } else if (view === 'pendientes') {
                url = '/entregas-pendientes';
            } else {
                if (filterEstado) params.estado = filterEstado;
                if (filterFecha) params.fecha_desde = filterFecha;
            }

            const response = await api.get(url, { params });
            setEntregas(response.data.data.data || response.data.data);
        } catch (error) {
            console.error('Error al cargar entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarEntregada = async (id) => {
        try {
            await api.put(`/entregas-programadas/${id}/marcar-entregada`);
            fetchEntregas();
        } catch (error) {
            console.error('Error al marcar como entregada:', error);
            alert('Error al marcar la entrega');
        }
    };

    const handleMarcarOmitida = async (id) => {
        if (window.confirm('¿Está seguro de marcar esta entrega como omitida?')) {
            try {
                await api.put(`/entregas-programadas/${id}/marcar-omitida`);
                fetchEntregas();
            } catch (error) {
                console.error('Error al marcar como omitida:', error);
                alert('Error al marcar la entrega');
            }
        }
    };

    const getEstadoColor = (estado) => {
        const colors = {
            'PROGRAMADA': 'bg-blue-100 text-blue-700',
            'PENDIENTE': 'bg-yellow-100 text-yellow-700',
            'ENTREGADA': 'bg-green-100 text-green-700',
            'OMITIDA': 'bg-gray-100 text-gray-700',
        };
        return colors[estado] || 'bg-gray-100 text-gray-700';
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            'PROGRAMADA': '📅',
            'PENDIENTE': '⏳',
            'ENTREGADA': '✅',
            'OMITIDA': '❌',
        };
        return icons[estado] || '📦';
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Entregas Programadas</h2>
                        <p className="text-gray-600 mt-1">Gestión de entregas de catering</p>
                    </div>
                    <Link to="/calendarios-entrega" className="btn-primary">
                        📆 Gestionar Calendarios
                    </Link>
                </div>

                {/* Vistas rápidas */}
                <div className="card">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setView('todas')}
                            className={`px-4 py-2 rounded ${view === 'todas' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setView('hoy')}
                            className={`px-4 py-2 rounded ${view === 'hoy' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => setView('pendientes')}
                            className={`px-4 py-2 rounded ${view === 'pendientes' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
                        >
                            Pendientes
                        </button>
                    </div>

                    {view === 'todas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Todos los estados</option>
                                <option value="PROGRAMADA">Programada</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="ENTREGADA">Entregada</option>
                                <option value="OMITIDA">Omitida</option>
                            </select>
                            <input
                                type="date"
                                value={filterFecha}
                                onChange={(e) => setFilterFecha(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : entregas.length === 0 ? (
                    <div className="card text-center py-12 text-gray-500">
                        <p>No hay entregas para mostrar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {entregas.map((entrega) => (
                            <div key={entrega.id_entrega} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Información principal */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{getEstadoIcon(entrega.estado)}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(entrega.estado)}`}>
                                                {entrega.estado}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Fecha:</span>
                                                <span className="font-medium ml-2">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {entrega.calendario?.contrato?.paciente && (
                                                <div>
                                                    <span className="text-gray-600">Paciente:</span>
                                                    <span className="font-medium ml-2">
                                                        {entrega.calendario.contrato.paciente.nombre} {entrega.calendario.contrato.paciente.apellido}
                                                    </span>
                                                </div>
                                            )}

                                            {entrega.direccion && (
                                                <div>
                                                    <span className="text-gray-600">Dirección:</span>
                                                    <span className="font-medium ml-2">
                                                        {entrega.direccion.alias} - {entrega.direccion.descripcion}
                                                    </span>
                                                </div>
                                            )}

                                            {entrega.comida && (
                                                <div>
                                                    <span className="text-gray-600">Comida:</span>
                                                    <span className="font-medium ml-2">
                                                        {entrega.comida.tipo_comida} #{entrega.comida.id_comida}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex md:flex-col gap-2">
                                        <Link
                                            to={`/entregas/${entrega.id_entrega}`}
                                            className="btn-primary text-sm text-center"
                                        >
                                            👁️ Ver Detalle
                                        </Link>
                                        {(entrega.estado === 'PROGRAMADA' || entrega.estado === 'PENDIENTE') && (
                                            <>
                                                <button
                                                    onClick={() => handleMarcarEntregada(entrega.id_entrega)}
                                                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                                >
                                                    ✅ Marcar Entregada
                                                </button>
                                                <button
                                                    onClick={() => handleMarcarOmitida(entrega.id_entrega)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                >
                                                    ❌ Omitir
                                                </button>
                                            </>
                                        )}
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

export default EntregasIndex;
