import { useEffect, useRef, useCallback } from 'react';
import { logPerformance } from '../utils/logger';

/**
 * Hook para medir performance de componentes y operaciones
 */
export const usePerformance = (componentName) => {
    const startTime = useRef(null);
    const renderCount = useRef(0);
    
    // Medir tiempo de montaje del componente
    useEffect(() => {
        startTime.current = performance.now();
        renderCount.current++;
        
        return () => {
            if (startTime.current) {
                const mountTime = performance.now() - startTime.current;
                logPerformance(`${componentName} Mount`, mountTime, {
                    renderCount: renderCount.current
                });
            }
        };
    }, [componentName]);
    
    // Función para medir operaciones específicas
    const measureOperation = useCallback((operationName, operation) => {
        return async (...args) => {
            const start = performance.now();
            
            try {
                const result = await operation(...args);
                const duration = performance.now() - start;
                
                logPerformance(`${componentName} - ${operationName}`, duration, {
                    success: true,
                    args: args.length
                });
                
                return result;
            } catch (error) {
                const duration = performance.now() - start;
                
                logPerformance(`${componentName} - ${operationName}`, duration, {
                    success: false,
                    error: error.message,
                    args: args.length
                });
                
                throw error;
            }
        };
    }, [componentName]);
    
    // Función para marcar inicio de operación
    const startMeasure = useCallback((operationName) => {
        const markName = `${componentName}-${operationName}-start`;
        performance.mark(markName);
        return markName;
    }, [componentName]);
    
    // Función para finalizar medición
    const endMeasure = useCallback((operationName, startMark) => {
        const endMarkName = `${componentName}-${operationName}-end`;
        const measureName = `${componentName}-${operationName}`;
        
        performance.mark(endMarkName);
        performance.measure(measureName, startMark, endMarkName);
        
        const measure = performance.getEntriesByName(measureName)[0];
        if (measure) {
            logPerformance(measureName, measure.duration);
        }
        
        // Limpiar marcas
        performance.clearMarks(startMark);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
        
        return measure?.duration;
    }, [componentName]);
    
    return {
        measureOperation,
        startMeasure,
        endMeasure,
        renderCount: renderCount.current
    };
};

/**
 * Hook para medir performance de API calls
 */
export const useApiPerformance = () => {
    const measureApiCall = useCallback(async (apiCall, endpoint) => {
        const start = performance.now();
        
        try {
            const result = await apiCall();
            const duration = performance.now() - start;
            
            logPerformance(`API Call: ${endpoint}`, duration, {
                success: true,
                status: result?.status
            });
            
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            
            logPerformance(`API Call: ${endpoint}`, duration, {
                success: false,
                status: error.response?.status,
                error: error.message
            });
            
            throw error;
        }
    }, []);
    
    return { measureApiCall };
};

/**
 * Hook para detectar renders innecesarios
 */
export const useRenderTracker = (componentName, props = {}) => {
    const renderCount = useRef(0);
    const prevProps = useRef(props);
    
    useEffect(() => {
        renderCount.current++;
        
        // Detectar qué props cambiaron
        const changedProps = {};
        Object.keys(props).forEach(key => {
            if (prevProps.current[key] !== props[key]) {
                changedProps[key] = {
                    from: prevProps.current[key],
                    to: props[key]
                };
            }
        });
        
        if (Object.keys(changedProps).length > 0) {
            logPerformance(`${componentName} Re-render`, 0, {
                renderCount: renderCount.current,
                changedProps
            });
        }
        
        prevProps.current = props;
    });
    
    return renderCount.current;
};

/**
 * Hook para medir tiempo de carga de datos
 */
export const useLoadingPerformance = (dataName) => {
    const startTime = useRef(null);
    
    const startLoading = useCallback(() => {
        startTime.current = performance.now();
    }, []);
    
    const endLoading = useCallback((dataSize = null) => {
        if (startTime.current) {
            const duration = performance.now() - startTime.current;
            
            logPerformance(`Data Loading: ${dataName}`, duration, {
                dataSize,
                timestamp: new Date().toISOString()
            });
            
            startTime.current = null;
            return duration;
        }
        return null;
    }, [dataName]);
    
    return { startLoading, endLoading };
};

/**
 * Hook para monitorear memory usage (solo en desarrollo)
 */
export const useMemoryMonitor = (componentName) => {
    useEffect(() => {
        if (import.meta.env.DEV && 'memory' in performance) {
            const checkMemory = () => {
                const memory = performance.memory;
                
                logPerformance(`${componentName} Memory`, 0, {
                    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
                    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
                    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
                });
            };
            
            // Verificar memoria cada 30 segundos
            const interval = setInterval(checkMemory, 30000);
            
            return () => clearInterval(interval);
        }
    }, [componentName]);
};

export default {
    usePerformance,
    useApiPerformance,
    useRenderTracker,
    useLoadingPerformance,
    useMemoryMonitor
};