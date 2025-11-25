#!/bin/bash
set -e

echo "🚀 Iniciando aplicación Laravel..."

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
php artisan migrate --force --no-interaction

# Crear enlace simbólico de storage
echo "🔗 Creando enlace simbólico de storage..."
php artisan storage:link || true

# Optimizar aplicación
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Aplicación lista!"

# Iniciar Apache
apache2-foreground
