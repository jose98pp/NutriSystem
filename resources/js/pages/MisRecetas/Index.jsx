import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';

const MisRecetasIndex = () => {
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        fetchRecetas();
    }, []);

    const fetchRecetas = async () => {
        try {
            const response = await api.get('/mis-recetas');
            setRecetas(response.data.data);
            if (response.data.message) {
                setMensaje(response.data.message);
            }
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Mis Recetas</h2>
                    <p className="text-gray-600 mt-1">Recetas incluidas en tu plan alimenticio</p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                Estas son las recetas que tu nutricionista ha incluido en tu plan de alimentación actual.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : recetas.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="mt-4">{mensaje || 'No hay recetas en tu plan actual'}</p>
                            <p className="text-sm mt-2">Consulta con tu nutricionista para que agregue recetas a tu plan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recetas.map((receta) => (
                                <div key={receta.id_receta} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-3xl">🍽️</span>
                                                <h3 className="font-bold text-lg">{receta.nombre}</h3>
                                            </div>
                                            
                                            {receta.kcal && (
                                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                                    </svg>
                                                    {receta.kcal} kcal
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {receta.restricciones && (
                                        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <p className="text-xs font-medium text-red-700 mb-1">Restricciones:</p>
                                                    <p className="text-xs text-red-600">{receta.restricciones}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MisRecetasIndex;
