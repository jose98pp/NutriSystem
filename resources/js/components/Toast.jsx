import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Context para el sistema de Toast
const ToastContext = createContext();

// Hook para usar el sistema de Toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe ser usado dentro de un ToastProvider');
    }
    return context;
};

// Componente individual de Toast
const Toast = ({ toast, onRemove }) => {
    const { id, message, type, duration } = toast;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onRemove(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onRemove]);

    const getIcon = () => {
        const iconClass = "w-6 h-6 text-white";
        const wrapperClass = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg";
        
        switch (type) {
            case 'success':
                return <div className={`${wrapperClass} bg-green-500`}><CheckCircle className={iconClass} /></div>;
            case 'error':
                return <div className={`${wrapperClass} bg-red-500`}><XCircle className={iconClass} /></div>;
            case 'warning':
                return <div className={`${wrapperClass} bg-yellow-500`}><AlertCircle className={iconClass} /></div>;
            default:
                return <div className={`${wrapperClass} bg-blue-500`}><Info className={iconClass} /></div>;
        }
    };

    const getStyles = () => {
        const baseStyles = "flex items-center gap-3 p-4 rounded-2xl shadow-xl border max-w-md w-full transform transition-all duration-300 ease-in-out backdrop-blur-sm animate-slideIn";
        
        switch (type) {
            case 'success':
                return `${baseStyles} bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-200`;
            case 'error':
                return `${baseStyles} bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200`;
            case 'warning':
                return `${baseStyles} bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-200`;
            default:
                return `${baseStyles} bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-200 dark:border-blue-700/50 text-blue-800 dark:text-blue-200`;
        }
    };

    return (
        <div className={getStyles()} role="alert">
            {getIcon()}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed">{message}</p>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                aria-label="Cerrar notificación"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

// Contenedor de Toasts
const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

// Provider del sistema de Toast
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);
        
        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearAllToasts = () => {
        setToasts([]);
    };

    // Funciones de conveniencia
    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);
    const info = (message, duration) => addToast(message, 'info', duration);

    const value = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export default Toast;