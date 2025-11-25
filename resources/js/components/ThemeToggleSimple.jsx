import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleSimple = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {darkMode ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggleSimple;
