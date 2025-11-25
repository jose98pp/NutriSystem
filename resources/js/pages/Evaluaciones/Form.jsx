import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const EvaluacionForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pacientes, setPacientes] = useState([]);
    const [searchPaciente, setSearchPaciente] = useState('');
    const [showPacientes, setShowPacientes] = useState(false);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [nutricionistaInfo, setNutricionistaInfo] = useState(null);
    
    const [formData, setFormData] = useState({
        id_paciente: '',
        id_nutricionista: user.nutricionista?.id_nutricionista || '',
        tipo: 'PERIODICA',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
        medicion: {
            peso_kg: '',
            altura_m: '',
            porc_grasa: '',
            masa_magra_kg: ''
        }
    });

    // Cargar pacientes al inicio
    useEffect(() => {
        fetchPacientes('');
    }, []);

    // Buscar pacientes mientras escribe
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchPaciente.length >= 2 || searchPaciente.length === 0) {
                fetchPacientes(searchPaciente);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchPaciente]);

    const fetchPacientes = async (search) => {
        try {
            const response = await api.get('/evaluaciones-pacientes', {
                params: { search }
            });
            setPacientes(response.data || []);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const handleSelectPaciente = (paciente) => {
        setPacienteSeleccionado(paciente);
        setSearchPaciente(`${paciente.nombre} ${paciente.apellido}`);
        
        // Actualizar información del nutricionista
        if (paciente.nutricionista) {
            setNutricionistaInfo(paciente.nutricionista);
            setFormData({ 
                ...formData, 
                id_paciente: paciente.id_paciente,
                id_nutricionista: paciente.id_nutricionista
            });
        } else {
            setNutricionistaInfo(null);
            setFormData({ 
                ...formData, 
                id_paciente: paciente.id_paciente,
                id_nutricionista: paciente.id_nutricionista || ''
            });
        }
        
        setShowPacientes(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMedicionChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            medicion: {
                ...formData.medicion,
                [name]: value
            }
        });
    };

    const calcularIMC = () => {
        const { peso_kg, altura_m } = formData.medicion;
        if (!peso_kg || !altura_m) return 'N/A';
        const imc = parseFloat(peso_kg) / (parseFloat(altura_m) ** 2);
        return imc.toFixed(2);
    };

    const getClasificacionIMC = () => {
        const imc = calcularIMC();
        if (imc === 'N/A') return { texto: 'N/A', color: 'gray' };
        const imcNum = parseFloat(imc);
        if (imcNum < 18.5) return { texto: 'Bajo peso', color: 'blue' };
        if (imcNum < 25) return { texto: 'Normal', color: 'green' };
        if (imcNum < 30) return { texto: 'Sobrepeso', color: 'yellow' };
        return { texto: 'Obesidad', color: 'red' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/evaluaciones', formData);
            navigate('/evaluaciones');
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al crear evaluación';
            alert(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const imc = calcularIMC();
    const clasificacion = getClasificacionIMC();

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/evaluaciones')}
                        className="text-primary-600 hover:text-primary-700 mb-2"
                    >
                        ← Volver
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Nueva Evaluación</h2>
                    <p className="text-gray-600 mt-1">Registra mediciones y observaciones del paciente</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Información General</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Buscar Paciente *
                                </label>
                                <input
                                    type="text"
                                    value={searchPaciente}
                                    onChange={(e) => {
                                        setSearchPaciente(e.target.value);
                                        setShowPacientes(true);
                                    }}
                                    onFocus={() => setShowPacientes(true)}
                                    className="input-field"
                                    placeholder="Escribe nombre, apellido o email..."
                                    required={!pacienteSeleccionado}
                                />
                                {showPacientes && pacientes.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto">
                                        {pacientes.map((paciente) => (
                                            <button
                                                key={paciente.id_paciente}
                                                type="button"
                                                onClick={() => handleSelectPaciente(paciente)}
                                                className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                            >
                                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                                    {paciente.nombre} {paciente.apellido}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{paciente.email}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {pacienteSeleccionado && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            ✓ Paciente seleccionado: <strong>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nutricionista Asignado
                                </label>
                                <input
                                    type="text"
                                    value={nutricionistaInfo 
                                        ? `${nutricionistaInfo.nombre} ${nutricionistaInfo.apellido} (ID: ${nutricionistaInfo.id_nutricionista})` 
                                        : pacienteSeleccionado 
                                            ? 'Sin nutricionista asignado' 
                                            : 'Seleccione un paciente primero'}
                                    className="input-field bg-gray-100"
                                    disabled
                                />
                                {nutricionistaInfo && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ Este paciente está asignado a este nutricionista
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Evaluación *
                                </label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="INICIAL">Inicial</option>
                                    <option value="PERIODICA">Periódica</option>
                                    <option value="FINAL">Final</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Mediciones Antropométricas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Peso (kg) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="peso_kg"
                                    value={formData.medicion.peso_kg}
                                    onChange={handleMedicionChange}
                                    className="input-field"
                                    placeholder="Ej: 70.5"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Altura (metros) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="altura_m"
                                    value={formData.medicion.altura_m}
                                    onChange={handleMedicionChange}
                                    className="input-field"
                                    placeholder="Ej: 1.75"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porcentaje de Grasa (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="porc_grasa"
                                    value={formData.medicion.porc_grasa}
                                    onChange={handleMedicionChange}
                                    className="input-field"
                                    placeholder="Ej: 20.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Masa Magra (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="masa_magra_kg"
                                    value={formData.medicion.masa_magra_kg}
                                    onChange={handleMedicionChange}
                                    className="input-field"
                                    placeholder="Ej: 55.3"
                                />
                            </div>
                        </div>

                        {/* Cálculo de IMC en tiempo real */}
                        {formData.medicion.peso_kg && formData.medicion.altura_m && (
                            <div className="mt-6 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-primary-700">Índice de Masa Corporal (IMC)</p>
                                        <p className="text-4xl font-bold text-primary-900 mt-2">{imc}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Clasificación:</p>
                                        <p className={`text-2xl font-bold text-${clasificacion.color}-600 mt-1`}>
                                            {clasificacion.texto}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-bold mb-4">Observaciones</h3>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            className="input-field"
                            rows="4"
                            placeholder="Notas adicionales sobre la evaluación, recomendaciones, etc..."
                        ></textarea>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Crear Evaluación'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/evaluaciones')}
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

export default EvaluacionForm;
