#!/usr/bin/env bash
# Start script para Render

set -o errexit

echo "🚀 Iniciando aplicación..."

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
php artisan migrate --force --no-interaction

# Ejecutar seeders solo si es la primera vez (opcional)
# Descomentar la siguiente línea si quieres ejecutar seeders en el primer deploy
# php artisan db:seed --force --no-interaction

# Crear enlace simbólico de storage
echo "🔗 Creando enlace simbólico de storage..."
php artisan storage:link || true

# Limpiar y optimizar
echo "⚡ Optimizando aplicación..."
php artisan optimize

# Iniciar servidor PHP
echo "✅ Iniciando servidor en puerto $PORT..."
php artisan serve --host=0.0.0.0 --port=$PORT --no-reload
