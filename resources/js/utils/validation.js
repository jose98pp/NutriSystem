/**
 * Sistema de validación frontend mejorado
 */

import { t } from '../i18n';

/**
 * Reglas de validación
 */
export const validationRules = {
    required: (value) => {
        if (value === null || value === undefined || value === '') {
            return t('form.required');
        }
        return null;
    },
    
    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return t('form.email.invalid');
        }
        return null;
    },
    
    minLength: (min) => (value) => {
        if (!value) return null;
        if (value.length < min) {
            return t('form.password.min', { min });
        }
        return null;
    },
    
    maxLength: (max) => (value) => {
        if (!value) return null;
        if (value.length > max) {
            return `Máximo ${max} caracteres`;
        }
        return null;
    },
    
    min: (min) => (value) => {
        if (value === null || value === undefined || value === '') return null;
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < min) {
            return t('form.number.min', { min });
        }
        return null;
    },
    
    max: (max) => (value) => {
        if (value === null || value === undefined || value === '') return null;
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue > max) {
            return t('form.number.max', { max });
        }
        return null;
    },
    
    numeric: (value) => {
        if (!value) return null;
        if (isNaN(parseFloat(value))) {
            return 'Debe ser un número válido';
        }
        return null;
    },
    
    phone: (value) => {
        if (!value) return null;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return 'Número de teléfono inválido';
        }
        return null;
    },
    
    date: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        return null;
    },
    
    dateBeforeToday: (value) => {
        if (!value) return null;
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date >= today) {
            return 'La fecha debe ser anterior a hoy';
        }
        return null;
    },
    
    dateAfterToday: (value) => {
        if (!value) return null;
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (date <= today) {
            return 'La fecha debe ser posterior a hoy';
        }
        return null;
    },
    
    password: (value) => {
        if (!value) return null;
        
        const errors = [];
        
        if (value.length < 8) {
            errors.push('Al menos 8 caracteres');
        }
        
        if (!/[A-Z]/.test(value)) {
            errors.push('Al menos una mayúscula');
        }
        
        if (!/[a-z]/.test(value)) {
            errors.push('Al menos una minúscula');
        }
        
        if (!/\d/.test(value)) {
            errors.push('Al menos un número');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            errors.push('Al menos un carácter especial');
        }
        
        return errors.length > 0 ? `Contraseña debe tener: ${errors.join(', ')}` : null;
    },
    
    confirmPassword: (originalPassword) => (value) => {
        if (!value) return null;
        if (value !== originalPassword) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    },
    
    url: (value) => {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'URL inválida';
        }
    },
    
    // Validaciones específicas del dominio
    weight: (value) => {
        if (!value) return null;
        const weight = parseFloat(value);
        if (isNaN(weight) || weight < 10 || weight > 500) {
            return 'El peso debe estar entre 10 y 500 kg';
        }
        return null;
    },
    
    height: (value) => {
        if (!value) return null;
        const height = parseFloat(value);
        if (isNaN(height) || height < 0.3 || height > 3.0) {
            return 'La estatura debe estar entre 0.3 y 3.0 metros';
        }
        return null;
    },
    
    calories: (value) => {
        if (!value) return null;
        const calories = parseFloat(value);
        if (isNaN(calories) || calories < 0 || calories > 10000) {
            return 'Las calorías deben estar entre 0 y 10,000';
        }
        return null;
    }
};

/**
 * Validar un campo con múltiples reglas
 */
export const validateField = (value, rules) => {
    for (const rule of rules) {
        const error = rule(value);
        if (error) {
            return error;
        }
    }
    return null;
};

/**
 * Validar un objeto completo
 */
export const validateObject = (data, schema) => {
    const errors = {};
    let isValid = true;
    
    Object.entries(schema).forEach(([field, rules]) => {
        const error = validateField(data[field], rules);
        if (error) {
            errors[field] = error;
            isValid = false;
        }
    });
    
    return { isValid, errors };
};

/**
 * Hook para validación en tiempo real
 */
export const useValidation = (initialData = {}, schema = {}) => {
    const [data, setData] = React.useState(initialData);
    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});
    
    const validateField = (field, value) => {
        if (schema[field]) {
            const error = validateField(value, schema[field]);
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
            return error;
        }
        return null;
    };
    
    const handleChange = (field, value) => {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Validar solo si el campo ya fue tocado
        if (touched[field]) {
            validateField(field, value);
        }
    };
    
    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        
        validateField(field, data[field]);
    };
    
    const validateAll = () => {
        const { isValid, errors: allErrors } = validateObject(data, schema);
        setErrors(allErrors);
        setTouched(Object.keys(schema).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {}));
        return isValid;
    };
    
    const reset = (newData = initialData) => {
        setData(newData);
        setErrors({});
        setTouched({});
    };
    
    return {
        data,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
        isValid: Object.keys(errors).length === 0
    };
};

/**
 * Esquemas de validación predefinidos
 */
export const validationSchemas = {
    patient: {
        nombre: [validationRules.required, validationRules.maxLength(100)],
        apellido: [validationRules.required, validationRules.maxLength(100)],
        email: [validationRules.required, validationRules.email],
        fecha_nacimiento: [validationRules.required, validationRules.date, validationRules.dateBeforeToday],
        peso_inicial: [validationRules.weight],
        estatura: [validationRules.height],
        telefono: [validationRules.phone]
    },
    
    user: {
        name: [validationRules.required, validationRules.maxLength(255)],
        email: [validationRules.required, validationRules.email],
        password: [validationRules.required, validationRules.password]
    },
    
    food: {
        nombre: [validationRules.required, validationRules.maxLength(100)],
        calorias_por_100g: [validationRules.required, validationRules.calories],
        proteinas_por_100g: [validationRules.required, validationRules.min(0), validationRules.max(100)],
        carbohidratos_por_100g: [validationRules.required, validationRules.min(0), validationRules.max(100)],
        grasas_por_100g: [validationRules.required, validationRules.min(0), validationRules.max(100)]
    },
    
    evaluation: {
        peso_kg: [validationRules.required, validationRules.weight],
        altura_m: [validationRules.height],
        fecha: [validationRules.required, validationRules.date]
    }
};

export default {
    validationRules,
    validateField,
    validateObject,
    useValidation,
    validationSchemas
};