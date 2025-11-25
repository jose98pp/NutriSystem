import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const AlimentoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'fruta',
        calorias_por_100g: '',
        proteinas_por_100g: '',
        carbohidratos_por_100g: '',
        grasas_por_100g: '',
        restricciones: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchAlimento();
        }
    }, [id]);

    const fetchAlimento = async () => {
        try {
            const response = await api.get(`/alimentos/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Error al cargar alimento');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/alimentos/${id}`, formData);
            } else {
                await api.post('/alimentos', formData);
            }
            navigate('/alimentos');
        } catch (error) {
            alert('Error al guardar alimento');
        } finally {
            setLoading(false);
        }
    };

    const categorias = [
        'fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro'
    ];

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">
                    {isEdit ? 'Editar Alimento' : 'Nuevo Alimento'}
                </h2>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre *</label>
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
                            <label className="block text-sm font-medium mb-2">Categoría *</label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="input-field"
                            >
                                {categorias.map(cat => (
                                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Calorías (kcal/100g) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="calorias_por_100g"
                                    value={formData.calorias_por_100g}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Proteínas (g/100g) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="proteinas_por_100g"
                                    value={formData.proteinas_por_100g}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Carbohidratos (g/100g) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="carbohidratos_por_100g"
                                    value={formData.carbohidratos_por_100g}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Grasas (g/100g) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="grasas_por_100g"
                                    value={formData.grasas_por_100g}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Restricciones</label>
                            <input
                                type="text"
                                name="restricciones"
                                value={formData.restricciones}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: Gluten, Lactosa"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/alimentos')}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AlimentoForm;
