import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const MisAnalisisIndex = () => {
    const [analisis, setAnalisis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalisis();
    }, []);

    const fetchAnalisis = async () => {
        try {
            const response = await api.get('/mis-analisis');
            setAnalisis(response.data.data);
        } catch (error) {
            console.error('Error al cargar análisis:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Mis Análisis Clínicos</h2>
                    <p className="text-gray-600 mt-1">Historial de tus análisis y resultados médicos</p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-purple-700">
                                Estos análisis han sido registrados y vinculados a tus evaluaciones por tu nutricionista.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : analisis.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <p className="mt-4">No tienes análisis clínicos registrados</p>
                            <p className="text-sm mt-2">Tu nutricionista registrará tus análisis cuando los realices</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analisis.map((item) => (
                                <div key={item.id_analisis} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-900">{item.tipo}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {formatDate(item.created_at)}
                                                    </p>
                                                </div>
                                                {item.evaluaciones && item.evaluaciones.length > 0 && (
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                        </svg>
                                                        Vinculado a {item.evaluaciones.length} evaluación(es)
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Resultados:</p>
                                                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                                    {item.resultado}
                                                </pre>
                                            </div>

                                            {item.evaluaciones && item.evaluaciones.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-medium text-gray-600 mb-2">Evaluaciones relacionadas:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.evaluaciones.map((evaluacion) => (
                                                            <span key={evaluacion.id_evaluacion} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                                {formatDate(evaluacion.fecha)} - {evaluacion.peso_kg}kg
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MisAnalisisIndex;
