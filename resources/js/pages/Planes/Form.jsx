import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const PlanForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [alimentos, setAlimentos] = useState([]);
    const [busquedaAlimento, setBusquedaAlimento] = useState('');
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        id_paciente: '',
        id_nutricionista: user.nutricionista?.id_nutricionista || '',
        fecha_inicio: '',
        fecha_fin: '',
        dias: []
    });

    const [diaActual, setDiaActual] = useState(1);
    const [numDias, setNumDias] = useState(7);

    useEffect(() => {
        fetchAlimentos();
        inicializarDias(numDias);
    }, []);

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos');
            setAlimentos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
        }
    };

    const inicializarDias = (cantidad) => {
        const dias = [];
        for (let i = 1; i <= cantidad; i++) {
            dias.push({
                dia_index: i,
                comidas: [
                    { tipo_comida: 'desayuno', orden: 1, alimentos: [] },
                    { tipo_comida: 'almuerzo', orden: 2, alimentos: [] },
                    { tipo_comida: 'cena', orden: 3, alimentos: [] },
                    { tipo_comida: 'snack', orden: 4, alimentos: [] }
                ]
            });
        }
        setFormData(prev => ({ ...prev, dias }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const agregarAlimentoAComida = (diaIndex, comidaIndex, alimento) => {
        const nuevosDias = [...formData.dias];
        const alimentoExiste = nuevosDias[diaIndex].comidas[comidaIndex].alimentos
            .find(a => a.id_alimento === alimento.id_alimento);

        if (alimentoExiste) {
            alert('Este alimento ya está en esta comida');
            return;
        }

        nuevosDias[diaIndex].comidas[comidaIndex].alimentos.push({
            ...alimento,
            cantidad_gramos: 100
        });

        setFormData({ ...formData, dias: nuevosDias });
        setBusquedaAlimento('');
    };

    const actualizarCantidadAlimento = (diaIndex, comidaIndex, alimentoIndex, cantidad) => {
        const nuevosDias = [...formData.dias];
        nuevosDias[diaIndex].comidas[comidaIndex].alimentos[alimentoIndex].cantidad_gramos = parseFloat(cantidad) || 0;
        setFormData({ ...formData, dias: nuevosDias });
    };

    const eliminarAlimentoDeComida = (diaIndex, comidaIndex, alimentoIndex) => {
        const nuevosDias = [...formData.dias];
        nuevosDias[diaIndex].comidas[comidaIndex].alimentos.splice(alimentoIndex, 1);
        setFormData({ ...formData, dias: nuevosDias });
    };

    const copiarDia = (diaOrigen) => {
        if (diaActual === diaOrigen) {
            alert('No puedes copiar el día actual al mismo día');
            return;
        }

        const nuevosDias = [...formData.dias];
        nuevosDias[diaActual - 1] = JSON.parse(JSON.stringify(nuevosDias[diaOrigen - 1]));
        nuevosDias[diaActual - 1].dia_index = diaActual;
        setFormData({ ...formData, dias: nuevosDias });
        alert(`Día ${diaOrigen} copiado al día ${diaActual}`);
    };

    const calcularTotalesComida = (comida) => {
        return comida.alimentos.reduce((totales, alimento) => {
            const factor = alimento.cantidad_gramos / 100;
            return {
                calorias: totales.calorias + (alimento.calorias_por_100g * factor),
                proteinas: totales.proteinas + (alimento.proteinas_por_100g * factor),
                carbohidratos: totales.carbohidratos + (alimento.carbohidratos_por_100g * factor),
                grasas: totales.grasas + (alimento.grasas_por_100g * factor)
            };
        }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const planData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                id_paciente: parseInt(formData.id_paciente),
                id_nutricionista: parseInt(formData.id_nutricionista),
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                dias: formData.dias.map(dia => ({
                    dia_index: dia.dia_index,
                    comidas: dia.comidas.map(comida => ({
                        tipo_comida: comida.tipo_comida,
                        orden: comida.orden,
                        alimentos: comida.alimentos.map(a => ({
                            id_alimento: a.id_alimento,
                            cantidad_gramos: a.cantidad_gramos
                        }))
                    }))
                }))
            };

            await api.post('/planes', planData);
            alert('Plan creado exitosamente');
            navigate('/planes');
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al crear plan';
            alert(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const alimentosFiltrados = busquedaAlimento
        ? alimentos.filter(a => a.nombre.toLowerCase().includes(busquedaAlimento.toLowerCase()))
        : [];

    const diaData = formData.dias[diaActual - 1];
    const getTipoComidaIcon = (tipo) => {
        const icons = { desayuno: '🌅', almuerzo: '🍽️', cena: '🌙', snack: '🍎' };
        return icons[tipo] || '🍴';
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/planes')}
                        className="text-primary-600 hover:text-primary-700 mb-2"
                    >
                        ← Volver
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Crear Plan de Alimentación</h2>
                    <p className="text-gray-600 mt-1">Configura el plan nutricional día por día</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información General */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Información del Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Plan *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Paciente *
                                </label>
                                <input
                                    type="number"
                                    name="id_paciente"
                                    value={formData.id_paciente}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio *
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Selector de Días */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Días del Plan</h3>
                            <div className="flex gap-2 items-center">
                                <label className="text-sm font-medium text-gray-700">Copiar desde:</label>
                                <select
                                    onChange={(e) => copiarDia(parseInt(e.target.value))}
                                    className="px-3 py-2 border rounded-lg"
                                    value=""
                                >
                                    <option value="">Seleccionar día...</option>
                                    {formData.dias.map((_, index) => (
                                        <option key={index} value={index + 1}>Día {index + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {formData.dias.map((dia, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setDiaActual(index + 1)}
                                    className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                        diaActual === index + 1
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Día {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comidas del Día */}
                    {diaData && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">Comidas del Día {diaActual}</h3>

                            {diaData.comidas.map((comida, comidaIndex) => {
                                const totales = calcularTotalesComida(comida);
                                return (
                                    <div key={comidaIndex} className="card">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl">{getTipoComidaIcon(comida.tipo_comida)}</span>
                                            <h4 className="text-xl font-bold capitalize">{comida.tipo_comida}</h4>
                                        </div>

                                        {/* Búsqueda de alimentos */}
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                placeholder="Buscar alimento..."
                                                value={busquedaAlimento}
                                                onChange={(e) => setBusquedaAlimento(e.target.value)}
                                                className="input-field"
                                            />
                                        </div>

                                        {busquedaAlimento && (
                                            <div className="max-h-40 overflow-y-auto border rounded-lg mb-4">
                                                {alimentosFiltrados.map((alimento) => (
                                                    <button
                                                        key={alimento.id_alimento}
                                                        type="button"
                                                        onClick={() => agregarAlimentoAComida(diaActual - 1, comidaIndex, alimento)}
                                                        className="w-full text-left p-3 hover:bg-gray-50 border-b"
                                                    >
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">{alimento.nombre}</span>
                                                            <span className="text-sm text-gray-500">{alimento.calorias_por_100g} kcal/100g</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Lista de alimentos */}
                                        {comida.alimentos.length > 0 ? (
                                            <div className="space-y-3">
                                                {comida.alimentos.map((alimento, alimentoIndex) => (
                                                    <div key={alimentoIndex} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
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
                                                                onChange={(e) => actualizarCantidadAlimento(diaActual - 1, comidaIndex, alimentoIndex, e.target.value)}
                                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                                                min="1"
                                                            />
                                                            <span className="text-sm text-gray-600">g</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarAlimentoDeComida(diaActual - 1, comidaIndex, alimentoIndex)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Totales */}
                                                <div className="mt-4 pt-4 border-t bg-primary-50 rounded-lg p-3">
                                                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                                                        <div>
                                                            <p className="text-gray-600">Calorías</p>
                                                            <p className="font-bold text-gray-800">{totales.calorias.toFixed(0)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Proteínas</p>
                                                            <p className="font-bold text-blue-600">{totales.proteinas.toFixed(1)}g</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Carbos</p>
                                                            <p className="font-bold text-yellow-600">{totales.carbohidratos.toFixed(1)}g</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Grasas</p>
                                                            <p className="font-bold text-orange-600">{totales.grasas.toFixed(1)}g</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Sin alimentos. Busca y agrega alimentos arriba.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Creando Plan...' : 'Crear Plan Completo'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/planes')}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default PlanForm;
