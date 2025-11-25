import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const MisDireccionesIndex = () => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDirecciones();
    }, []);

    const fetchDirecciones = async () => {
        try {
            const response = await api.get('/mis-direcciones');
            setDirecciones(response.data.data);
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Mis Direcciones de Entrega</h2>
                    <p className="text-gray-600 mt-1">Direcciones registradas para tus entregas</p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Nota:</strong> Para agregar o modificar tus direcciones, contacta a tu nutricionista.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : direcciones.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="mt-4">No tienes direcciones registradas</p>
                            <p className="text-sm mt-2">Solicita a tu nutricionista que agregue tus direcciones de entrega</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {direcciones.map((direccion) => (
                                <div key={direccion.id_direccion} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                {direccion.alias}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {direccion.descripcion}
                                            </p>
                                            
                                            {(direccion.geo_lat && direccion.geo_lng) && (
                                                <div className="bg-gray-50 p-3 rounded-md">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Coordenadas GPS:</span>
                                                        <span className="font-mono font-medium">
                                                            {direccion.geo_lat}, {direccion.geo_lng}
                                                        </span>
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

export default MisDireccionesIndex;
