# Sonidos de Notificación

## Archivo Requerido

Para que las notificaciones de sonido funcionen, necesitas agregar un archivo de audio:

**Nombre**: `notification.mp3`
**Ubicación**: `public/sounds/notification.mp3`

## Opciones para Obtener el Sonido

### Opción 1: Descargar Sonido Gratuito
Puedes descargar sonidos gratuitos de:
- https://notificationsounds.com/
- https://freesound.org/
- https://mixkit.co/free-sound-effects/notification/

### Opción 2: Usar un Sonido del Sistema
Puedes copiar un sonido de notificación de tu sistema operativo.

### Opción 3: Generar con IA
Puedes usar herramientas como:
- https://www.soundsnap.com/
- https://www.zapsplat.com/

## Características Recomendadas

- **Duración**: 0.5 - 2 segundos
- **Formato**: MP3 o OGG
- **Tamaño**: < 50KB
- **Volumen**: Moderado, no muy alto

## Ejemplo de Sonido Simple

Si no tienes un sonido, puedes usar este código para generar uno simple con Web Audio API (ya implementado como fallback en el código).

## Alternativa: Usar Beep del Navegador

Si no quieres usar un archivo de audio, el sistema ya tiene un fallback que simplemente registra en consola cuando no puede reproducir el sonido.
