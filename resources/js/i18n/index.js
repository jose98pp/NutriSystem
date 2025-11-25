/**
 * Sistema básico de internacionalización
 */

// Idiomas disponibles
export const LANGUAGES = {
    es: 'Español',
    en: 'English'
};

// Idioma por defecto
export const DEFAULT_LANGUAGE = 'es';

// Traducciones
const translations = {
    es: {
        // Navegación
        'nav.dashboard': 'Dashboard',
        'nav.patients': 'Pacientes',
        'nav.foods': 'Alimentos',
        'nav.plans': 'Planes',
        'nav.intakes': 'Ingestas',
        'nav.evaluations': 'Evaluaciones',
        'nav.reports': 'Reportes',
        'nav.messages': 'Mensajes',
        'nav.notifications': 'Notificaciones',
        'nav.profile': 'Perfil',
        'nav.logout': 'Cerrar Sesión',
        
        // Acciones comunes
        'action.save': 'Guardar',
        'action.cancel': 'Cancelar',
        'action.delete': 'Eliminar',
        'action.edit': 'Editar',
        'action.view': 'Ver',
        'action.create': 'Crear',
        'action.search': 'Buscar',
        'action.filter': 'Filtrar',
        'action.export': 'Exportar',
        'action.print': 'Imprimir',
        'action.close': 'Cerrar',
        'action.confirm': 'Confirmar',
        'action.loading': 'Cargando...',
        
        // Estados
        'status.active': 'Activo',
        'status.inactive': 'Inactivo',
        'status.pending': 'Pendiente',
        'status.completed': 'Completado',
        'status.cancelled': 'Cancelado',
        
        // Mensajes
        'message.success.save': 'Guardado exitosamente',
        'message.success.delete': 'Eliminado exitosamente',
        'message.success.update': 'Actualizado exitosamente',
        'message.error.generic': 'Ha ocurrido un error',
        'message.error.network': 'Error de conexión',
        'message.error.validation': 'Por favor, revisa los datos ingresados',
        'message.confirm.delete': '¿Estás seguro de eliminar este elemento?',
        'message.no_data': 'No hay datos disponibles',
        
        // Formularios
        'form.required': 'Este campo es requerido',
        'form.email.invalid': 'Email inválido',
        'form.password.min': 'La contraseña debe tener al menos 8 caracteres',
        'form.number.min': 'El valor debe ser mayor a {min}',
        'form.number.max': 'El valor debe ser menor a {max}',
        
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Bienvenido',
        'dashboard.stats.patients': 'Pacientes',
        'dashboard.stats.plans': 'Planes',
        'dashboard.stats.evaluations': 'Evaluaciones',
        'dashboard.stats.messages': 'Mensajes',
        
        // Pacientes
        'patients.title': 'Pacientes',
        'patients.new': 'Nuevo Paciente',
        'patients.name': 'Nombre',
        'patients.email': 'Email',
        'patients.phone': 'Teléfono',
        'patients.weight': 'Peso',
        'patients.height': 'Estatura',
        'patients.bmi': 'IMC',
        
        // Fechas
        'date.today': 'Hoy',
        'date.yesterday': 'Ayer',
        'date.tomorrow': 'Mañana',
        'date.week': 'Semana',
        'date.month': 'Mes',
        'date.year': 'Año',
        
        // Días de la semana
        'day.monday': 'Lunes',
        'day.tuesday': 'Martes',
        'day.wednesday': 'Miércoles',
        'day.thursday': 'Jueves',
        'day.friday': 'Viernes',
        'day.saturday': 'Sábado',
        'day.sunday': 'Domingo',
        
        // Meses
        'month.january': 'Enero',
        'month.february': 'Febrero',
        'month.march': 'Marzo',
        'month.april': 'Abril',
        'month.may': 'Mayo',
        'month.june': 'Junio',
        'month.july': 'Julio',
        'month.august': 'Agosto',
        'month.september': 'Septiembre',
        'month.october': 'Octubre',
        'month.november': 'Noviembre',
        'month.december': 'Diciembre'
    },
    
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.patients': 'Patients',
        'nav.foods': 'Foods',
        'nav.plans': 'Plans',
        'nav.intakes': 'Intakes',
        'nav.evaluations': 'Evaluations',
        'nav.reports': 'Reports',
        'nav.messages': 'Messages',
        'nav.notifications': 'Notifications',
        'nav.profile': 'Profile',
        'nav.logout': 'Logout',
        
        // Common actions
        'action.save': 'Save',
        'action.cancel': 'Cancel',
        'action.delete': 'Delete',
        'action.edit': 'Edit',
        'action.view': 'View',
        'action.create': 'Create',
        'action.search': 'Search',
        'action.filter': 'Filter',
        'action.export': 'Export',
        'action.print': 'Print',
        'action.close': 'Close',
        'action.confirm': 'Confirm',
        'action.loading': 'Loading...',
        
        // Status
        'status.active': 'Active',
        'status.inactive': 'Inactive',
        'status.pending': 'Pending',
        'status.completed': 'Completed',
        'status.cancelled': 'Cancelled',
        
        // Messages
        'message.success.save': 'Saved successfully',
        'message.success.delete': 'Deleted successfully',
        'message.success.update': 'Updated successfully',
        'message.error.generic': 'An error occurred',
        'message.error.network': 'Connection error',
        'message.error.validation': 'Please check the entered data',
        'message.confirm.delete': 'Are you sure you want to delete this item?',
        'message.no_data': 'No data available',
        
        // Forms
        'form.required': 'This field is required',
        'form.email.invalid': 'Invalid email',
        'form.password.min': 'Password must be at least 8 characters',
        'form.number.min': 'Value must be greater than {min}',
        'form.number.max': 'Value must be less than {max}',
        
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Welcome',
        'dashboard.stats.patients': 'Patients',
        'dashboard.stats.plans': 'Plans',
        'dashboard.stats.evaluations': 'Evaluations',
        'dashboard.stats.messages': 'Messages',
        
        // Patients
        'patients.title': 'Patients',
        'patients.new': 'New Patient',
        'patients.name': 'Name',
        'patients.email': 'Email',
        'patients.phone': 'Phone',
        'patients.weight': 'Weight',
        'patients.height': 'Height',
        'patients.bmi': 'BMI',
        
        // Dates
        'date.today': 'Today',
        'date.yesterday': 'Yesterday',
        'date.tomorrow': 'Tomorrow',
        'date.week': 'Week',
        'date.month': 'Month',
        'date.year': 'Year',
        
        // Days of the week
        'day.monday': 'Monday',
        'day.tuesday': 'Tuesday',
        'day.wednesday': 'Wednesday',
        'day.thursday': 'Thursday',
        'day.friday': 'Friday',
        'day.saturday': 'Saturday',
        'day.sunday': 'Sunday',
        
        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December'
    }
};

// Obtener idioma actual del localStorage o usar por defecto
export const getCurrentLanguage = () => {
    return localStorage.getItem('language') || DEFAULT_LANGUAGE;
};

// Cambiar idioma
export const setLanguage = (language) => {
    if (LANGUAGES[language]) {
        localStorage.setItem('language', language);
        // Recargar la página para aplicar cambios
        window.location.reload();
    }
};

// Función principal de traducción
export const t = (key, params = {}) => {
    const language = getCurrentLanguage();
    const translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
    
    // Reemplazar parámetros en la traducción
    return Object.keys(params).reduce((text, param) => {
        return text.replace(`{${param}}`, params[param]);
    }, translation);
};

// Hook para usar traducciones en componentes React
export const useTranslation = () => {
    const currentLanguage = getCurrentLanguage();
    
    return {
        t,
        language: currentLanguage,
        setLanguage,
        languages: LANGUAGES
    };
};

export default { t, useTranslation, getCurrentLanguage, setLanguage, LANGUAGES };