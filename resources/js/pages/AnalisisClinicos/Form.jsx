import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const AnalisisClinicosForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        tipo: '',
        resultado: '',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            fetchAnalisis();
        }
    }, [id]);

    const fetchAnalisis = async () => {
        try {
            const response = await api.get(`/analisis-clinicos/${id}`);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error al cargar análisis:', error);
            alert('Error al cargar el análisis clínico');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (isEdit) {
                await api.put(`/analisis-clinicos/${id}`, formData);
            } else {
                await api.post('/analisis-clinicos', formData);
            }
            navigate('/analisis-clinicos');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al guardar el análisis clínico');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isEdit ? 'Editar Análisis Clínico' : 'Nuevo Análisis Clínico'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? 'Modifica los datos del análisis' : 'Registra un nuevo análisis clínico'}
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Análisis <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: Análisis de Sangre Completo, Perfil Lipídico"
                                maxLength="100"
                                required
                            />
                            {errors.tipo && (
                                <p className="text-red-500 text-xs mt-1">{errors.tipo[0]}</p>
                            )}
                        </div>

                        {/* Resultado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Resultado <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="resultado"
                                value={formData.resultado}
                                onChange={handleChange}
                                className="input-field font-mono"
                                placeholder={`Ej: 
Glucosa: 95 mg/dL (Normal: 70-100)
Colesterol Total: 180 mg/dL (Normal: <200)
HDL: 55 mg/dL (Normal: >40)
LDL: 110 mg/dL (Normal: <130)
Triglicéridos: 120 mg/dL (Normal: <150)`}
                                rows="10"
                                required
                            />
                            {errors.resultado && (
                                <p className="text-red-500 text-xs mt-1">{errors.resultado[0]}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Detalla los resultados del análisis con sus valores de referencia
                            </p>
                        </div>

                        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                            💡 Tip: Puedes vincular este análisis a las evaluaciones del paciente desde la sección de evaluaciones
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/analisis-clinicos')}
                                className="btn-secondary flex-1"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AnalisisClinicosForm;
