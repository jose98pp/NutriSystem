# 🚀 Guía Rápida de Deploy - nutrisystem.onrender.com

## ✅ Configuración Lista

Tu aplicación está configurada para: **https://nutrisystem.onrender.com**

---

## 📋 Checklist de Deploy

### 1. ✅ Archivos de Configuración (Ya creados)

- ✅ `Dockerfile` - Imagen Docker con PHP 8.2 + Apache
- ✅ `docker/apache.conf` - Configuración de Apache
- ✅ `docker/start.sh` - Script de inicio
- ✅ `render.yaml` - Configuración de servicios
- ✅ `.dockerignore` - Exclusiones de build
- ✅ `RENDER_ENV_VARS.txt` - Variables listas para copiar

---

## 🎯 Pasos para Deploy

### Paso 1: Subir a Git

```bash
git add .
git commit -m "Configuración Docker para Render"
git push origin main
```

### Paso 2: Crear Servicios en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio
4. Render detectará `render.yaml`
5. Click en **"Apply"**

Render creará automáticamente:
- ✅ Web Service: `nutricion-app`
- ✅ MySQL Database: `nutricion-db`

### Paso 3: Configurar Variables de Entorno

En el dashboard de tu **Web Service** (`nutricion-app`):

1. Ve a **"Environment"**
2. Click en **"Add Environment Variable"**
3. Agrega estas variables **una por una**:

```env
APP_NAME=Sistema Nutricional
APP_ENV=production
APP_DEBUG=false
APP_URL=https://nutrisystem.onrender.com
APP_KEY=base64:RDP8lZTVMQDDAFWj/dyHs/bITvJCWBGFA2EsXSIOfpI=

SANCTUM_STATEFUL_DOMAINS=nutrisystem.onrender.com
SESSION_DOMAIN=.nutrisystem.onrender.com
ASSET_URL=https://nutrisystem.onrender.com

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_DRIVER=database
QUEUE_CONNECTION=database

LOG_CHANNEL=stack
LOG_LEVEL=error
```

> [!TIP]
> Puedes copiar todas las variables desde el archivo `RENDER_ENV_VARS.txt`

> [!NOTE]
> Las variables de base de datos (DB_*) se configuran automáticamente desde la base de datos MySQL

4. Click en **"Save Changes"**

### Paso 4: Esperar el Build

El primer build tomará **5-10 minutos**:

```
📦 Building Docker image...
📥 Installing PHP 8.2 + Apache...
📦 Installing Composer dependencies...
📦 Installing Node dependencies...
🎨 Building frontend assets with Vite...
✅ Image built successfully!
🚀 Starting container...
📊 Running migrations...
🔗 Creating storage link...
⚡ Optimizing Laravel...
✅ Application ready!
```

### Paso 5: Poblar Base de Datos

Una vez que el deploy esté **Live**:

1. En el dashboard de tu servicio, click en **"Shell"**
2. Ejecuta:

```bash
php artisan db:seed --force
```

Esto creará:
- ✅ 6 usuarios de prueba
- ✅ 30 alimentos en el catálogo
- ✅ 5 servicios
- ✅ Datos de ejemplo

### Paso 6: Verificar

1. Abre: **https://nutrisystem.onrender.com**
2. Deberías ver la página de login
3. Prueba con estas credenciales:

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nutricion.com | password123 |
| Nutricionista | carlos@nutricion.com | password123 |
| Paciente | juan@example.com | password123 |

---

## 🔧 Configuración de CORS (Ya aplicada)

Tu archivo `config/cors.php` ya está configurado para aceptar peticiones desde:
- ✅ `https://nutrisystem.onrender.com`
- ✅ Dominios locales (desarrollo)

---

## 🐛 Solución de Problemas

### Error: "No application encryption key"

**Ya resuelto:** Tu APP_KEY ya está generada:
```
base64:RDP8lZTVMQDDAFWj/dyHs/bITvJCWBGFA2EsXSIOfpI=
```

### Error: "Connection refused" (Base de datos)

**Solución:**
1. Verifica que la base de datos `nutricion-db` esté creada
2. Verifica que el servicio web esté conectado a la BD en Render
3. Las variables DB_* deben configurarse automáticamente

### Error 500 en producción

**Solución:**
1. Ve a Render Dashboard → Logs
2. Busca el error específico
3. Verifica que todas las variables de entorno estén configuradas

### Assets no cargan (CSS/JS)

**Solución:**
1. Verifica que `ASSET_URL=https://nutrisystem.onrender.com`
2. Revisa los logs del build: `npm run build` debe completarse
3. Verifica que `/public/build` tenga archivos

### La aplicación se duerme

**Causa:** Plan Free de Render duerme el servicio después de 15 minutos sin actividad.

**Solución:**
- Usa [UptimeRobot](https://uptimerobot.com/) para hacer ping cada 10 minutos
- Configura un monitor HTTP que visite `https://nutrisystem.onrender.com` cada 10 minutos

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Ve a tu servicio en Render
2. Click en **"Logs"**
3. Verás todos los logs de la aplicación

### Comandos Útiles en Shell

```bash
# Ver estado de la aplicación
php artisan about

# Ver rutas
php artisan route:list

# Ver migraciones
php artisan migrate:status

# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Optimizar
php artisan optimize
```

---

## 🔄 Redeploys

### Deploy Automático

Render hace deploy automático cuando:
- ✅ Haces push a la rama principal
- ✅ Cambias variables de entorno

### Deploy Manual

1. Ve a tu servicio en Render
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔒 Seguridad

### Checklist

- ✅ `APP_DEBUG=false` (configurado)
- ✅ `APP_ENV=production` (configurado)
- ✅ APP_KEY única y segura (configurado)
- ✅ HTTPS habilitado (automático en Render)
- ✅ CORS configurado correctamente
- ✅ Cookies seguras en producción

---

## 📱 Acceso a la Aplicación

### URL Principal
**https://nutrisystem.onrender.com**

### Usuarios de Prueba

#### Administrador
- Email: `admin@nutricion.com`
- Password: `password123`
- Acceso: Panel completo de administración

#### Nutricionista
- Email: `carlos@nutricion.com`
- Password: `password123`
- Acceso: Gestión de pacientes y planes

#### Paciente
- Email: `juan@example.com`
- Password: `password123`
- Acceso: Vista de paciente

---

## ✨ Próximos Pasos

Después del deploy exitoso:

1. 🔐 **Cambiar contraseñas** de usuarios de prueba
2. 📧 **Configurar email** (SMTP) para notificaciones
3. 📊 **Configurar monitoreo** con UptimeRobot
4. 🔄 **Configurar backups** de base de datos
5. 🎨 **Personalizar** contenido según tus necesidades

---

## 📚 Documentación Completa

- 📖 [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Guía completa de deploy
- 📖 [RENDER_ENV_VARS.txt](./RENDER_ENV_VARS.txt) - Variables de entorno
- 📖 [README.md](./README.md) - Documentación del proyecto

---

## 🆘 Soporte

Si tienes problemas:

1. ✅ Revisa los logs en Render Dashboard
2. ✅ Verifica las variables de entorno
3. ✅ Consulta [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
4. ✅ Busca en [Render Community](https://community.render.com/)

---

**¡Tu aplicación está lista para producción!** 🎉

**Dominio:** https://nutrisystem.onrender.com  
**Estado:** ✅ Configurado  
**Siguiente paso:** Deploy en Render
