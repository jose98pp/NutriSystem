import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    const needsOnboarding = user?.role === 'paciente' && localStorage.getItem('onboardingComplete') !== 'true';
    if (needsOnboarding && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // Si hay children, usarlos; si no, usar Outlet para rutas anidadas
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
