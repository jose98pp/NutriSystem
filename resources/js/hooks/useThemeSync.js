import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * useThemeSync - Hook for syncing theme from realtime events
 * Task 19: Implementar sincronización de tema en Web
 * Requirements: 7
 */
export function useThemeSync() {
    const { setDarkModeWithoutSync } = useTheme();

    useEffect(() => {
        /**
         * Handle theme updates from other devices
         */
        const handleThemeUpdate = (event) => {
            const { theme } = event.detail;
            console.log('[useThemeSync] Theme updated from other device:', theme);
            
            if (theme === 'dark') {
                setDarkModeWithoutSync(true);
            } else if (theme === 'light') {
                setDarkModeWithoutSync(false);
            } else if (theme === 'system') {
                // Apply system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setDarkModeWithoutSync(prefersDark);
            }
        };

        // Listen for theme updates from realtime
        window.addEventListener('theme-updated', handleThemeUpdate);

        return () => {
            window.removeEventListener('theme-updated', handleThemeUpdate);
        };
    }, [setDarkModeWithoutSync]);
}

export default useThemeSync;
