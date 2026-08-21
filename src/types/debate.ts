export type SessionStatus = 
  | 'CONFIG'                // Configurando el bloque
  | 'REGISTRATION_OPEN'     // Lista abierta para inscripciones
  | 'REGISTRATION_CLOSED'   // Lista cerrada, lista para sortear
  | 'SORTED'                // Lista sorteada, esperando inicio de debate
  | 'DEBATE_ACTIVE'         // Debate en curso
  | 'DEBATE_PAUSED'         // Debate en pausa general
  | 'FINISHED';             // Bloque finalizado

export type SpeakerStatus = 
  | 'WAITING'   // Esperando turno
  | 'SPEAKING'  // En uso de la palabra
  | 'DONE'      // Turno completado
  | 'SKIPPED'   // Saltado
  | 'ABSENT';   // Ausente al ser llamado

export interface Speaker {
  id: string;
  name: string;
  organization?: string;       // Ej: "Juventudes Centro", "Secretaría Gremial", etc.
  registeredAt: number;        // Timestamp ms
  order: number;               // Posición en la lista (1, 2, 3...)
  status: SpeakerStatus;
  isException: boolean;        // Agregado manualmente fuera de lista regular
  isLate?: boolean;            // Agregado después del cierre de lista oficial
  timeAllocatedSeconds: number;// Tiempo asignado para este orador
  timeSpokenSeconds: number;   // Tiempo consumido
}

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface TimerState {
  status: TimerStatus;
  durationSeconds: number;       // Duración total asignada al turno actual
  startedAt: number | null;      // Epoch ms en que se inició/reanudó el timer
  pausedAt: number | null;       // Epoch ms en que se pausó
  accumulatedSeconds: number;    // Segundos acumulados antes de la última reanudación
  serverTimestamp: number;       // Marca de tiempo del servidor para sincronización
}

export interface DebateSession {
  id: string;                        // Código de sesión (ej: "COMISION-1")
  title: string;                     // Tema del debate (ej: "Lanzamiento MDF Juventudes - Plan de Acción")
  description?: string;              // Descripción u observaciones
  adminPin: string;                  // PIN de moderación (ej: "moderador2026")
  status: SessionStatus;
  
  // Parámetros de tiempo del bloque
  totalBlockMinutes: number;         // Tiempo total del bloque (ej: 45 min)
  minSpeakerSeconds: number;         // Mínimo por orador (default: 60s)
  maxSpeakerSeconds: number;         // Máximo por orador (default: 180s = 3m)
  calculatedSpeakerSeconds: number;  // Tiempo calculado por orador (total / N)
  
  // Lista oficial de oradores
  speakers: Speaker[];
  currentSpeakerIndex: number;       // Índice del orador actual en speakers[] (-1 si ninguno)

  // Lista de inscriptos que se agregaron después del cierre de lista
  lateSpeakers: Speaker[];
  
  // Estado del Cronómetro
  timer: TimerState;
  
  createdAt: number;
  updatedAt: number;
}

export interface ClientRegistrationPayload {
  name: string;
  organization?: string;
  sessionId?: string;
}

export interface TimerControlPayload {
  action: 'START' | 'PAUSE' | 'RESUME' | 'RESET' | 'ADD_30S' | 'SUB_30S' | 'SET_TIME';
  seconds?: number;
}

export interface ReorderSpeakersPayload {
  speakerId: string;
  newIndex: number;
}

export interface AddExceptionSpeakerPayload {
  name: string;
  organization?: string;
  insertPosition?: 'NEXT' | 'END';
}
