import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-Memory Database de Sesiones
const sessions = new Map();

// Helper para calcular tiempo por orador
function calculateSpeakerTimeSeconds(totalBlockMinutes, speakerCount, minSeconds = 60, maxSeconds = 300) {
  if (speakerCount <= 0) return Math.min(Math.max(180, minSeconds), maxSeconds);
  const totalSeconds = totalBlockMinutes * 60;
  let raw = Math.floor(totalSeconds / speakerCount);
  let rounded = Math.round(raw / 15) * 15;
  if (rounded < minSeconds) rounded = minSeconds;
  if (rounded > maxSeconds) rounded = maxSeconds;
  return rounded;
}

// Algoritmo Fisher-Yates Knuth Shuffle
function fisherYatesShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Inicializar una sesión si no existe
function getOrCreateSession(sessionId = 'MDF-JUV') {
  if (!sessions.has(sessionId)) {
    const initial = {
      id: sessionId,
      title: 'Lanzamiento MDF Juventudes - Comisión de Debate',
      description: 'Debate de propuestas, lineamientos y ejes estratégicos 2026',
      adminPin: '1234',
      status: 'CONFIG',
      totalBlockMinutes: 45,
      minSpeakerSeconds: 60,
      maxSpeakerSeconds: 300,
      calculatedSpeakerSeconds: 180,
      speakers: [
        {
          id: 'demo-1',
          name: 'Camila Rossi',
          organization: 'Juventudes CABA',
          registeredAt: Date.now() - 120000,
          order: 1,
          status: 'WAITING',
          isException: false,
          timeAllocatedSeconds: 180,
          timeSpokenSeconds: 0
        },
        {
          id: 'demo-2',
          name: 'Lucas Benítez',
          organization: 'MDF Universitarios',
          registeredAt: Date.now() - 90000,
          order: 2,
          status: 'WAITING',
          isException: false,
          timeAllocatedSeconds: 180,
          timeSpokenSeconds: 0
        },
        {
          id: 'demo-3',
          name: 'Sofía Navarro',
          organization: 'Secretaría de Formación',
          registeredAt: Date.now() - 60000,
          order: 3,
          status: 'WAITING',
          isException: false,
          timeAllocatedSeconds: 180,
          timeSpokenSeconds: 0
        },
        {
          id: 'demo-4',
          name: 'Martín Albornoz',
          organization: 'MDF Zona Norte',
          registeredAt: Date.now() - 30000,
          order: 4,
          status: 'WAITING',
          isException: false,
          timeAllocatedSeconds: 180,
          timeSpokenSeconds: 0
        }
      ],
      currentSpeakerIndex: -1,
      timer: {
        status: 'IDLE',
        durationSeconds: 180,
        startedAt: null,
        pausedAt: null,
        accumulatedSeconds: 0,
        serverTimestamp: Date.now()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    sessions.set(sessionId, initial);
  }
  return sessions.get(sessionId);
}

// REST Endpoints
app.get('/api/session/:id', (req, res) => {
  const session = getOrCreateSession(req.params.id);
  res.json(session);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now(), sessionsCount: sessions.size });
});

// Servir frontend compilado en producción
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) res.status(200).send('MDF Juventudes Moderador API Server Running');
    });
  }
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Cliente conectado: ${socket.id}`);

  // Sincronización de tiempo de alta precisión
  socket.on('session:sync_time', (payload, callback) => {
    if (typeof callback === 'function') {
      callback(Date.now());
    }
  });

  // Unirse a una sala
  socket.on('session:join', ({ sessionId = 'MDF-JUV' }) => {
    socket.join(sessionId);
    const session = getOrCreateSession(sessionId);
    socket.emit('session:state', session);
  });

  // Registro de participante móvil
  socket.on('speaker:register', ({ sessionId = 'MDF-JUV', name, organization, speakerId }) => {
    const session = getOrCreateSession(sessionId);
    const id = speakerId || 'spk_' + Math.random().toString(36).substr(2, 9);
    
    const newSpeaker = {
      id,
      name: name.trim(),
      organization: organization ? organization.trim() : undefined,
      registeredAt: Date.now(),
      order: session.speakers.length + 1,
      status: 'WAITING',
      isException: false,
      timeAllocatedSeconds: session.calculatedSpeakerSeconds,
      timeSpokenSeconds: 0
    };

    session.speakers.push(newSpeaker);
    session.calculatedSpeakerSeconds = calculateSpeakerTimeSeconds(
      session.totalBlockMinutes,
      session.speakers.length,
      session.minSpeakerSeconds,
      session.maxSpeakerSeconds
    );
    session.updatedAt = Date.now();

    io.to(sessionId).emit('session:state', session);
  });

  // Configuración del bloque
  socket.on('session:config', ({ sessionId = 'MDF-JUV', title, description, totalBlockMinutes, minSpeakerSeconds, maxSpeakerSeconds, adminPin }) => {
    const session = getOrCreateSession(sessionId);
    if (title !== undefined) session.title = title;
    if (description !== undefined) session.description = description;
    if (adminPin !== undefined) session.adminPin = adminPin;
    if (totalBlockMinutes !== undefined) session.totalBlockMinutes = totalBlockMinutes;
    if (minSpeakerSeconds !== undefined) session.minSpeakerSeconds = minSpeakerSeconds;
    if (maxSpeakerSeconds !== undefined) session.maxSpeakerSeconds = maxSpeakerSeconds;

    session.calculatedSpeakerSeconds = calculateSpeakerTimeSeconds(
      session.totalBlockMinutes,
      session.speakers.length,
      session.minSpeakerSeconds,
      session.maxSpeakerSeconds
    );
    
    if (session.timer.status === 'IDLE') {
      session.timer.durationSeconds = session.calculatedSpeakerSeconds;
    }
    session.updatedAt = Date.now();

    io.to(sessionId).emit('session:state', session);
  });

  // Cambiar estado de inscripción
  socket.on('session:set_status', ({ sessionId = 'MDF-JUV', status }) => {
    const session = getOrCreateSession(sessionId);
    session.status = status;
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Sorteo Fisher-Yates
  socket.on('session:shuffle', ({ sessionId = 'MDF-JUV' }) => {
    const session = getOrCreateSession(sessionId);
    const shuffled = fisherYatesShuffle(session.speakers);
    const calculated = calculateSpeakerTimeSeconds(
      session.totalBlockMinutes,
      shuffled.length,
      session.minSpeakerSeconds,
      session.maxSpeakerSeconds
    );

    session.speakers = shuffled.map((s, idx) => ({
      ...s,
      order: idx + 1,
      status: 'WAITING',
      timeAllocatedSeconds: calculated
    }));

    session.status = 'SORTED';
    session.calculatedSpeakerSeconds = calculated;
    session.currentSpeakerIndex = -1;
    session.timer = {
      status: 'IDLE',
      durationSeconds: calculated,
      startedAt: null,
      pausedAt: null,
      accumulatedSeconds: 0,
      serverTimestamp: Date.now()
    };
    session.updatedAt = Date.now();

    io.to(sessionId).emit('session:state', session);
  });

  // Establecer orador actual
  socket.on('speaker:set_current', ({ sessionId = 'MDF-JUV', index }) => {
    const session = getOrCreateSession(sessionId);
    if (index < 0 || index >= session.speakers.length) return;

    const duration = session.speakers[index].timeAllocatedSeconds || session.calculatedSpeakerSeconds;
    
    session.speakers = session.speakers.map((s, idx) => {
      if (idx === index) return { ...s, status: 'SPEAKING' };
      if (idx < index && s.status === 'SPEAKING') return { ...s, status: 'DONE' };
      return s;
    });

    session.currentSpeakerIndex = index;
    session.status = 'DEBATE_ACTIVE';
    session.timer = {
      status: 'RUNNING',
      durationSeconds: duration,
      startedAt: Date.now(),
      pausedAt: null,
      accumulatedSeconds: 0,
      serverTimestamp: Date.now()
    };
    session.updatedAt = Date.now();

    io.to(sessionId).emit('session:state', session);
  });

  // Control del timer
  socket.on('timer:control', ({ sessionId = 'MDF-JUV', action, customSeconds }) => {
    const session = getOrCreateSession(sessionId);
    const now = Date.now();

    if (action === 'START' || action === 'RESUME') {
      session.status = 'DEBATE_ACTIVE';
      session.timer.status = 'RUNNING';
      session.timer.startedAt = now;
      session.timer.pausedAt = null;
    } else if (action === 'PAUSE') {
      if (session.timer.startedAt) {
        session.timer.accumulatedSeconds += (now - session.timer.startedAt) / 1000;
      }
      session.timer.status = 'PAUSED';
      session.timer.startedAt = null;
      session.timer.pausedAt = now;
    } else if (action === 'RESET') {
      const defaultDuration = session.currentSpeakerIndex >= 0
        ? (session.speakers[session.currentSpeakerIndex]?.timeAllocatedSeconds || session.calculatedSpeakerSeconds)
        : session.calculatedSpeakerSeconds;
      session.timer = {
        status: 'IDLE',
        durationSeconds: defaultDuration,
        startedAt: null,
        pausedAt: null,
        accumulatedSeconds: 0,
        serverTimestamp: now
      };
    } else if (action === 'ADD_30S') {
      session.timer.durationSeconds += (customSeconds || 30);
    } else if (action === 'SUB_30S') {
      session.timer.durationSeconds = Math.max(10, session.timer.durationSeconds - (customSeconds || 30));
    } else if (action === 'SET_TIME' && customSeconds) {
      session.timer.durationSeconds = customSeconds;
    }

    session.timer.serverTimestamp = now;
    session.updatedAt = now;
    io.to(sessionId).emit('session:state', session);
  });

  // Siguiente orador
  socket.on('speaker:next', ({ sessionId = 'MDF-JUV' }) => {
    const session = getOrCreateSession(sessionId);
    const nextIdx = session.currentSpeakerIndex + 1;
    
    if (nextIdx >= session.speakers.length) {
      session.status = 'FINISHED';
      session.timer.status = 'COMPLETED';
    } else {
      const duration = session.speakers[nextIdx].timeAllocatedSeconds || session.calculatedSpeakerSeconds;
      session.speakers = session.speakers.map((s, idx) => {
        if (idx === session.currentSpeakerIndex) return { ...s, status: 'DONE' };
        if (idx === nextIdx) return { ...s, status: 'SPEAKING' };
        return s;
      });

      session.currentSpeakerIndex = nextIdx;
      session.status = 'DEBATE_ACTIVE';
      session.timer = {
        status: 'RUNNING',
        durationSeconds: duration,
        startedAt: Date.now(),
        pausedAt: null,
        accumulatedSeconds: 0,
        serverTimestamp: Date.now()
      };
    }
    
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Mover orador
  socket.on('speaker:move', ({ sessionId = 'MDF-JUV', speakerId, direction }) => {
    const session = getOrCreateSession(sessionId);
    const index = session.speakers.findIndex((s) => s.id === speakerId);
    if (index === -1) return;
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === session.speakers.length - 1) return;

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const temp = session.speakers[index];
    session.speakers[index] = session.speakers[targetIndex];
    session.speakers[targetIndex] = temp;

    session.speakers = session.speakers.map((s, idx) => ({ ...s, order: idx + 1 }));
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Cambiar estado de orador
  socket.on('speaker:set_status', ({ sessionId = 'MDF-JUV', speakerId, status }) => {
    const session = getOrCreateSession(sessionId);
    session.speakers = session.speakers.map((s) => s.id === speakerId ? { ...s, status } : s);
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Eliminar orador
  socket.on('speaker:remove', ({ sessionId = 'MDF-JUV', speakerId }) => {
    const session = getOrCreateSession(sessionId);
    session.speakers = session.speakers.filter((s) => s.id !== speakerId);
    session.speakers = session.speakers.map((s, idx) => ({ ...s, order: idx + 1 }));
    session.calculatedSpeakerSeconds = calculateSpeakerTimeSeconds(
      session.totalBlockMinutes,
      session.speakers.length,
      session.minSpeakerSeconds,
      session.maxSpeakerSeconds
    );
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Agregar excepción
  socket.on('speaker:add_exception', ({ sessionId = 'MDF-JUV', name, organization, insertPosition }) => {
    const session = getOrCreateSession(sessionId);
    const newSpeaker = {
      id: 'spk_exc_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      organization: organization ? organization.trim() : undefined,
      registeredAt: Date.now(),
      order: session.speakers.length + 1,
      status: 'WAITING',
      isException: true,
      timeAllocatedSeconds: session.calculatedSpeakerSeconds,
      timeSpokenSeconds: 0
    };

    if (insertPosition === 'NEXT' && session.currentSpeakerIndex >= 0) {
      session.speakers.splice(session.currentSpeakerIndex + 1, 0, newSpeaker);
    } else {
      session.speakers.push(newSpeaker);
    }

    session.speakers = session.speakers.map((s, idx) => ({ ...s, order: idx + 1 }));
    session.updatedAt = Date.now();
    io.to(sessionId).emit('session:state', session);
  });

  // Reiniciar sesión
  socket.on('session:reset', ({ sessionId = 'MDF-JUV' }) => {
    sessions.delete(sessionId);
    const fresh = getOrCreateSession(sessionId);
    io.to(sessionId).emit('session:state', fresh);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Moderador MDF Juventudes escuchando en puerto ${PORT}`);
});
