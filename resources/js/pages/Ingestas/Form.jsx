import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const IngestaForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isPaciente } = useAuth();
    const toast = useToast();
    const confirm = useConfirm();
    
    const [loading, setLoading] = useState(false);
    const [pacienteId, setPacienteId] = useState('');
    const [fechaHora, setFechaHora] = useState('');
    
    // Nuevo estado para el tipo de registro
    const [tipoRegistro, setTipoRegistro] = useState(
        searchParams.get('tipo') === 'libre' ? 'libre' : 'plan'
    ); // 'plan' o 'libre'
    
    // Estados para registro desde plan
    const [planActual, setPlanActual] = useState(null);
    const [comidasPlan, setComidasPlan] = useState([]);
    const [comidaSeleccionada, setComidaSeleccionada] = useState(null);
    
    // Estados para registro libre
    const [alimentos, setAlimentos] = useState([]);
    const [alimentosSeleccionados, setAlimentosSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        // Establecer fecha y hora actual
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset() * 60000;
        const fechaLocal = new Date(ahora - offset);
        setFechaHora(fechaLocal.toISOString().slice(0, 16));

        // Si es paciente, cargar su plan actual primero
        if (isPaciente()) {
            fetchPlanActual();
        } else {
            fetchAlimentos();
        }
    }, []);

    useEffect(() => {
        // Cargar datos según el tipo de registro seleccionado
        if (tipoRegistro === 'libre') {
            fetchAlimentos();
        } else if (tipoRegistro === 'plan' && planActual) {
            fetchComidasDelDia();
        }
    }, [tipoRegistro, planActual]);

    const fetchPlanActual = async () => {
        try {
            console.log('=== VERIFICACIÓN DE USUARIO Y PLAN ===');
            console.log('Usuario actual:', user);
            
            // Si es paciente, usar endpoint específico
            if (isPaciente()) {
                const response = await api.get('/mi-plan');
                const planActivo = response.data.data?.plan_activo;
                
                console.log('Plan activo del paciente:', planActivo);
                
                    if (planActivo) {
                        console.log('✅ Plan activo del usuario encontrado');
                        setPlanActual(planActivo);
                        setPacienteId(planActivo.id_paciente);
                    } else {
                        console.log('❌ No se encontró un plan activo para este usuario');
                        toast.info('ℹ️ No tienes un plan activo. Puedes registrar alimentos libremente.');
                        setTipoRegistro('libre');
                        setPlanActual(null);
                    }
                } else {
                    // Si no es paciente (admin/nutricionista), usar endpoint normal
                    const idPacienteUsuario = user.paciente?.id_paciente || user.id_paciente;
                    const response = await api.get('/planes', {
                        params: { 
                            activo: 1,
                            paciente_id: idPacienteUsuario
                        }
                    });
                    const planes = response.data.data || response.data;
                    const planActivo = planes.find(plan => {
                        const hoy = new Date();
                        const inicio = new Date(plan.fecha_inicio);
                        const fin = new Date(plan.fecha_fin);
                        return hoy >= inicio && hoy <= fin;
                    });
                    
                    if (planActivo) {
                        setPlanActual(planActivo);
                        setPacienteId(planActivo.id_paciente);
                    }
                }
        } catch (error) {
            console.error('Error al cargar plan actual:', error);
            toast.error('❌ Error al cargar tu plan alimenticio');
            setTipoRegistro('libre');
        }
    };

    const fetchComidasDelDia = async () => {
        if (!planActual) return;
        
        try {
            // Obtener el plan con sus días y comidas
            // Si es paciente, usar el plan que ya tenemos (viene con días y comidas)
            let planDetalle;
            if (isPaciente()) {
                planDetalle = planActual; // Ya viene con días y comidas de /mi-plan
            } else {
                const response = await api.get(`/planes/${planActual.id_plan}`);
                planDetalle = response.data.data || response.data;
            }
            
            console.log('Plan detalle:', planDetalle);
            
            // Calcular qué día del plan es hoy
            const fechaInicio = new Date(planActual.fecha_inicio);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaInicio.setHours(0, 0, 0, 0);
            
            const diffTime = hoy - fechaInicio;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diaIndex = (diffDays % 7) + 1; // Ciclo de 7 días (1-7)
            
            console.log('Fecha inicio:', fechaInicio);
            console.log('Hoy:', hoy);
            console.log('Diferencia en días:', diffDays);
            console.log('Día index calculado:', diaIndex);
            
            // Buscar el día correspondiente en el plan
            const dias = planDetalle.dias || planDetalle.planDias || [];
            const diaHoy = dias.find(dia => dia.dia_numero === diaIndex || dia.dia_index === diaIndex);
            
            console.log('Días disponibles:', dias);
            console.log('Día encontrado:', diaHoy);
            
            if (diaHoy && diaHoy.comidas) {
                // Ordenar comidas por orden
                const comidasOrdenadas = diaHoy.comidas.sort((a, b) => (a.orden || 0) - (b.orden || 0));
                setComidasPlan(comidasOrdenadas);
                console.log('Comidas del día:', comidasOrdenadas);
            } else {
                setComidasPlan([]);
                console.log('No se encontraron comidas para hoy. Estructura del plan:', planDetalle);
            }
        } catch (error) {
            console.error('Error al cargar comidas del plan:', error);
            toast.error('❌ Error al cargar las comidas de tu plan');
            setComidasPlan([]);
        }
    };

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos');
            setAlimentos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
            toast.error('❌ Error al cargar la lista de alimentos');
        }
    };

    const alimentosFiltrados = alimentos.filter(a => 
        a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const agregarAlimento = (alimento) => {
        if (alimentosSeleccionados.find(a => a.id_alimento === alimento.id_alimento)) {
            toast.warning(`⚠️ ${alimento.nombre} ya está en la lista`);
            return;
        }

        setAlimentosSeleccionados([...alimentosSeleccionados, {
            ...alimento,
            cantidad_gramos: 100
        }]);
        toast.success(`✅ ${alimento.nombre} agregado`);
        setBusqueda('');
    };

    const actualizarCantidad = (id, cantidad) => {
        setAlimentosSeleccionados(alimentosSeleccionados.map(a => 
            a.id_alimento === id ? { ...a, cantidad_gramos: parseFloat(cantidad) || 0 } : a
        ));
    };

    const eliminarAlimento = (id) => {
        setAlimentosSeleccionados(alimentosSeleccionados.filter(a => a.id_alimento !== id));
    };

    const calcularTotales = () => {
        return alimentosSeleccionados.reduce((totales, alimento) => {
            const factor = alimento.cantidad_gramos / 100;
            return {
                calorias: totales.calorias + (alimento.calorias_por_100g * factor),
                proteinas: totales.proteinas + (alimento.proteinas_por_100g * factor),
                carbohidratos: totales.carbohidratos + (alimento.carbohidratos_por_100g * factor),
                grasas: totales.grasas + (alimento.grasas_por_100g * factor),
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const registrarComidaDelPlan = async (comida) => {
        const confirmed = await confirm({
            title: 'Registrar Comida del Plan',
            message: `¿Confirmas que consumiste "${comida.nombre}" según tu plan alimenticio?`,
            confirmText: 'Sí, registrar',
            type: 'default'
        });

        if (!confirmed) return;

        setLoading(true);
        try {
            // Obtener id_paciente
            const idPaciente = user.paciente?.id_paciente || user.id_paciente;
            
            const data = {
                fecha_hora: fechaHora,
                id_paciente: idPaciente,
                id_comida_plan: comida.id_comida, // Referencia a la comida del plan
                alimentos: comida.alimentos.map(a => ({
                    id_alimento: a.id_alimento,
                    cantidad_gramos: a.pivot?.cantidad_gramos || a.cantidad_gramos
                }))
            };

            await api.post('/ingestas', data);
            toast.success(`✅ ${comida.nombre} registrada exitosamente`);
            navigate('/ingestas');
        } catch (error) {
            console.error('Error al registrar comida del plan:', error);
            if (error.response?.status === 400) {
                toast.warning('⚠️ Esta comida ya fue registrada hoy');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('❌ Error al registrar la comida. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (tipoRegistro === 'libre' && alimentosSeleccionados.length === 0) {
            toast.warning('⚠️ Debes agregar al menos un alimento a tu ingesta');
            return;
        }

        // Obtener id_paciente
        let idPaciente;
        if (isPaciente()) {
            idPaciente = user.paciente?.id_paciente || user.id_paciente;
            if (!idPaciente) {
                toast.error('❌ No se pudo obtener tu ID de paciente. Contacta al administrador.');
                return;
            }
        } else {
            if (!pacienteId) {
                toast.warning('⚠️ Debes seleccionar un paciente');
                return;
            }
            idPaciente = pacienteId;
        }

        setLoading(true);

        try {
            const data = {
                fecha_hora: fechaHora,
                id_paciente: idPaciente,
                tipo_registro: tipoRegistro,
                alimentos: alimentosSeleccionados.map(a => ({
                    id_alimento: a.id_alimento,
                    cantidad_gramos: a.cantidad_gramos
                }))
            };

            await api.post('/ingestas', data);
            
            // Mensaje de éxito más descriptivo
            const numAlimentos = alimentosSeleccionados.length;
            const caloriasTotal = totales.calorias.toFixed(0);
            toast.success(`✅ Ingesta registrada: ${numAlimentos} alimento${numAlimentos > 1 ? 's' : ''} (${caloriasTotal} kcal)`);
            
            navigate('/ingestas');
        } catch (error) {
            console.error('Error completo:', error);
            if (error.response?.data?.errors) {
                const errores = Object.values(error.response.data.errors).flat();
                errores.forEach(err => toast.error(`❌ ${err}`));
            } else if (error.response?.data?.message) {
                toast.error(`❌ ${error.response.data.message}`);
            } else {
                toast.error('❌ Error al registrar ingesta. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const totales = calcularTotales();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/ingestas')}
                        className="text-primary-600 hover:text-primary-700 mb-2"
                    >
                        ← Volver
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Registrar Ingesta</h2>
                    <p className="text-gray-600 mt-1">Registra lo que comiste</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Información Básica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha y Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={fechaHora}
                                    onChange={(e) => setFechaHora(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {!isPaciente() && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ID Paciente *
                                    </label>
                                    <input
                                        type="number"
                                        value={pacienteId}
                                        onChange={(e) => setPacienteId(e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selector de tipo de registro (solo para pacientes) */}
                    {isPaciente() && (
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">¿Cómo quieres registrar tu ingesta?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTipoRegistro('plan')}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        tipoRegistro === 'plan' 
                                            ? 'border-primary-500 bg-primary-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    disabled={!planActual}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                            tipoRegistro === 'plan' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                                        }`}>
                                            {tipoRegistro === 'plan' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">📋 Desde mi Plan</h4>
                                            <p className="text-sm text-gray-600">
                                                {planActual 
                                                    ? 'Registra comidas de tu plan alimenticio'
                                                    : 'No tienes un plan activo'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTipoRegistro('libre')}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        tipoRegistro === 'libre' 
                                            ? 'border-primary-500 bg-primary-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                            tipoRegistro === 'libre' ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                                        }`}>
                                            {tipoRegistro === 'libre' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">🍎 Alimentos Libres</h4>
                                            <p className="text-sm text-gray-600">
                                                Registra cualquier alimento adicional
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comidas del Plan */}
                    {isPaciente() && tipoRegistro === 'plan' && (
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">🍽️ Comidas de tu Plan para Hoy</h3>
                            
                            {comidasPlan.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No tienes comidas programadas para hoy en tu plan</p>
                                    <button
                                        type="button"
                                        onClick={() => setTipoRegistro('libre')}
                                        className="btn-secondary"
                                    >
                                        Registrar Alimentos Libres
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comidasPlan.map((comida, index) => {
                                        const totales = comida.alimentos?.reduce((acc, alimento) => {
                                            const cantidad = alimento.pivot?.cantidad_gramos || 100;
                                            const factor = cantidad / 100;
                                            return {
                                                calorias: acc.calorias + (alimento.calorias_por_100g * factor),
                                                proteinas: acc.proteinas + (alimento.proteinas_por_100g * factor),
                                                carbohidratos: acc.carbohidratos + (alimento.carbohidratos_por_100g * factor),
                                                grasas: acc.grasas + (alimento.grasas_por_100g * factor),
                                            };
                                        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }) || { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

                                        return (
                                            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{comida.nombre}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {comida.hora_recomendada} • {totales.calorias.toFixed(0)} kcal
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => registrarComidaDelPlan(comida)}
                                                        disabled={loading}
                                                        className="btn-primary text-sm"
                                                    >
                                                        ✓ Ya comí esto
                                                    </button>
                                                </div>

                                                {comida.alimentos && comida.alimentos.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700">Alimentos incluidos:</p>
                                                        {comida.alimentos.map((alimento, aIndex) => (
                                                            <div key={aIndex} className="flex justify-between text-sm text-gray-600">
                                                                <span>• {alimento.nombre}</span>
                                                                <span>{alimento.pivot?.cantidad_gramos || 100}g</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {comida.instrucciones && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Instrucciones:</strong> {comida.instrucciones}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Registro Libre de Alimentos */}
                    {(tipoRegistro === 'libre' || !isPaciente()) && (
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">
                                {isPaciente() ? '🍎 Agregar Alimentos Adicionales' : 'Agregar Alimentos'}
                            </h3>
                        
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar alimento..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {busqueda && (
                            <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
                                {alimentosFiltrados.length === 0 ? (
                                    <p className="p-4 text-gray-500">No se encontraron alimentos</p>
                                ) : (
                                    alimentosFiltrados.map((alimento) => (
                                        <button
                                            key={alimento.id_alimento}
                                            type="button"
                                            onClick={() => agregarAlimento(alimento)}
                                            className="w-full text-left p-3 hover:bg-gray-50 border-b"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-medium">{alimento.nombre}</span>
                                                <span className="text-sm text-gray-500 capitalize">{alimento.categoria}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {alimento.calorias_por_100g} kcal/100g
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {alimentosSeleccionados.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Busca y agrega alimentos a tu ingesta
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alimentosSeleccionados.map((alimento) => (
                                    <div key={alimento.id_alimento} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{alimento.nombre}</p>
                                            <p className="text-sm text-gray-600">
                                                {((alimento.calorias_por_100g * alimento.cantidad_gramos) / 100).toFixed(0)} kcal
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={alimento.cantidad_gramos}
                                                onChange={(e) => actualizarCantidad(alimento.id_alimento, e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                                min="1"
                                            />
                                            <span className="text-sm text-gray-600">gramos</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => eliminarAlimento(alimento.id_alimento)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                    )}

                    {/* Totales Nutricionales - Solo para registro libre */}
                    {(tipoRegistro === 'libre' || !isPaciente()) && alimentosSeleccionados.length > 0 && (
                        <div className="card bg-primary-50 border-2 border-primary-200">
                            <h3 className="text-xl font-bold text-primary-800 mb-4">Totales Nutricionales</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <p className="text-sm text-primary-700 mb-1">Calorías</p>
                                    <p className="text-3xl font-bold text-primary-900">{totales.calorias.toFixed(0)}</p>
                                    <p className="text-xs text-primary-600">kcal</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-blue-700 mb-1">Proteínas</p>
                                    <p className="text-3xl font-bold text-blue-900">{totales.proteinas.toFixed(1)}</p>
                                    <p className="text-xs text-blue-600">gramos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-yellow-700 mb-1">Carbohidratos</p>
                                    <p className="text-3xl font-bold text-yellow-900">{totales.carbohidratos.toFixed(1)}</p>
                                    <p className="text-xs text-yellow-600">gramos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-orange-700 mb-1">Grasas</p>
                                    <p className="text-3xl font-bold text-orange-900">{totales.grasas.toFixed(1)}</p>
                                    <p className="text-xs text-orange-600">gramos</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción - Solo para registro libre */}
                    {(tipoRegistro === 'libre' || !isPaciente()) && (
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || alimentosSeleccionados.length === 0}
                                className="btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Registrar Ingesta'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/ingestas')}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {/* Botón de cancelar para registro desde plan */}
                    {isPaciente() && tipoRegistro === 'plan' && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/ingestas')}
                                className="btn-secondary"
                            >
                                Volver
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
};

export default IngestaForm;
