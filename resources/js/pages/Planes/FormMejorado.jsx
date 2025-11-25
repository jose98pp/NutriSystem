import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useToast } from '../../components/Toast';
import { logApiError } from '../../utils/logger';
import { Plus, Trash2, Copy, Calendar, Save, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PlanFormMejorado = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [contratos, setContratos] = useState([]);
    const [alimentos, setAlimentos] = useState([]);
    const [busquedaAlimento, setBusquedaAlimento] = useState({});  // Objeto para búsquedas individuales por comida
    const [diaActual, setDiaActual] = useState(0);

    const [formData, setFormData] = useState({
        nombre_plan: '',
        objetivo: 'MANTENIMIENTO',
        calorias_objetivo: 2000,
        descripcion: '',
        id_contrato: '',
        fecha_inicio: '',
        duracion_dias: 30,
        dias: []
    });

    const TIPOS_COMIDA = [
        { tipo: 'DESAYUNO', hora: '08:00', icon: '🍳' },
        { tipo: 'COLACION_MATUTINA', hora: '11:00', icon: '🥗' },
        { tipo: 'ALMUERZO', hora: '14:00', icon: '🍽️' },
        { tipo: 'COLACION_VESPERTINA', hora: '17:00', icon: '🥤' },
        { tipo: 'CENA', hora: '20:00', icon: '🌙' }
    ];

    const OBJETIVOS = [
        'PERDIDA_PESO',
        'GANANCIA_MUSCULAR',
        'MANTENIMIENTO',
        'SALUD_GENERAL',
        'RENDIMIENTO_DEPORTIVO'
    ];

    useEffect(() => {
        fetchContratos();
        fetchAlimentos();
        if (id) {
            fetchPlan();
        } else {
            inicializarPlan();
        }
    }, [id]);

    const fetchContratos = async () => {
        try {
            const response = await api.get('/contratos', { params: { estado: 'ACTIVO' } });
            setContratos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar contratos:', error);
        }
    };

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos');
            setAlimentos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
        }
    };

    const fetchPlan = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/planes-mejorados/${id}`);
            const plan = response.data.data || response.data;
            
            // Mapear los datos del plan al formato del formulario
            setFormData({
                nombre_plan: plan.nombre_plan || plan.nombre || '',
                objetivo: plan.objetivo || 'MANTENIMIENTO',
                calorias_objetivo: plan.calorias_objetivo || 2000,
                descripcion: plan.descripcion || '',
                id_contrato: plan.id_contrato || '',
                fecha_inicio: plan.planDias?.[0]?.fecha || plan.fecha_inicio || '',
                duracion_dias: plan.duracion_dias || 30,
                dias: plan.planDias && plan.planDias.length > 0 ? plan.planDias : []
            });
        } catch (error) {
            logApiError(`/planes-mejorados/${id}`, error);
            toast.error('Error al cargar el plan. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const inicializarPlan = () => {
        const dias = [];
        for (let i = 0; i < 7; i++) {
            dias.push({
                dia_numero: i + 1,
                dia_semana: getDiaSemana(i),
                comidas: TIPOS_COMIDA.map((tc, idx) => ({
                    tipo_comida: tc.tipo,
                    hora_recomendada: tc.hora,
                    nombre: `${tc.tipo.replace(/_/g, ' ')} - Día ${i + 1}`,
                    descripcion: '',
                    instrucciones: '',
                    orden: idx + 1,
                    alimentos: []
                }))
            });
        }
        setFormData(prev => ({ ...prev, dias }));
    };

    const getDiaSemana = (index) => {
        const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        return dias[index];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const agregarAlimento = (diaIndex, comidaIndex, alimento) => {
        const nuevosDias = [...formData.dias];
        const alimentoExiste = nuevosDias[diaIndex].comidas[comidaIndex].alimentos
            .find(a => a.id_alimento === alimento.id_alimento);

        if (alimentoExiste) {
            toast.warning('Este alimento ya está en esta comida');
            return;
        }

        nuevosDias[diaIndex].comidas[comidaIndex].alimentos.push({
            id_alimento: alimento.id_alimento,
            nombre: alimento.nombre,
            calorias_por_100g: alimento.calorias_por_100g,
            proteinas_por_100g: alimento.proteinas_por_100g,
            carbohidratos_por_100g: alimento.carbohidratos_por_100g,
            grasas_por_100g: alimento.grasas_por_100g,
            cantidad_gramos: 100
        });

        setFormData({ ...formData, dias: nuevosDias });
        limpiarBusqueda(diaIndex, comidaIndex);
    };

    const actualizarCantidad = (diaIndex, comidaIndex, alimentoIndex, cantidad) => {
        const nuevosDias = [...formData.dias];
        nuevosDias[diaIndex].comidas[comidaIndex].alimentos[alimentoIndex].cantidad_gramos = parseFloat(cantidad) || 0;
        setFormData({ ...formData, dias: nuevosDias });
    };

    const eliminarAlimento = (diaIndex, comidaIndex, alimentoIndex) => {
        const nuevosDias = [...formData.dias];
        nuevosDias[diaIndex].comidas[comidaIndex].alimentos.splice(alimentoIndex, 1);
        setFormData({ ...formData, dias: nuevosDias });
    };

    const copiarDia = (diaOrigenIndex) => {
        if (diaActual === diaOrigenIndex) {
            toast.warning('No puedes copiar el día actual al mismo día');
            return;
        }

        const nuevosDias = [...formData.dias];
        const diaCopiado = JSON.parse(JSON.stringify(nuevosDias[diaOrigenIndex]));
        diaCopiado.dia_numero = diaActual + 1;
        diaCopiado.dia_semana = getDiaSemana(diaActual);

        nuevosDias[diaActual] = diaCopiado;
        setFormData({ ...formData, dias: nuevosDias });
        toast.success(`${getDiaSemana(diaOrigenIndex)} copiado a ${getDiaSemana(diaActual)}`);
    };

    const calcularTotalesComida = (comida) => {
        return comida.alimentos.reduce((totales, alimento) => {
            const factor = alimento.cantidad_gramos / 100;
            return {
                calorias: totales.calorias + ((alimento.calorias_por_100g || 0) * factor),
                proteinas: totales.proteinas + ((alimento.proteinas_por_100g || 0) * factor),
                carbohidratos: totales.carbohidratos + ((alimento.carbohidratos_por_100g || 0) * factor),
                grasas: totales.grasas + ((alimento.grasas_por_100g || 0) * factor)
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const calcularTotalesDia = (dia) => {
        return dia.comidas.reduce((totalesDia, comida) => {
            const totalesComida = calcularTotalesComida(comida);
            return {
                calorias: totalesDia.calorias + totalesComida.calorias,
                proteinas: totalesDia.proteinas + totalesComida.proteinas,
                carbohidratos: totalesDia.carbohidratos + totalesComida.carbohidratos,
                grasas: totalesDia.grasas + totalesComida.grasas
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar si hay comidas sin alimentos
        let comidasVacias = 0;
        formData.dias.forEach((dia, diaIndex) => {
            dia.comidas.forEach((comida, comidaIndex) => {
                if (!comida.alimentos || comida.alimentos.length === 0) {
                    comidasVacias++;
                }
            });
        });

        if (comidasVacias > 0) {
            const confirmar = window.confirm(
                `⚠️ Hay ${comidasVacias} comidas sin alimentos.\n\n` +
                `¿Deseas guardar el plan de todas formas?\n\n` +
                `Podrás agregar los alimentos después editando el plan.`
            );
            if (!confirmar) {
                return;
            }
        }

        setLoading(true);

        try {
            // Preparar datos para el backend
            const planData = {
                nombre_plan: formData.nombre_plan,
                objetivo: formData.objetivo,
                calorias_objetivo: parseInt(formData.calorias_objetivo),
                descripcion: formData.descripcion,
                id_contrato: parseInt(formData.id_contrato),
                estado: 'ACTIVO',
                plan_dias: formData.dias.map((dia, index) => {
                    const fechaDia = new Date(formData.fecha_inicio);
                    fechaDia.setDate(fechaDia.getDate() + index);

                    return {
                        dia_numero: dia.dia_numero,
                        dia_semana: dia.dia_semana,
                        fecha: fechaDia.toISOString().split('T')[0],
                        comidas: dia.comidas.map(comida => ({
                            tipo_comida: comida.tipo_comida,
                            hora_recomendada: comida.hora_recomendada,
                            nombre: comida.nombre,
                            descripcion: comida.descripcion,
                            instrucciones: comida.instrucciones,
                            orden: comida.orden,
                            alimentos: comida.alimentos.map(a => ({
                                id_alimento: a.id_alimento,
                                cantidad_gramos: a.cantidad_gramos
                            }))
                        }))
                    };
                })
            };

            if (id) {
                await api.put(`/planes-mejorados/${id}`, planData);
                toast.success('Plan actualizado exitosamente');
            } else {
                const response = await api.post('/planes-mejorados', planData);
                toast.success('Plan creado exitosamente');
                
                // Mostrar información de entregas generadas si existen
                if (response.data.calendario_entrega) {
                    const { creado, entregas_generadas } = response.data.calendario_entrega;
                    if (creado && entregas_generadas > 0) {
                        toast.info(`✅ ${entregas_generadas} entrega(s) programada(s) automáticamente`);
                    }
                }
            }

            navigate('/planes');
        } catch (error) {
            logApiError(id ? `/planes-mejorados/${id}` : '/planes-mejorados', error);
            const mensaje = error.response?.data?.message || 'Error al guardar el plan';
            toast.error(mensaje);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener alimentos filtrados por comida específica
    const getAlimentosFiltrados = (diaIndex, comidaIndex) => {
        const key = `${diaIndex}-${comidaIndex}`;
        const busqueda = busquedaAlimento[key] || '';
        return busqueda
            ? alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 10)
            : [];
    };

    // Función para actualizar búsqueda de una comida específica
    const handleBusquedaChange = (diaIndex, comidaIndex, value) => {
        const key = `${diaIndex}-${comidaIndex}`;
        setBusquedaAlimento(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Función para limpiar búsqueda de una comida específica
    const limpiarBusqueda = (diaIndex, comidaIndex) => {
        const key = `${diaIndex}-${comidaIndex}`;
        setBusquedaAlimento(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    const contratoSeleccionado = contratos.find(c => c.id_contrato === parseInt(formData.id_contrato));
    const diaData = formData.dias[diaActual];
    const totalesDia = diaData ? calcularTotalesDia(diaData) : null;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/planes')}
                        className="text-primary-600 dark:text-primary-400 hover:underline mb-2 flex items-center gap-1"
                    >
                        ← Volver a Planes
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {id ? 'Editar' : 'Crear'} Plan de Alimentación
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Configura las 5 comidas para los 7 días de la semana
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información General */}
                    <div className="card">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Información del Plan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contrato Activo *
                                </label>
                                <select
                                    name="id_contrato"
                                    value={formData.id_contrato}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Seleccionar contrato...</option>
                                    {contratos.map(contrato => (
                                        <option key={contrato.id_contrato} value={contrato.id_contrato}>
                                            {contrato.paciente?.nombre} {contrato.paciente?.apellido} - {contrato.servicio?.nombre}
                                        </option>
                                    ))}
                                </select>
                                {contratoSeleccionado && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Paciente: {contratoSeleccionado.paciente?.nombre} {contratoSeleccionado.paciente?.apellido}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del Plan *
                                </label>
                                <input
                                    type="text"
                                    name="nombre_plan"
                                    value={formData.nombre_plan}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: Plan Reducción de Peso - Semana 1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Objetivo *
                                </label>
                                <select
                                    name="objetivo"
                                    value={formData.objetivo}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    {OBJETIVOS.map(obj => (
                                        <option key={obj} value={obj}>
                                            {obj.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Calorías Objetivo (kcal/día) *
                                </label>
                                <input
                                    type="number"
                                    name="calorias_objetivo"
                                    value={formData.calorias_objetivo}
                                    onChange={handleChange}
                                    className="input-field"
                                    min="1000"
                                    max="5000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fecha de Inicio *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duración (días)
                                </label>
                                <input
                                    type="number"
                                    name="duracion_dias"
                                    value={formData.duracion_dias}
                                    onChange={handleChange}
                                    className="input-field"
                                    min="7"
                                    max="365"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Este plan se repetirá cíclicamente cada 7 días
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Descripción opcional del plan..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Navegación de Días */}
                    <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setDiaActual(Math.max(0, diaActual - 1))}
                                disabled={diaActual === 0}
                                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {diaData?.dia_semana}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Día {diaActual + 1} de 7
                                </p>
                                {totalesDia && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {Math.round(totalesDia.calorias)} kcal | P: {Math.round(totalesDia.proteinas)}g | C: {Math.round(totalesDia.carbohidratos)}g | G: {Math.round(totalesDia.grasas)}g
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setDiaActual(Math.min(6, diaActual + 1))}
                                disabled={diaActual === 6}
                                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Copiar de otro día */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Copiar desde:</span>
                            {formData.dias.map((dia, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => copiarDia(index)}
                                    disabled={index === diaActual}
                                    className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Copy className="w-3 h-3 inline mr-1" />
                                    {dia.dia_semana.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comidas del Día */}
                    {diaData && (
                        <div className="space-y-4">
                            {diaData.comidas.map((comida, comidaIndex) => {
                                const tipoInfo = TIPOS_COMIDA.find(tc => tc.tipo === comida.tipo_comida);
                                const totales = calcularTotalesComida(comida);

                                return (
                                    <div key={comidaIndex} className="card border-l-4 border-primary-500">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{tipoInfo?.icon}</span>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                                        {comida.tipo_comida.replace(/_/g, ' ')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {comida.hora_recomendada} • {comida.alimentos.length} alimentos
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                                    {Math.round(totales.calorias)} kcal
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    P: {Math.round(totales.proteinas)}g | C: {Math.round(totales.carbohidratos)}g | G: {Math.round(totales.grasas)}g
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lista de Alimentos */}
                                        {comida.alimentos.length > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {comida.alimentos.map((alimento, alimentoIndex) => (
                                                    <div key={alimentoIndex} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                                            {alimento.nombre}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={alimento.cantidad_gramos}
                                                            onChange={(e) => actualizarCantidad(diaActual, comidaIndex, alimentoIndex, e.target.value)}
                                                            className="w-20 px-2 py-1 border rounded text-sm"
                                                            min="0"
                                                            step="1"
                                                        />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-8">g</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarAlimento(diaActual, comidaIndex, alimentoIndex)}
                                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Buscar y Agregar Alimento */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={busquedaAlimento[`${diaActual}-${comidaIndex}`] || ''}
                                                onChange={(e) => handleBusquedaChange(diaActual, comidaIndex, e.target.value)}
                                                placeholder="Buscar alimento para agregar..."
                                                className="input-field text-sm"
                                            />
                                            {(() => {
                                                const alimentosFiltrados = getAlimentosFiltrados(diaActual, comidaIndex);
                                                return alimentosFiltrados.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                        {alimentosFiltrados.map(alimento => (
                                                            <button
                                                                key={alimento.id_alimento}
                                                                type="button"
                                                                onClick={() => agregarAlimento(diaActual, comidaIndex, alimento)}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                                            >
                                                                <div className="font-medium text-gray-800 dark:text-gray-100">{alimento.nombre}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {alimento.calorias_por_100g} kcal/100g
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="card bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Recuerda configurar las 5 comidas para cada día</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/planes')}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {id ? 'Actualizar Plan' : 'Crear Plan'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default PlanFormMejorado;
