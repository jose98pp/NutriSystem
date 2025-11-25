import React, { useState, useEffect } from 'react';
import api from '../../config/api';

const ModeloAnatomico = ({ seleccionados = [], onSeleccionar, multiselect = true }) => {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vistaFrontal, setVistaFrontal] = useState(true);

    useEffect(() => {
        cargarGruposMusculares();
    }, []);

    const cargarGruposMusculares = async () => {
        try {
            const response = await api.get('/modelo-anatomico');
            const data = response.data;
            const gruposResp = Array.isArray(data) ? data : (data.grupos || []);
            setGrupos(gruposResp);
        } catch (error) {
            console.error('Error al cargar grupos musculares:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (grupoId) => {
        if (multiselect) {
            const nuevosSeleccionados = seleccionados.includes(grupoId)
                ? seleccionados.filter(id => id !== grupoId)
                : [...seleccionados, grupoId];
            onSeleccionar(nuevosSeleccionados);
        } else {
            onSeleccionar([grupoId]);
        }
    };

    const estaSeleccionado = (grupoId) => seleccionados.includes(grupoId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toggle Vista */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setVistaFrontal(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                            vistaFrontal
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Vista Frontal
                    </button>
                    <button
                        onClick={() => setVistaFrontal(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                            !vistaFrontal
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Vista Posterior
                    </button>
                </div>
            </div>

            {/* SVG del Cuerpo Humano */}
            <div className="flex justify-center">
                <svg
                    viewBox="0 0 400 800"
                    className="w-full max-w-md h-auto"
                    style={{ maxHeight: '600px' }}
                >
                    {grupos.map((grupo) => (
                        <g key={grupo.id}>
                            <path
                                d={grupo.svg_path}
                                fill={estaSeleccionado(grupo.id) ? grupo.color_hex : '#E5E7EB'}
                                stroke="#374151"
                                strokeWidth="2"
                                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                onClick={() => handleClick(grupo.id)}
                            />
                            <title>{grupo.nombre}</title>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Leyenda de Grupos Seleccionados */}
            {seleccionados.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grupos seleccionados:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {seleccionados.map((id) => {
                            const grupo = grupos.find(g => g.id === id);
                            return grupo ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: grupo.color_hex + '20',
                                        color: grupo.color_hex
                                    }}
                                >
                                    {grupo.nombre}
                                    <button
                                        onClick={() => handleClick(id)}
                                        className="ml-2 hover:opacity-70"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Lista de Grupos por Zona */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                {['superior', 'core', 'inferior'].map((zona) => (
                    <div key={zona} className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {zona === 'superior' ? 'Tren Superior' : zona === 'core' ? 'Core' : 'Tren Inferior'}
                        </h4>
                        <div className="space-y-1">
                            {grupos
                                .filter(g => g.zona_corporal === zona)
                                .map((grupo) => (
                                    <button
                                        key={grupo.id}
                                        onClick={() => handleClick(grupo.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                            estaSeleccionado(grupo.id)
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: grupo.color_hex }}
                                            />
                                            {grupo.nombre}
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModeloAnatomico;
