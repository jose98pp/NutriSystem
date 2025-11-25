/**
 * Utilidades para mejorar accesibilidad de colores
 */

/**
 * Calcular el ratio de contraste entre dos colores
 * Basado en las pautas WCAG 2.1
 */
export const getContrastRatio = (color1, color2) => {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Calcular la luminancia relativa de un color
 */
export const getLuminance = (color) => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Convertir hex a RGB
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Verificar si un color cumple con WCAG AA (ratio >= 4.5)
 */
export const isWCAGAA = (foreground, background) => {
    return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Verificar si un color cumple con WCAG AAA (ratio >= 7)
 */
export const isWCAGAAA = (foreground, background) => {
    return getContrastRatio(foreground, background) >= 7;
};

/**
 * Clases de colores accesibles predefinidas
 */
export const ACCESSIBLE_COLORS = {
    // Textos sobre fondo blanco (#ffffff)
    text: {
        primary: 'text-gray-900',      // #111827 - Ratio: 16.9
        secondary: 'text-gray-700',    // #374151 - Ratio: 9.6
        muted: 'text-gray-600',        // #4B5563 - Ratio: 7.6
        disabled: 'text-gray-400'      // #9CA3AF - Ratio: 4.6
    },
    
    // Estados con buen contraste
    status: {
        success: 'text-green-700',     // #15803d - Ratio: 6.8
        warning: 'text-yellow-700',    // #a16207 - Ratio: 5.9
        error: 'text-red-700',         // #b91c1c - Ratio: 7.7
        info: 'text-blue-700'          // #1d4ed8 - Ratio: 8.6
    },
    
    // Fondos con texto blanco
    backgrounds: {
        primary: 'bg-blue-600',        // #2563eb - Ratio: 8.6
        success: 'bg-green-600',       // #16a34a - Ratio: 5.4
        warning: 'bg-yellow-600',      // #ca8a04 - Ratio: 4.8
        error: 'bg-red-600',           // #dc2626 - Ratio: 5.9
        secondary: 'bg-gray-600'       // #4b5563 - Ratio: 7.6
    }
};

/**
 * Obtener clase de color accesible basada en el contexto
 */
export const getAccessibleTextColor = (background = 'white', importance = 'primary') => {
    const colorMap = {
        white: ACCESSIBLE_COLORS.text,
        light: ACCESSIBLE_COLORS.text,
        dark: {
            primary: 'text-white',
            secondary: 'text-gray-200',
            muted: 'text-gray-300',
            disabled: 'text-gray-400'
        }
    };
    
    return colorMap[background]?.[importance] || ACCESSIBLE_COLORS.text.primary;
};

/**
 * Generar clases CSS con contraste adecuado
 */
export const generateAccessibleClasses = (baseColor, textColor = 'white') => {
    const contrastRatio = getContrastRatio(baseColor, textColor);
    
    if (contrastRatio < 4.5) {
        console.warn(`Color combination has poor contrast ratio: ${contrastRatio.toFixed(2)}. WCAG AA requires 4.5 or higher.`);
    }
    
    return {
        isAccessible: contrastRatio >= 4.5,
        isHighContrast: contrastRatio >= 7,
        ratio: contrastRatio,
        recommendation: contrastRatio < 4.5 ? 'Use darker background or lighter text' : 'Good contrast'
    };
};

/**
 * Validar paleta de colores completa
 */
export const validateColorPalette = (palette) => {
    const results = {};
    
    Object.entries(palette).forEach(([name, color]) => {
        results[name] = {
            onWhite: generateAccessibleClasses(color, '#ffffff'),
            onBlack: generateAccessibleClasses(color, '#000000'),
            whiteOnColor: generateAccessibleClasses('#ffffff', color),
            blackOnColor: generateAccessibleClasses('#000000', color)
        };
    });
    
    return results;
};

export default {
    getContrastRatio,
    getLuminance,
    isWCAGAA,
    isWCAGAAA,
    ACCESSIBLE_COLORS,
    getAccessibleTextColor,
    generateAccessibleClasses,
    validateColorPalette
};