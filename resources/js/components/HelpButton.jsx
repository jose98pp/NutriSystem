import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import HelpTour from './HelpTour';

const HelpButton = ({ steps, className = '', buttonText = 'Ayuda' }) => {
    const [showHelp, setShowHelp] = useState(false);

    const handleClick = () => {
        setShowHelp(true);
    };

    const handleFinish = () => {
        setShowHelp(false);
    };

    return (
        <>
            <button
                onClick={handleClick}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${className}`}
                aria-label="Mostrar ayuda"
            >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                {buttonText && <span>{buttonText}</span>}
            </button>
            {showHelp && <HelpTour steps={steps} onFinish={handleFinish} />}
        </>
    );
};

export default HelpButton;
