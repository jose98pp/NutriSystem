import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmailVerification from './pages/Auth/EmailVerification';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes/Index';
import PacienteForm from './pages/Pacientes/Form';
import Alimentos from './pages/Alimentos/Index';
import AlimentoForm from './pages/Alimentos/Form';
import Planes from './pages/Planes/Index';
import PlanForm from './pages/Planes/Form';
import PlanFormMejorado from './pages/Planes/FormMejorado';
import PlanView from './pages/Planes/View';
import Ingestas from './pages/Ingestas/Index';
import IngestaForm from './pages/Ingestas/Form';
import Evaluaciones from './pages/Evaluaciones/Index';
import EvaluacionForm from './pages/Evaluaciones/Form';
import Reportes from './pages/Reportes/Index';
import Notificaciones from './pages/Notificaciones/Index';
import Mensajes from './pages/Mensajes/Index';
import FotosProgreso from './pages/FotosProgreso/Index';
import Servicios from './pages/Servicios/Index';
import ServicioForm from './pages/Servicios/Form';
import Contratos from './pages/Contratos/Index';
import ContratoForm from './pages/Contratos/Form';
import ContratoView from './pages/Contratos/View';
import Nutricionistas from './pages/Nutricionistas/Index';
import NutricionistaForm from './pages/Nutricionistas/Form';
import NutricionistaPacientes from './pages/Nutricionistas/Pacientes';
import Perfil from './pages/Perfil/Index';
import ChangePassword from './pages/Perfil/ChangePassword';
import Direcciones from './pages/Direcciones/Index';
import DireccionForm from './pages/Direcciones/FormMejorado';
import Recetas from './pages/Recetas/Index';
import RecetaForm from './pages/Recetas/Form';
import AnalisisClinicos from './pages/AnalisisClinicos/Index';
import AnalisisClinicoForm from './pages/AnalisisClinicos/Form';
import CalendariosEntrega from './pages/CalendariosEntrega/Index';
import CalendarioEntregaForm from './pages/CalendariosEntrega/Form';
import Entregas from './pages/Entregas/Index';
import EntregaView from './pages/Entregas/View';
import MisDirecciones from './pages/MisDirecciones/Index';
import MisRecetas from './pages/MisRecetas/Index';
import MisAnalisis from './pages/MisAnalisis/Index';
import MiCalendario from './pages/MiCalendario/Index';
import MisEntregas from './pages/MisEntregas/Index';
import MiMenuSemanal from './pages/MiMenuSemanal/IndexSimplificado';
import MisComidasHoy from './pages/MisComidasHoy/Index';
import MiPlan from './pages/MiPlan/Index';
import VideollamadaRoom from './pages/Videollamada/Room';
import MisSesionesPaciente from './pages/MisSesiones/Index';

// Rutinas y Ejercicios
import BibliotecaEjercicios from './pages/Rutinas/BibliotecaEjercicios';
import EjercicioDetalle from './pages/Rutinas/EjercicioDetalle';
import GestionEjercicios from './pages/Rutinas/GestionEjercicios';
import MisRutinas from './pages/Rutinas/MisRutinas';
import RutinaDetalle from './pages/Rutinas/RutinaDetalle';
import GestionRutinas from './pages/Rutinas/GestionRutinas';
import SesionEntrenamiento from './pages/Rutinas/SesionEntrenamiento';
import HistorialSesiones from './pages/Rutinas/HistorialSesiones';
import SesionesIndex from './pages/Sesiones/Index';
import SesionForm from './pages/Sesiones/Form';
import SesionView from './pages/Sesiones/View';
import Inicio from './pages/Inicio/Index.jsx';
import InicioPlanes from './pages/Inicio/Planes';
import InicioNutricionistas from './pages/Inicio/Nutricionitas';
import InicioPsicologos from './pages/Inicio/Psicologos';
import InicioRecetas from './pages/Inicio/Recetas';
import InicioEmergencias from './pages/Inicio/Emergencias';
import OAuthSuccess from './pages/Auth/OAuthSuccess';


function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomeRouter />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/onboarding" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/inicio" element={<Navigate to="/" replace />} />
                    <Route path="/inicio/planes" element={<InicioPlanes />} />
                    <Route path="/inicio/nutricionistas" element={<InicioNutricionistas />} />
                    <Route path="/inicio/psicologos" element={<InicioPsicologos />} />
                    <Route path="/inicio/recetas" element={<InicioRecetas />} />
                    <Route path="/inicio/emergencia" element={<InicioEmergencias />} />
                    <Route path="/oauth-success" element={<OAuthSuccess />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                            
                            {/* Pacientes */}
                            <Route path="/pacientes" element={<Pacientes />} />
                            <Route path="/pacientes/nuevo" element={<PacienteForm />} />
                            <Route path="/pacientes/:id/editar" element={<PacienteForm />} />
                            
                            {/* Alimentos */}
                            <Route path="/alimentos" element={<Alimentos />} />
                            <Route path="/alimentos/nuevo" element={<AlimentoForm />} />
                            <Route path="/alimentos/:id/editar" element={<AlimentoForm />} />
                            
                            {/* Planes */}
                            <Route path="/planes" element={<Planes />} />
                            <Route path="/planes/nuevo" element={<PlanFormMejorado />} />
                            <Route path="/planes/:id/editar" element={<PlanFormMejorado />} />
                            <Route path="/planes/:id" element={<PlanView />} />
                            
                            {/* Ingestas */}
                            <Route path="/ingestas" element={<Ingestas />} />
                            <Route path="/ingestas/nueva" element={<IngestaForm />} />
                            
                            {/* Evaluaciones */}
                            <Route path="/evaluaciones" element={<Evaluaciones />} />
                            <Route path="/evaluaciones/nueva" element={<EvaluacionForm />} />
                            
                            {/* Servicios */}
                            <Route path="/servicios" element={<Servicios />} />
                            <Route path="/servicios/nuevo" element={<ServicioForm />} />
                            <Route path="/servicios/:id/editar" element={<ServicioForm />} />
                            
                            {/* Contratos */}
                            <Route path="/contratos" element={<Contratos />} />
                            <Route path="/contratos/nuevo" element={<ContratoForm />} />
                            <Route path="/contratos/:id" element={<ContratoView />} />
                            <Route path="/contratos/:id/editar" element={<ContratoForm />} />
                            
                            {/* Nutricionistas */}
                            <Route path="/nutricionistas" element={<Nutricionistas />} />
                            <Route path="/nutricionistas/nuevo" element={<NutricionistaForm />} />
                            <Route path="/nutricionistas/:id/pacientes" element={<NutricionistaPacientes />} />
                            <Route path="/nutricionistas/:id/editar" element={<NutricionistaForm />} />
                            
                            {/* Perfil */}
                            <Route path="/perfil" element={<Perfil />} />
                            <Route path="/perfil/cambiar-password" element={<ChangePassword />} />
                            
                            {/* Reportes */}
                            <Route path="/reportes" element={<Reportes />} />
                            
                            {/* Notificaciones */}
                            <Route path="/notificaciones" element={<Notificaciones />} />
                            
                            {/* Mensajes */}
                            <Route path="/mensajes" element={<Mensajes />} />
                        <Route path="/videollamada/:id" element={<VideollamadaRoom />} />
                            
                            {/* Fotos de Progreso */}
                            <Route path="/fotos-progreso" element={<FotosProgreso />} />
                            
                            {/* Direcciones */}
                            <Route path="/direcciones" element={<Direcciones />} />
                            <Route path="/direcciones/nuevo" element={<DireccionForm />} />
                            <Route path="/direcciones/:id/editar" element={<DireccionForm />} />
                            
                            {/* Recetas */}
                            <Route path="/recetas" element={<Recetas />} />
                            <Route path="/recetas/nuevo" element={<RecetaForm />} />
                            <Route path="/recetas/:id/editar" element={<RecetaForm />} />
                            
                            {/* Análisis Clínicos */}
                            <Route path="/analisis-clinicos" element={<AnalisisClinicos />} />
                            <Route path="/analisis-clinicos/nuevo" element={<AnalisisClinicoForm />} />
                            <Route path="/analisis-clinicos/:id/editar" element={<AnalisisClinicoForm />} />
                            
                            {/* Calendarios de Entrega */}
                            <Route path="/calendarios-entrega" element={<CalendariosEntrega />} />
                            <Route path="/calendarios-entrega/nuevo" element={<CalendarioEntregaForm />} />
                            <Route path="/calendarios-entrega/:id/editar" element={<CalendarioEntregaForm />} />
                            
                            {/* Entregas Programadas */}
                            <Route path="/entregas" element={<Entregas />} />
                            <Route path="/entregas/:id" element={<EntregaView />} />
                            
                            {/* Vistas para Pacientes */}
                            <Route path="/mi-plan" element={<MiPlan />} />
                            <Route path="/mis-sesiones" element={<MisSesionesPaciente />} />
                            <Route path="/mis-direcciones" element={<MisDirecciones />} />
                            <Route path="/mis-recetas" element={<MisRecetas />} />
                            <Route path="/mis-analisis" element={<MisAnalisis />} />
                            <Route path="/mi-calendario" element={<MiCalendario />} />
                            <Route path="/mis-entregas" element={<MisEntregas />} />
                            <Route path="/mi-menu-semanal" element={<MiMenuSemanal />} />
                            <Route path="/mis-comidas-hoy" element={<MisComidasHoy />} />
                            
                            {/* Rutinas y Ejercicios */}
                            <Route path="/rutinas" element={<MisRutinas />} />
                            <Route path="/rutinas/ejercicios" element={<BibliotecaEjercicios />} />
                            <Route path="/rutinas/ejercicios/:id" element={<EjercicioDetalle />} />
                            <Route path="/rutinas/gestion-ejercicios" element={<GestionEjercicios />} />
                            <Route path="/rutinas/gestion" element={<GestionRutinas />} />
                            <Route path="/rutinas/crear" element={<GestionRutinas />} />
                            <Route path="/rutinas/:id" element={<RutinaDetalle />} />
                            <Route path="/rutinas/sesion/:id" element={<SesionEntrenamiento />} />
                        <Route path="/rutinas/historial" element={<HistorialSesiones />} />

                            {/* Sesiones (CRUD) */}
                            <Route path="/sesiones" element={<SesionesIndex />} />
                            <Route path="/sesiones/nueva" element={<SesionForm />} />
                            <Route path="/sesiones/:id" element={<SesionView />} />
                            <Route path="/sesiones/:id/editar" element={<SesionForm />} />
                    </Route>
                    
                    {/* Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ConfirmProvider>
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;

function HomeRouter() {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) {
        const needsOnboarding = user.role === 'paciente' && localStorage.getItem('onboardingComplete') !== 'true';
        return needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" replace />;
    }
    return <Inicio />;
}
