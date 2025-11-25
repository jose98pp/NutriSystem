import React, { useState } from 'react';
import { startHelpTour } from './HelpTour';

const HelpButtonSimple = ({ steps, className = '', buttonText = 'Ayuda' }) => {
    const handleClick = () => {
        startHelpTour(steps);
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${className}`}
            aria-label="Mostrar ayuda"
        >
            <span>❓</span>
            {buttonText && <span>{buttonText}</span>}
        </button>
    );
};

export default HelpButtonSimple;
