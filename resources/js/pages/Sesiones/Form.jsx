import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { Calendar, Save, ArrowLeft, Users, Brain, Utensils, Video, Clock, FileText, AlertCircle } from 'lucide-react';
import api from '../../config/api';

const SesionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [pacientes, setPacientes] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [formData, setFormData] = useState({
        id_paciente: '',
        profesional_id: '',
        tipo_profesional: 'NUTRICIONISTA',
        tipo_sesion: 'PRESENCIAL',
        fecha_hora: '',
        duracion_minutos: 60,
        motivo: '',
        notas: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPacientes();
        if (isEditing) fetchSesion();
    }, [id]);

    useEffect(() => {
        if (formData.tipo_profesional) {
            fetchProfesionales(formData.tipo_profesional);
        }
    }, [formData.tipo_profesional]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data || response.data);
        } catch (error) {
            toast.error('Error al cargar pacientes');
        }
    };

    const fetchProfesionales = async (tipo) => {
        try {
            const endpoint = tipo === 'PSICOLOGO' ? '/psicologos' : '/nutricionistas';
            const response = await api.get(endpoint);
            const listado = response.data?.data ?? response.data;
            if (Array.isArray(listado)) {
                setProfesionales(listado);
            } else {
                setProfesionales([]);
                toast.error('Error al cargar profesionales');
            }
        } catch (error) {
            toast.error('Error al cargar profesionales');
        }
    };

    const fetchSesion = async () => {
        try {
            const response = await api.get(`/sesiones/${id}`);
            const sesion = response.data.data;
            setFormData({
                id_paciente: sesion.id_paciente || '',
                profesional_id: sesion.profesional_id || '',
                tipo_profesional: sesion.tipo_profesional || 'NUTRICIONISTA',
                tipo_sesion: sesion.tipo_sesion || 'PRESENCIAL',
                fecha_hora: sesion.fecha_hora ? sesion.fecha_hora.slice(0, 16) : '',
                duracion_minutos: sesion.duracion_minutos || 60,
                motivo: sesion.motivo || '',
                notas: sesion.notas || ''
            });
        } catch (error) {
            toast.error('Error al cargar sesión');
            navigate('/sesiones');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        
        console.log('Datos a enviar:', formData);
        
        try {
            if (isEditing) {
                await api.put(`/sesiones/${id}`, formData);
            } else {
                await api.post('/sesiones', formData);
            }
            const mensaje = isEditing ? 'actualizada' : 'programada';
            toast.success(`Sesión ${mensaje} exitosamente`);
            navigate('/sesiones');
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('Por favor corrige los errores');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                const accion = isEditing ? 'actualizar' : 'programar';
                toast.error(`Error al ${accion} sesión. Revisa la consola para más detalles.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/sesiones')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {isEditing ? 'Editar Sesión' : 'Programar Sesión'}
                            </h2>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información del Paciente y Profesional */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Participantes</h3>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Paciente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Paciente *
                                </label>
                                <select 
                                    name="id_paciente" 
                                    value={formData.id_paciente} 
                                    onChange={handleInputChange} 
                                    className={`select-field ${errors.id_paciente ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Selecciona un paciente</option>
                                    {pacientes.map(p => (
                                        <option key={p.id_paciente} value={p.id_paciente}>
                                            {p.nombre} {p.apellido}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_paciente && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.id_paciente[0]}
                                    </p>
                                )}
                            </div>

                            {/* Tipo de Profesional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de Profesional *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: 'tipo_profesional', value: 'NUTRICIONISTA' } })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.tipo_profesional === 'NUTRICIONISTA'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                                        }`}
                                    >
                                        <Utensils className={`w-6 h-6 mx-auto mb-2 ${
                                            formData.tipo_profesional === 'NUTRICIONISTA'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                            formData.tipo_profesional === 'NUTRICIONISTA'
                                                ? 'text-green-700 dark:text-green-300'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            Nutricionista
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: 'tipo_profesional', value: 'PSICOLOGO' } })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.tipo_profesional === 'PSICOLOGO'
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                        }`}
                                    >
                                        <Brain className={`w-6 h-6 mx-auto mb-2 ${
                                            formData.tipo_profesional === 'PSICOLOGO'
                                                ? 'text-purple-600 dark:text-purple-400'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                            formData.tipo_profesional === 'PSICOLOGO'
                                                ? 'text-purple-700 dark:text-purple-300'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            Psicólogo
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Profesional */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {formData.tipo_profesional === 'PSICOLOGO' ? (
                                        <><Brain className="w-4 h-4 inline mr-1" />Psicólogo *</>
                                    ) : (
                                        <><Utensils className="w-4 h-4 inline mr-1" />Nutricionista *</>
                                    )}
                                </label>
                                <select 
                                    name="profesional_id" 
                                    value={formData.profesional_id} 
                                    onChange={handleInputChange} 
                                    className={`select-field ${errors.profesional_id ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Selecciona un profesional</option>
                                    {profesionales.map(p => (
                                        <option 
                                            key={p.id_psicologo || p.id_nutricionista} 
                                            value={p.id_psicologo || p.id_nutricionista}
                                        >
                                            {p.nombre} {p.apellido}
                                        </option>
                                    ))}
                                </select>
                                {errors.profesional_id && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.profesional_id[0]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detalles de la Sesión */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detalles de la Sesión</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Tipo de Sesión */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de Sesión *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: 'tipo_sesion', value: 'PRESENCIAL' } })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.tipo_sesion === 'PRESENCIAL'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    >
                                        <Users className={`w-6 h-6 mx-auto mb-2 ${
                                            formData.tipo_sesion === 'PRESENCIAL'
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                            formData.tipo_sesion === 'PRESENCIAL'
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            Presencial
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: 'tipo_sesion', value: 'VIDEOLLAMADA' } })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.tipo_sesion === 'VIDEOLLAMADA'
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                                        }`}
                                    >
                                        <Video className={`w-6 h-6 mx-auto mb-2 ${
                                            formData.tipo_sesion === 'VIDEOLLAMADA'
                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                            formData.tipo_sesion === 'VIDEOLLAMADA'
                                                ? 'text-indigo-700 dark:text-indigo-300'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            Videollamada
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Fecha y Hora */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Fecha y Hora *
                                </label>
                                <input 
                                    type="datetime-local" 
                                    name="fecha_hora" 
                                    value={formData.fecha_hora} 
                                    onChange={handleInputChange} 
                                    className={`input-field ${errors.fecha_hora ? 'border-red-500' : ''}`}
                                    required 
                                />
                                {errors.fecha_hora && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.fecha_hora[0]}
                                    </p>
                                )}
                            </div>

                            {/* Duración */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Duración *
                                </label>
                                <select 
                                    name="duracion_minutos" 
                                    value={formData.duracion_minutos} 
                                    onChange={handleInputChange} 
                                    className="select-field" 
                                    required
                                >
                                    <option value="30">⏱️ 30 minutos</option>
                                    <option value="45">⏱️ 45 minutos</option>
                                    <option value="60">⏱️ 60 minutos</option>
                                    <option value="90">⏱️ 90 minutos</option>
                                    <option value="120">⏱️ 120 minutos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Información Adicional</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Motivo de la Sesión
                                </label>
                                <textarea 
                                    name="motivo" 
                                    value={formData.motivo} 
                                    onChange={handleInputChange} 
                                    rows="3" 
                                    className="textarea-field"
                                    placeholder="Describe brevemente el motivo de la sesión..."
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notas Previas
                                </label>
                                <textarea 
                                    name="notas" 
                                    value={formData.notas} 
                                    onChange={handleInputChange} 
                                    rows="3" 
                                    className="textarea-field"
                                    placeholder="Agrega notas o información relevante para la sesión..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button 
                            type="button" 
                            onClick={() => navigate('/sesiones')} 
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Actualizar Sesión' : 'Programar Sesión'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default SesionForm;