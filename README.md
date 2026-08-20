# Moderador de Comisión - MDF Juventudes 🚀

Web App en tiempo real de diseño profesional pensada para gestionar debates y asambleas con hasta **100+ participantes conectados desde sus teléfonos móviles**, con panel de control para el Moderador y vista en pantalla completa para Proyector / Pantalla de escenario.

Desarrollada con la identidad visual oficial de **MDF Juventudes** (Azul Eléctrico `#0052FF`, Cyan Neón `#00D2FF`, Blanco y modo oscuro de alto contraste).

---

## 📸 Características y Roles

### 1. 🛡️ Panel del Moderador (Admin)
- **Control Total del Bloque:** Configuración del tema, tiempo total del bloque (ej. 45 min), límites mínimos y máximos por orador (ej. 1 min a 5 min), y clave de acceso PIN (por defecto: `1234`).
- **Inscripciones en Vivo:** Abre y cierra la lista con 1 clic. Monitoreo en tiempo real de la cantidad de inscriptos.
- **Sorteo Fisher-Yates con Confeti:** Mezcla uniformemente la lista de inscriptos de forma transparente y asigna el orden con animación festiva.
- **Cálculo Automático de Tiempo:**
  $$\text{Tiempo por Orador} = \operatorname{clamp}\left(\min, \left\lfloor\frac{\text{Tiempo Total}}{\text{Inscriptos}}\right\rfloor, \max\right)$$
- **Control del Cronómetro en Vivo:**
  - *Iniciar / Pausar / Reanudar / Reiniciar*.
  - *+30s*, *-30s*, *+1 min* (ajuste al vuelo).
  - *Siguiente Orador*, *Anterior*, *Saltar*.
- **Gestión de Excepciones:** Permite añadir oradores especiales fuera de sorteo (ubicándolos como "Próximo a hablar" o "Al final de la lista"), cambiar estados (Ausente, Expuso), y reordenar posiciones (Subir / Bajar).

### 2. 📱 Vista del Participante Móvil
- **Acceso Instantáneo:** Escaneo de código QR o link sin registros complejos.
- **Inscripción 1-Tap:** Ingreso de Nombre y Bloque/Agrupación opcional.
- **Estado Personal en Vivo:**
  - Identificación del número de orden (`#4`).
  - Contador de cuántos oradores faltan para su turno.
- **Alerta de Turno de Alto Impacto:** Banner vibrante y alerta háptica con vibración móvil (`navigator.vibrate`) cuando llega su turno.
- **Reloj Sincronizado:** Visualización en vivo del tiempo restante del orador en escenario.

### 3. 📺 Vista Proyector / Pantalla Gigante
- **Modo Pantalla Completa:** Optimizado para proyectores 1080p / 4K.
- **Display Gigante en 3 Fases:**
  - 🟢 **Verde / Cyan:** Tiempo normal (>30s).
  - 🟡 **Amarillo / Ámbar:** Últimos 30 segundos (con aviso sonoro suave).
  - 🔴 **Rojo Pulsante:** Tiempo cumplido con cronómetro de exceso (+00:14).
- **Banner del Orador en Escenario:** Nombre y Bloque con tipografía de alto impacto.
- **Deck de Próximos 3 Oradores:** Para que los siguientes participantes se preparen con anticipación.
- **Código QR Dinámico en Esquina:** Para que los asistentes que lleguen tarde puedan sumarse al debate sin interrumpir.

---

## 🛠️ Arquitectura Técnica & Sincronización del Timer

### Sincronización Eficiente (Sin saturar la red)
El servidor **no** envía un mensaje cada segundo. En su lugar, comparte el estado base:
```json
{
  "status": "RUNNING",
  "durationSeconds": 180,
  "startedAt": 1771594800000,
  "accumulatedSeconds": 0,
  "serverTimestamp": 1771594800100
}
```
Cada dispositivo cliente calcula el reloj localmente a 10 Hz:
```typescript
const now = Date.now() + serverOffsetMs;
const elapsed = accumulatedSeconds + (now - startedAt) / 1000;
const remainingSeconds = durationSeconds - elapsed;
```
Esto garantiza **0 desfase** entre 100 móviles y el proyector simultáneamente, con mínimo consumo de batería y datos móviles.

### Sonidos Sintetizados Web Audio API
No requiere archivos `.mp3` externos. Utiliza osciladores nativos del navegador para:
- Ping armónico a los 30 segundos.
- Triple alerta a los 0 segundos.
- Fanfarria melódica al realizar el sorteo.

---

## 🚀 Puesta en Marcha Local (Desarrollo y Eventos Presenciales)

### Requisitos
- Node.js 18+ instalado.

### 1. Iniciar el Servidor en Tiempo Real (Socket.io)
En una terminal:
```bash
node server/server.js
# Servidor escuchando en http://localhost:3001
```

### 2. Iniciar la Interfaz Web (Vite)
En otra terminal:
```bash
npm run dev
# Disponible en http://localhost:5173 y en tu red local WiFi (ej: http://192.168.1.50:5173)
```

> 💡 **Para eventos con WiFi local:** Abre `http://<IP-DE-TU-PC>:5173` en el proyector y el código QR generado automáticamente dirigirá a todos los teléfonos de la sala a esa misma IP.

---

## 🌐 Guía de Despliegue en la Nube

### Opción A: Despliegue Completo en Render / Railway / Fly.io (Recomendado)
El proyecto incluye un script de backend que sirve tanto la API de sockets como los archivos estáticos de React.

1. **Crear archivo de build:**
   ```bash
   npm run build
   ```
2. **Subir a GitHub** y conectar con [Render.com](https://render.com) o [Railway.app](https://railway.app):
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start` (ejecuta `node server/server.js`)
   - **Environment Variables:** `PORT=3001` (o la que asigne la plataforma).

### Opción B: Despliegue en Vercel + Firebase (Serverless)
Si deseas utilizar Firebase Realtime Database o Firestore:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Realtime Database** o **Firestore**.
3. Las reglas de seguridad recomendadas:
   ```json
   {
     "rules": {
       "sessions": {
         "$sessionId": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
4. Despliega el frontend en **Vercel**:
   - `vercel --prod`
