import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  DebateSession, 
  Speaker, 
  SpeakerStatus, 
  TimerControlPayload,
  AddExceptionSpeakerPayload 
} from '../types/debate';
import { calculateSpeakerTimeSeconds } from '../utils/timeUtils';
import { shuffleAndReorderSpeakers } from '../utils/shuffle';

// Estado inicial limpio (sin oradores de prueba)
export const createInitialSession = (sessionId = 'MDF-JUV'): DebateSession => ({
  id: sessionId,
  title: 'Lanzamiento MDF Juventudes - Comisión de Debate',
  description: 'Debate de propuestas, lineamientos y ejes estratégicos 2026',
  adminPin: '1234',
  status: 'CONFIG',
  totalBlockMinutes: 45,
  minSpeakerSeconds: 60,
  maxSpeakerSeconds: 300,
  calculatedSpeakerSeconds: 180,
  speakers: [], // Lista limpia sin oradores de prueba
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
});

export const useDebateSocket = (sessionId = 'MDF-JUV') => {
  const [session, setSession] = useState<DebateSession>(() => {
    // Intentar leer de localStorage si existe
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`mdf_session_${sessionId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Si tenía oradores demo previos, limpiarlos si se desea
          return parsed;
        } catch {
          // fallback
        }
      }
    }
    return createInitialSession(sessionId);
  });

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [currentUserSpeakerId, setCurrentUserSpeakerId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`mdf_speaker_id_${sessionId}`) || null;
    }
    return null;
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Persistir en LocalStorage como backup local
  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem(`mdf_session_${sessionId}`, JSON.stringify(session));
    }
  }, [session, sessionId]);

  // Conectar con Socket.io
  useEffect(() => {
    // URL del servidor Socket.io (soporta VITE_SOCKET_URL para conectar Vercel con Render/Railway)
    const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
    let socketUrl = envSocketUrl || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);
    
    // Si estamos en Vercel y no hay variable de entorno, intentar conectarse o funcionar en broadcast
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 6000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      
      // Medir desfase horario
      const clientSend = Date.now();
      socket.emit('session:sync_time', { clientSend }, (serverTime: number) => {
        const clientRecv = Date.now();
        const latency = (clientRecv - clientSend) / 2;
        const offset = serverTime - (clientRecv - latency);
        setServerOffsetMs(offset);
      });

      // Unirse a la sala
      socket.emit('session:join', { sessionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      // Si estamos en Vercel sin servidor websocket externo aún, funciona en modo local/p2p
      setIsConnected(false);
    });

    // Actualizaciones de sesión desde el servidor
    socket.on('session:state', (updatedSession: DebateSession) => {
      setSession(updatedSession);
    });

    socket.on('session:error', (errorMsg: string) => {
      setConnectionError(errorMsg);
    });

    // BroadcastChannel para sincronización entre pestañas en el mismo navegador
    const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(`mdf_channel_${sessionId}`)
      : null;

    if (bc) {
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SESSION_UPDATE') {
          setSession(event.data.session);
        }
      };
    }

    return () => {
      socket.disconnect();
      if (bc) bc.close();
    };
  }, [sessionId]);

  // Helper para emitir o aplicar cambio
  const broadcastOrApply = useCallback((updater: (prev: DebateSession) => DebateSession, serverEvent?: string, payload?: unknown) => {
    setSession((prev) => {
      const next = updater(prev);
      
      // Enviar por BroadcastChannel local
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel(`mdf_channel_${sessionId}`);
          bc.postMessage({ type: 'SESSION_UPDATE', session: next });
          bc.close();
        } catch {
          // ignore
        }
      }

      // Enviar por Socket si está conectado
      if (socketRef.current?.connected && serverEvent) {
        socketRef.current.emit(serverEvent, { sessionId, ...((payload as object) || {}) });
      }

      return next;
    });
  }, [sessionId]);

  // 1. Registro de Participante
  const registerSpeaker = useCallback((firstName: string, lastName: string, organization?: string): string => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const newId = 'spk_' + Math.random().toString(36).substr(2, 9);
    
    broadcastOrApply((prev) => {
      const newSpeaker: Speaker = {
        id: newId,
        name: fullName,
        organization: organization?.trim() || undefined,
        registeredAt: Date.now(),
        order: prev.speakers.length + 1,
        status: 'WAITING',
        isException: false,
        timeAllocatedSeconds: prev.calculatedSpeakerSeconds,
        timeSpokenSeconds: 0
      };

      const updatedSpeakers = [...prev.speakers, newSpeaker];
      const calculatedSeconds = calculateSpeakerTimeSeconds(
        prev.totalBlockMinutes,
        updatedSpeakers.length,
        prev.minSpeakerSeconds,
        prev.maxSpeakerSeconds
      );

      return {
        ...prev,
        speakers: updatedSpeakers,
        calculatedSpeakerSeconds: calculatedSeconds,
        updatedAt: Date.now()
      };
    }, 'speaker:register', { name: fullName, organization, speakerId: newId });

    setCurrentUserSpeakerId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`mdf_speaker_id_${sessionId}`, newId);
    }
    return newId;
  }, [broadcastOrApply, sessionId]);

  // 2. Configurar Parámetros del Bloque (incluye cambio de PIN / Contraseña)
  const updateConfig = useCallback((params: {
    title?: string;
    description?: string;
    totalBlockMinutes?: number;
    minSpeakerSeconds?: number;
    maxSpeakerSeconds?: number;
    adminPin?: string;
  }) => {
    broadcastOrApply((prev) => {
      const totalBlockMinutes = params.totalBlockMinutes ?? prev.totalBlockMinutes;
      const minSpeakerSeconds = params.minSpeakerSeconds ?? prev.minSpeakerSeconds;
      const maxSpeakerSeconds = params.maxSpeakerSeconds ?? prev.maxSpeakerSeconds;
      
      const calculatedSeconds = calculateSpeakerTimeSeconds(
        totalBlockMinutes,
        prev.speakers.length,
        minSpeakerSeconds,
        maxSpeakerSeconds
      );

      return {
        ...prev,
        title: params.title ?? prev.title,
        description: params.description ?? prev.description,
        adminPin: params.adminPin ?? prev.adminPin,
        totalBlockMinutes,
        minSpeakerSeconds,
        maxSpeakerSeconds,
        calculatedSpeakerSeconds: calculatedSeconds,
        timer: {
          ...prev.timer,
          durationSeconds: prev.timer.status === 'IDLE' ? calculatedSeconds : prev.timer.durationSeconds
        },
        updatedAt: Date.now()
      };
    }, 'session:config', params);
  }, [broadcastOrApply]);

  // 3. Abrir / Cerrar Inscripción
  const setRegistrationStatus = useCallback((status: 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED') => {
    broadcastOrApply((prev) => ({
      ...prev,
      status,
      updatedAt: Date.now()
    }), 'session:set_status', { status });
  }, [broadcastOrApply]);

  // 4. Sorteo Fisher-Yates
  const shuffleSpeakers = useCallback(() => {
    broadcastOrApply((prev) => {
      const shuffled = shuffleAndReorderSpeakers(prev.speakers);
      const calculatedSeconds = calculateSpeakerTimeSeconds(
        prev.totalBlockMinutes,
        shuffled.length,
        prev.minSpeakerSeconds,
        prev.maxSpeakerSeconds
      );

      const updatedSpeakers = shuffled.map((s) => ({
        ...s,
        timeAllocatedSeconds: calculatedSeconds
      }));

      return {
        ...prev,
        speakers: updatedSpeakers,
        status: 'SORTED',
        calculatedSpeakerSeconds: calculatedSeconds,
        timer: {
          ...prev.timer,
          durationSeconds: calculatedSeconds,
          status: 'IDLE',
          startedAt: null,
          pausedAt: null,
          accumulatedSeconds: 0
        },
        currentSpeakerIndex: -1,
        updatedAt: Date.now()
      };
    }, 'session:shuffle');
  }, [broadcastOrApply]);

  // 5. Iniciar Orador
  const setCurrentSpeaker = useCallback((index: number) => {
    broadcastOrApply((prev) => {
      if (index < 0 || index >= prev.speakers.length) return prev;

      const duration = prev.speakers[index].timeAllocatedSeconds || prev.calculatedSpeakerSeconds;
      
      const updatedSpeakers = prev.speakers.map((s, idx) => {
        if (idx === index) return { ...s, status: 'SPEAKING' as SpeakerStatus };
        if (idx < index && s.status === 'SPEAKING') return { ...s, status: 'DONE' as SpeakerStatus };
        return s;
      });

      return {
        ...prev,
        speakers: updatedSpeakers,
        currentSpeakerIndex: index,
        status: 'DEBATE_ACTIVE',
        timer: {
          status: 'RUNNING',
          durationSeconds: duration,
          startedAt: Date.now(),
          pausedAt: null,
          accumulatedSeconds: 0,
          serverTimestamp: Date.now()
        },
        updatedAt: Date.now()
      };
    }, 'speaker:set_current', { index });
  }, [broadcastOrApply]);

  // 6. Control del Timer
  const controlTimer = useCallback((action: TimerControlPayload['action'], customSeconds?: number) => {
    broadcastOrApply((prev) => {
      const now = Date.now();
      const currentTimer = prev.timer;

      if (action === 'START' || action === 'RESUME') {
        return {
          ...prev,
          status: 'DEBATE_ACTIVE',
          timer: {
            ...currentTimer,
            status: 'RUNNING',
            startedAt: now,
            pausedAt: null,
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      if (action === 'PAUSE') {
        let accumulated = currentTimer.accumulatedSeconds;
        if (currentTimer.startedAt) {
          accumulated += (now - currentTimer.startedAt) / 1000;
        }

        return {
          ...prev,
          timer: {
            ...currentTimer,
            status: 'PAUSED',
            startedAt: null,
            pausedAt: now,
            accumulatedSeconds: accumulated,
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      if (action === 'RESET') {
        const defaultDuration = prev.currentSpeakerIndex >= 0 
          ? (prev.speakers[prev.currentSpeakerIndex]?.timeAllocatedSeconds || prev.calculatedSpeakerSeconds)
          : prev.calculatedSpeakerSeconds;

        return {
          ...prev,
          timer: {
            status: 'IDLE',
            durationSeconds: defaultDuration,
            startedAt: null,
            pausedAt: null,
            accumulatedSeconds: 0,
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      if (action === 'ADD_30S') {
        return {
          ...prev,
          timer: {
            ...currentTimer,
            durationSeconds: currentTimer.durationSeconds + (customSeconds || 30),
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      if (action === 'SUB_30S') {
        return {
          ...prev,
          timer: {
            ...currentTimer,
            durationSeconds: Math.max(10, currentTimer.durationSeconds - (customSeconds || 30)),
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      if (action === 'SET_TIME' && customSeconds) {
        return {
          ...prev,
          timer: {
            ...currentTimer,
            durationSeconds: customSeconds,
            serverTimestamp: now
          },
          updatedAt: now
        };
      }

      return prev;
    }, 'timer:control', { action, customSeconds });
  }, [broadcastOrApply]);

  // 7. Siguiente / Anterior Orador
  const nextSpeaker = useCallback(() => {
    broadcastOrApply((prev) => {
      const nextIdx = prev.currentSpeakerIndex + 1;
      if (nextIdx >= prev.speakers.length) {
        return {
          ...prev,
          status: 'FINISHED',
          timer: {
            ...prev.timer,
            status: 'COMPLETED'
          },
          updatedAt: Date.now()
        };
      }

      const duration = prev.speakers[nextIdx].timeAllocatedSeconds || prev.calculatedSpeakerSeconds;
      const updatedSpeakers = prev.speakers.map((s, idx) => {
        if (idx === prev.currentSpeakerIndex) return { ...s, status: 'DONE' as SpeakerStatus };
        if (idx === nextIdx) return { ...s, status: 'SPEAKING' as SpeakerStatus };
        return s;
      });

      return {
        ...prev,
        speakers: updatedSpeakers,
        currentSpeakerIndex: nextIdx,
        status: 'DEBATE_ACTIVE',
        timer: {
          status: 'RUNNING',
          durationSeconds: duration,
          startedAt: Date.now(),
          pausedAt: null,
          accumulatedSeconds: 0,
          serverTimestamp: Date.now()
        },
        updatedAt: Date.now()
      };
    }, 'speaker:next');
  }, [broadcastOrApply]);

  const prevSpeaker = useCallback(() => {
    broadcastOrApply((prev) => {
      const prevIdx = Math.max(0, prev.currentSpeakerIndex - 1);
      const duration = prev.speakers[prevIdx].timeAllocatedSeconds || prev.calculatedSpeakerSeconds;

      const updatedSpeakers = prev.speakers.map((s, idx) => {
        if (idx === prevIdx) return { ...s, status: 'SPEAKING' as SpeakerStatus };
        if (idx === prev.currentSpeakerIndex) return { ...s, status: 'WAITING' as SpeakerStatus };
        return s;
      });

      return {
        ...prev,
        speakers: updatedSpeakers,
        currentSpeakerIndex: prevIdx,
        timer: {
          status: 'IDLE',
          durationSeconds: duration,
          startedAt: null,
          pausedAt: null,
          accumulatedSeconds: 0,
          serverTimestamp: Date.now()
        },
        updatedAt: Date.now()
      };
    }, 'speaker:prev');
  }, [broadcastOrApply]);

  // 8. Reordenar / Mover Oradores
  const moveSpeaker = useCallback((speakerId: string, direction: 'UP' | 'DOWN') => {
    broadcastOrApply((prev) => {
      const index = prev.speakers.findIndex((s) => s.id === speakerId);
      if (index === -1) return prev;
      if (direction === 'UP' && index === 0) return prev;
      if (direction === 'DOWN' && index === prev.speakers.length - 1) return prev;

      const targetIndex = direction === 'UP' ? index - 1 : index + 1;
      const newSpeakers = [...prev.speakers];
      const temp = newSpeakers[index];
      newSpeakers[index] = newSpeakers[targetIndex];
      newSpeakers[targetIndex] = temp;

      const renumbered = newSpeakers.map((s, idx) => ({ ...s, order: idx + 1 }));

      return {
        ...prev,
        speakers: renumbered,
        updatedAt: Date.now()
      };
    }, 'speaker:move', { speakerId, direction });
  }, [broadcastOrApply]);

  // 9. Cambiar estado de orador
  const updateSpeakerStatus = useCallback((speakerId: string, status: SpeakerStatus) => {
    broadcastOrApply((prev) => {
      const updated = prev.speakers.map((s) => s.id === speakerId ? { ...s, status } : s);
      return {
        ...prev,
        speakers: updated,
        updatedAt: Date.now()
      };
    }, 'speaker:set_status', { speakerId, status });
  }, [broadcastOrApply]);

  // 10. Eliminar Orador
  const removeSpeaker = useCallback((speakerId: string) => {
    broadcastOrApply((prev) => {
      const filtered = prev.speakers.filter((s) => s.id !== speakerId);
      const renumbered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
      const calculatedSeconds = calculateSpeakerTimeSeconds(
        prev.totalBlockMinutes,
        renumbered.length,
        prev.minSpeakerSeconds,
        prev.maxSpeakerSeconds
      );

      return {
        ...prev,
        speakers: renumbered,
        calculatedSpeakerSeconds: calculatedSeconds,
        updatedAt: Date.now()
      };
    }, 'speaker:remove', { speakerId });
  }, [broadcastOrApply]);

  // 11. Agregar Orador de Excepción
  const addExceptionSpeaker = useCallback((payload: AddExceptionSpeakerPayload) => {
    const newId = 'spk_exc_' + Math.random().toString(36).substr(2, 9);
    
    broadcastOrApply((prev) => {
      const newSpeaker: Speaker = {
        id: newId,
        name: payload.name.trim(),
        organization: payload.organization?.trim() || undefined,
        registeredAt: Date.now(),
        order: prev.speakers.length + 1,
        status: 'WAITING',
        isException: true,
        timeAllocatedSeconds: prev.calculatedSpeakerSeconds,
        timeSpokenSeconds: 0
      };

      let newSpeakers = [...prev.speakers];
      if (payload.insertPosition === 'NEXT' && prev.currentSpeakerIndex >= 0) {
        newSpeakers.splice(prev.currentSpeakerIndex + 1, 0, newSpeaker);
      } else {
        newSpeakers.push(newSpeaker);
      }

      const renumbered = newSpeakers.map((s, idx) => ({ ...s, order: idx + 1 }));

      return {
        ...prev,
        speakers: renumbered,
        updatedAt: Date.now()
      };
    }, 'speaker:add_exception', payload);
  }, [broadcastOrApply]);

  // 12. Reiniciar Bloque
  const resetSession = useCallback(() => {
    broadcastOrApply((prev) => {
      return {
        ...createInitialSession(prev.id),
        title: prev.title,
        totalBlockMinutes: prev.totalBlockMinutes,
        adminPin: prev.adminPin
      };
    }, 'session:reset');
  }, [broadcastOrApply]);

  return {
    session,
    isConnected,
    serverOffsetMs,
    currentUserSpeakerId,
    connectionError,
    // Acciones
    registerSpeaker,
    updateConfig,
    setRegistrationStatus,
    shuffleSpeakers,
    setCurrentSpeaker,
    controlTimer,
    nextSpeaker,
    prevSpeaker,
    moveSpeaker,
    updateSpeakerStatus,
    removeSpeaker,
    addExceptionSpeaker,
    resetSession
  };
};
