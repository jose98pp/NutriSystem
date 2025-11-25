import React, { useState, createContext, useContext } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Context para el sistema de confirmación
const ConfirmContext = createContext();

// Hook para usar el sistema de confirmación
export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
    }
    return context;
};

// Componente de diálogo de confirmación
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-white" />,
                    confirmButton: 'btn-danger',
                    iconBg: 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-white" />,
                    confirmButton: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-medium',
                    iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-white" />,
                    confirmButton: 'btn-primary',
                    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Overlay con blur */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl transform transition-all max-w-lg w-full animate-fadeIn">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
                                {styles.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
                    </div>
                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            type="button"
                            className="flex-1 btn-secondary"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 ${styles.confirmButton}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Provider del sistema de confirmación
export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'default',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const confirm = ({
        title = '¿Estás seguro?',
        message = 'Esta acción no se puede deshacer.',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'default'
    }) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                type,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    };

    const handleClose = () => {
        confirmState.onCancel();
    };

    const handleConfirm = () => {
        confirmState.onConfirm();
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                type={confirmState.type}
            />
        </ConfirmContext.Provider>
    );
};

export default ConfirmDialog;