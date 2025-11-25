import React from 'react';
import { useTranslation, LANGUAGES } from '../i18n';
import { Globe } from 'lucide-react';

/**
 * Selector de idioma
 */
const LanguageSelector = ({ className = '' }) => {
    const { language, setLanguage } = useTranslation();
    
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
    };
    
    return (
        <div className={`relative inline-block ${className}`}>
            <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Seleccionar idioma"
            >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                        {name}
                    </option>
                ))}
            </select>
            
            {/* Icono de globo */}
            <Globe 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                aria-hidden="true"
            />
            
            {/* Flecha hacia abajo */}
            <svg 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );
};

export default LanguageSelector;