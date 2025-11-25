import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './AppMain';
import '../css/app.css';

// Obtener el contenedor de la aplicación
const container = document.getElementById('app');

// Crear la raíz de la aplicación
const root = createRoot(container);

// Renderizar la aplicación
root.render(
    <React.StrictMode>
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// HMR (Hot Module Replacement) para desarrollo
if (import.meta.hot) {
    import.meta.hot.accept();
}
