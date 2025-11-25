import React from 'react';

/**
 * Input accesible con soporte completo para ARIA y validación
 */
const AccessibleInput = ({
    label,
    id,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    disabled = false,
    error,
    helpText,
    className = '',
    inputClassName = '',
    ...props
}) => {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
    
    const inputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary-500 
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        ${error 
            ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-primary-500'
        }
        ${inputClassName}
    `.trim();
    
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label 
                    htmlFor={inputId}
                    className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1" aria-label="requerido">*</span>
                    )}
                </label>
            )}
            
            <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={inputClasses}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={describedBy}
                aria-required={required}
                {...props}
            />
            
            {error && (
                <p 
                    id={errorId}
                    className="text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
            
            {helpText && !error && (
                <p 
                    id={helpId}
                    className="text-sm text-gray-500"
                >
                    {helpText}
                </p>
            )}
        </div>
    );
};

export default AccessibleInput;