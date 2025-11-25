# 🚀 Guía de Deploy en Render

Esta guía te ayudará a desplegar tu aplicación Laravel + React en Render de forma gratuita.

---

## 📋 Requisitos Previos

- ✅ Cuenta en [Render](https://render.com) (gratis)
- ✅ Repositorio Git (GitHub, GitLab o Bitbucket)
- ✅ Tu código debe estar en un repositorio remoto

---

## 🎯 Paso 1: Preparar tu Repositorio

### 1.1 Asegurar que los archivos de configuración estén en tu repositorio

Los siguientes archivos ya fueron creados en tu proyecto:

- ✅ `render.yaml` - Configuración de servicios
- ✅ `Dockerfile` - Imagen Docker con PHP 8.2 + Apache
- ✅ `docker/apache.conf` - Configuración de Apache
- ✅ `docker/start.sh` - Script de inicio del contenedor
- ✅ `.dockerignore` - Archivos excluidos del build
- ✅ `build.sh` - Script de construcción (legacy)
- ✅ `start.sh` - Script de inicio (legacy)
- ✅ `.env.render` - Plantilla de variables de entorno

### 1.2 Actualizar .gitignore

Asegúrate de que tu `.gitignore` incluya:

```gitignore
/node_modules
/public/hot
/public/storage
/public/build
/storage/*.key
/vendor
.env
.env.backup
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
```

### 1.3 Hacer commit y push

```bash
git add .
git commit -m "Configuración para deploy en Render"
git push origin main
```

---

## 🌐 Paso 2: Crear Servicios en Render

### 2.1 Acceder a Render Dashboard

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Inicia sesión o crea una cuenta

### 2.2 Opción A: Deploy Automático con render.yaml (Recomendado)

> [!NOTE]
> Esta aplicación usa **Docker** como runtime. Render construirá una imagen Docker con PHP 8.2 + Apache automáticamente.

1. Click en **"New +"** → **"Blueprint"**
2. Conecta tu repositorio
3. Render detectará automáticamente el archivo `render.yaml`
4. Click en **"Apply"**
5. Render creará automáticamente:
   - ✅ Servicio Web (Laravel + React con Docker)
   - ✅ Base de datos MySQL

### 2.2 Opción B: Deploy Manual

Si prefieres configurar manualmente:

#### Crear Base de Datos MySQL

1. Click en **"New +"** → **"MySQL"**
2. Configura:
   - **Name:** `nutricion-db`
   - **Database:** `nutricion_fusion`
   - **Plan:** Free
3. Click en **"Create Database"**
4. **Guarda las credenciales** que aparecen (las necesitarás después)

#### Crear Web Service

1. Click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio
3. Configura:
   - **Name:** `nutricion-app`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Context:** `.`
   - **Plan:** Free

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Variables Esenciales

En el dashboard de tu Web Service, ve a **"Environment"** y agrega:

#### Aplicación Básica
```env
APP_NAME=Sistema Nutricional
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-app.onrender.com
```

#### Generar APP_KEY

Necesitas generar una clave de aplicación. Tienes dos opciones:

**Opción 1: Localmente**
```bash
php artisan key:generate --show
```

**Opción 2: En Render (después del primer deploy)**
```bash
# Conéctate al shell de Render y ejecuta:
php artisan key:generate
```

Agrega la clave generada:
```env
APP_KEY=base64:tu_clave_generada_aqui
```

#### Base de Datos

Si usaste la opción automática (Blueprint), estas variables se configuran automáticamente.

Si configuraste manualmente, agrega:
```env
DB_CONNECTION=mysql
DB_HOST=tu-host-mysql.render.com
DB_PORT=3306
DB_DATABASE=nutricion_fusion
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

#### Sesiones y Caché
```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_DRIVER=database
QUEUE_CONNECTION=database
```

#### Sanctum (Autenticación)

> [!IMPORTANT]
> Reemplaza `tu-app.onrender.com` con tu URL real de Render

```env
SANCTUM_STATEFUL_DOMAINS=tu-app.onrender.com
SESSION_DOMAIN=.tu-app.onrender.com
ASSET_URL=https://tu-app.onrender.com
```

#### Logs
```env
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 3.2 Guardar Variables

Click en **"Save Changes"** - Esto reiniciará tu servicio automáticamente.

---

## 🔧 Paso 4: Configuraciones Adicionales

### 4.1 Actualizar config/cors.php

Asegúrate de que tu configuración CORS permita tu dominio de Render:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_origins' => [
    env('APP_URL'),
    'https://tu-app.onrender.com',
],

'supports_credentials' => true,
```

### 4.2 Actualizar config/session.php

```php
'domain' => env('SESSION_DOMAIN', null),
'secure' => env('APP_ENV') === 'production',
'same_site' => 'lax',
```

### 4.3 Actualizar config/sanctum.php

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost')),
```

---

## 🚀 Paso 5: Deploy

### 5.1 Trigger Deploy

Si todo está configurado:

1. Render iniciará el build automáticamente
2. Puedes ver los logs en tiempo real
3. El proceso tomará 5-10 minutos la primera vez

### 5.2 Monitorear el Build

En el dashboard verás:
- 📦 Instalando dependencias de PHP...
- 📦 Instalando dependencias de Node...
- 🎨 Compilando assets de frontend...
- 🧹 Limpiando caché...
- ⚡ Optimizando para producción...
- ✅ Build completado exitosamente!

### 5.3 Monitorear el Start

Después del build:
- 📊 Ejecutando migraciones de base de datos...
- 🔗 Creando enlace simbólico de storage...
- ⚡ Optimizando aplicación...
- ✅ Iniciando servidor...

---

## ✅ Paso 6: Verificar el Deploy

### 6.1 Acceder a tu Aplicación

1. Ve a la URL de tu servicio: `https://tu-app.onrender.com`
2. Deberías ver la página de login de tu aplicación

### 6.2 Poblar la Base de Datos (Primera vez)

Si es tu primer deploy y necesitas los datos de prueba:

1. Ve a tu servicio en Render
2. Click en **"Shell"** (terminal)
3. Ejecuta:

```bash
php artisan db:seed --force
```

Esto creará:
- ✅ Usuarios de prueba
- ✅ Alimentos del catálogo
- ✅ Servicios
- ✅ Datos de ejemplo

### 6.3 Probar Login

Usa las credenciales de prueba:

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nutricion.com | password123 |
| Nutricionista | carlos@nutricion.com | password123 |
| Paciente | juan@example.com | password123 |

---

## 🐛 Solución de Problemas

### Error: "No application encryption key has been specified"

**Solución:**
1. Ve a Environment variables
2. Genera una clave: `php artisan key:generate --show`
3. Agrega `APP_KEY=base64:tu_clave`
4. Guarda y redeploy

### Error: "SQLSTATE[HY000] [2002] Connection refused"

**Solución:**
1. Verifica que la base de datos esté creada
2. Verifica las credenciales de DB_* en Environment
3. Asegúrate de que el servicio web esté conectado a la base de datos

### Error: "Mix manifest not found"

**Solución:**
1. Asegúrate de que `npm run build` se ejecute en `build.sh`
2. Verifica que `vite.config.js` esté configurado correctamente
3. Redeploy el servicio

### Error 500 en producción

**Solución:**
1. Activa temporalmente `APP_DEBUG=true`
2. Revisa los logs en Render Dashboard → Logs
3. Verifica que todas las variables de entorno estén configuradas
4. Desactiva `APP_DEBUG=false` después de resolver

### Assets no cargan (CSS/JS)

**Solución:**
1. Verifica que `ASSET_URL` esté configurado
2. Asegúrate de que `npm run build` se ejecutó correctamente
3. Verifica que `/public/build` tenga archivos

---

## 🔄 Redeploys y Actualizaciones

### Deploy Automático

Render hace deploy automático cuando:
- ✅ Haces push a la rama principal (main/master)
- ✅ Cambias variables de entorno
- ✅ Haces deploy manual desde el dashboard

### Deploy Manual

1. Ve a tu servicio en Render
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Costos y Limitaciones del Plan Free

### Plan Free incluye:

- ✅ 750 horas/mes de servicio web
- ✅ 1 GB de RAM
- ✅ Base de datos MySQL con 1 GB de almacenamiento
- ⚠️ El servicio se duerme después de 15 minutos de inactividad
- ⚠️ Primera petición después de dormir toma ~30 segundos

### Para evitar que se duerma:

Puedes usar servicios como [UptimeRobot](https://uptimerobot.com/) para hacer ping cada 10 minutos.

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# En el dashboard de Render
Logs → Ver logs en tiempo real
```

### Comandos Útiles en Shell

```bash
# Ver estado de la aplicación
php artisan about

# Limpiar caché
php artisan cache:clear

# Ver rutas
php artisan route:list

# Ver migraciones
php artisan migrate:status

# Ejecutar comandos artisan
php artisan [comando]
```

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- ✅ `APP_DEBUG=false`
- ✅ `APP_ENV=production`
- ✅ APP_KEY generada y segura
- ✅ Credenciales de BD seguras
- ✅ CORS configurado correctamente
- ✅ HTTPS habilitado (automático en Render)
- ✅ Variables sensibles en Environment (no en código)

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Documentación de Laravel Deployment](https://laravel.com/docs/11.x/deployment)
- [Render Community](https://community.render.com/)

---

## 🆘 Soporte

Si tienes problemas:

1. ✅ Revisa los logs en Render Dashboard
2. ✅ Verifica las variables de entorno
3. ✅ Consulta esta guía
4. ✅ Busca en [Render Community](https://community.render.com/)

---

## ✨ Próximos Pasos

Después del deploy exitoso:

1. 🎨 Personaliza tu dominio (opcional, requiere plan de pago)
2. 📧 Configura email (SMTP)
3. 📊 Configura monitoreo
4. 🔄 Configura backups de base de datos
5. 🚀 Optimiza rendimiento

---

**¡Felicidades! Tu aplicación está en producción** 🎉

**Versión:** 1.0  
**Última actualización:** Noviembre 2024  
**Estado:** ✅ Probado y funcional
