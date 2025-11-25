import React from 'react';

/**
 * Componente de loading accesible
 */
const LoadingSpinner = ({ 
    size = 'md', 
    color = 'primary', 
    text = 'Cargando...', 
    showText = true,
    className = '',
    fullScreen = false 
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };
    
    const colorClasses = {
        primary: 'text-primary-600',
        secondary: 'text-gray-600',
        white: 'text-white',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
    };
    
    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };
    
    const spinnerClasses = `animate-spin ${sizeClasses[size]} ${colorClasses[color]}`;
    const textClasses = `mt-2 ${textSizeClasses[size]} ${colorClasses[color]} font-medium`;
    
    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg 
                className={spinnerClasses}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                role="img"
                aria-label={text}
            >
                <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                />
                <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            
            {showText && (
                <p className={textClasses} aria-live="polite">
                    {text}
                </p>
            )}
        </div>
    );
    
    if (fullScreen) {
        return (
            <div 
                className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Cargando contenido"
            >
                {content}
            </div>
        );
    }
    
    return content;
};

/**
 * Componente de skeleton loading para listas
 */
export const SkeletonLoader = ({ 
    lines = 3, 
    className = '',
    showAvatar = false 
}) => {
    return (
        <div className={`animate-pulse ${className}`} role="status" aria-label="Cargando contenido">
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        {showAvatar && (
                            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                        )}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
            <span className="sr-only">Cargando...</span>
        </div>
    );
};

/**
 * Componente de loading para botones
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5'
    };
    
    return (
        <svg 
            className={`animate-spin ${sizeClasses[size]} ${className}`}
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            />
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};

export default LoadingSpinner;