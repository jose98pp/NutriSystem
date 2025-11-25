import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="min-h-screen bg-gray-50">
                    <h1>Test App</h1>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
