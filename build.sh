#!/usr/bin/env bash
# Build script para Render

set -o errexit

echo "🚀 Iniciando build en Render..."

# Instalar dependencias de Composer
echo "📦 Instalando dependencias de PHP..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Instalar dependencias de Node
echo "📦 Instalando dependencias de Node..."
npm ci

# Compilar assets de frontend con Vite
echo "🎨 Compilando assets de frontend..."
npm run build

# Limpiar caché de configuración
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Optimizar para producción
echo "⚡ Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Build completado exitosamente!"
