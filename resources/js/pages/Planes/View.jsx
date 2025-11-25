import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const PlanView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [diaSeleccionado, setDiaSeleccionado] = useState(1);

    useEffect(() => {
        fetchPlan();
    }, [id]);

    const fetchPlan = async () => {
        try {
            const response = await api.get(`/planes/${id}`);
            setPlan(response.data);
            if (response.data.dias?.length > 0) {
                setDiaSeleccionado(response.data.dias[0].dia_index);
            }
        } catch (error) {
            console.error('Error al cargar plan:', error);
            alert('Error al cargar el plan');
            navigate('/planes');
        } finally {
            setLoading(false);
        }
    };

    const getDiaActual = () => {
        return plan?.dias?.find(d => d.dia_index === diaSeleccionado);
    };

    const getTipoComidaIcon = (tipo) => {
        if (tipo === 'snack') {
            return <img src="/images/company-logo.png" alt="Snack" className="h-6 w-6" />;
        }
        const icons = {
            'desayuno': '🌅',
            'almuerzo': '🍽️',
            'cena': '🌙'
        };
        return icons[tipo] || '🍴';
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </Layout>
        );
    }

    if (!plan) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Plan no encontrado</p>
                </div>
            </Layout>
        );
    }

    const diaActual = getDiaActual();

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <button
                            onClick={() => navigate('/planes')}
                            className="text-primary-600 hover:text-primary-700 mb-2"
                        >
                            ← Volver a planes
                        </button>
                        <h2 className="text-3xl font-bold text-gray-800">{plan.nombre}</h2>
                        <p className="text-gray-600 mt-1">
                            Paciente: {plan.paciente?.nombre} {plan.paciente?.apellido}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">
                            {new Date(plan.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(plan.fecha_fin).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                </div>

                {plan.descripcion && (
                    <div className="card">
                        <h3 className="font-bold text-lg mb-2">Descripción</h3>
                        <p className="text-gray-700">{plan.descripcion}</p>
                    </div>
                )}

                {/* Selector de días */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4">Seleccionar Día</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {plan.dias?.map((dia) => (
                            <button
                                key={dia.id_dia}
                                onClick={() => setDiaSeleccionado(dia.dia_index)}
                                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    diaSeleccionado === dia.dia_index
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Día {dia.dia_index}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comidas del día */}
                {diaActual && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-800">
                            Comidas del Día {diaSeleccionado}
                        </h3>

                        {diaActual.comidas?.sort((a, b) => a.orden - b.orden).map((comida) => (
                            <div key={comida.id_comida} className="card">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl flex items-center">{getTipoComidaIcon(comida.tipo_comida)}</span>
                                    <h4 className="text-xl font-bold capitalize">{comida.tipo_comida}</h4>
                                </div>

                                {comida.alimentos?.length > 0 ? (
                                    <>
                                        <div className="space-y-3">
                                            {comida.alimentos.map((alimento) => (
                                                <div key={alimento.id_alimento} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{alimento.nombre}</p>
                                                        <p className="text-sm text-gray-600 capitalize">{alimento.categoria}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary-600">
                                                            {alimento.pivot?.cantidad_gramos || 0}g
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {((alimento.calorias_por_100g * (alimento.pivot?.cantidad_gramos || 0)) / 100).toFixed(0)} kcal
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Totales de la comida */}
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">Calorías</p>
                                                    <p className="text-lg font-bold text-gray-800">
                                                        {comida.alimentos.reduce((sum, a) => 
                                                            sum + (a.calorias_por_100g * (a.pivot?.cantidad_gramos || 0)) / 100, 0
                                                        ).toFixed(0)} kcal
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">Proteínas</p>
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {comida.alimentos.reduce((sum, a) => 
                                                            sum + (a.proteinas_por_100g * (a.pivot?.cantidad_gramos || 0)) / 100, 0
                                                        ).toFixed(1)}g
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">Carbohidratos</p>
                                                    <p className="text-lg font-bold text-yellow-600">
                                                        {comida.alimentos.reduce((sum, a) => 
                                                            sum + (a.carbohidratos_por_100g * (a.pivot?.cantidad_gramos || 0)) / 100, 0
                                                        ).toFixed(1)}g
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">Grasas</p>
                                                    <p className="text-lg font-bold text-orange-600">
                                                        {comida.alimentos.reduce((sum, a) => 
                                                            sum + (a.grasas_por_100g * (a.pivot?.cantidad_gramos || 0)) / 100, 0
                                                        ).toFixed(1)}g
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Sin alimentos</p>
                                )}
                            </div>
                        ))}

                        {/* Totales del día */}
                        {diaActual.totales && (
                            <div className="card bg-primary-50 border-2 border-primary-200">
                                <h4 className="text-xl font-bold text-primary-800 mb-4">Totales del Día</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <p className="text-sm text-primary-700 mb-1">Calorías Totales</p>
                                        <p className="text-3xl font-bold text-primary-900">
                                            {diaActual.totales.calorias?.toFixed(0) || 0}
                                        </p>
                                        <p className="text-xs text-primary-600">kcal</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-blue-700 mb-1">Proteínas</p>
                                        <p className="text-3xl font-bold text-blue-900">
                                            {diaActual.totales.proteinas?.toFixed(1) || 0}
                                        </p>
                                        <p className="text-xs text-blue-600">gramos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-yellow-700 mb-1">Carbohidratos</p>
                                        <p className="text-3xl font-bold text-yellow-900">
                                            {diaActual.totales.carbohidratos?.toFixed(1) || 0}
                                        </p>
                                        <p className="text-xs text-yellow-600">gramos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-orange-700 mb-1">Grasas</p>
                                        <p className="text-3xl font-bold text-orange-900">
                                            {diaActual.totales.grasas?.toFixed(1) || 0}
                                        </p>
                                        <p className="text-xs text-orange-600">gramos</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PlanView;
