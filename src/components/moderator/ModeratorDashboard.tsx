import React, { useState } from 'react';
import { 
  DebateSession, 
  SpeakerStatus, 
  TimerControlPayload, 
  AddExceptionSpeakerPayload 
} from '../../types/debate';
import { useDebateTimer } from '../../hooks/useDebateTimer';
import { BigTimerDisplay } from '../timer/BigTimerDisplay';
import { LiveTimerControls } from './LiveTimerControls';
import { SpeakerQueueManager } from './SpeakerQueueManager';
import { BlockConfigModal } from './BlockConfigModal';
import { CloudSyncModal } from './CloudSyncModal';
import { FirebaseConfig } from '../../services/firebase';
import { 
  Lock, 
  Unlock, 
  Settings, 
  DoorOpen, 
  DoorClosed, 
  RotateCcw, 
  Users, 
  Clock,
  QrCode,
  Cloud
} from 'lucide-react';
import { formatDurationHuman } from '../../utils/timeUtils';

interface ModeratorDashboardProps {
  session: DebateSession;
  serverOffsetMs: number;
  isFirebaseConnected?: boolean;
  onConfigureFirebase?: (config: FirebaseConfig) => void;
  onUpdateConfig: (config: {
    title?: string;
    description?: string;
    totalBlockMinutes?: number;
    minSpeakerSeconds?: number;
    maxSpeakerSeconds?: number;
    adminPin?: string;
  }) => void;
  onSetRegistrationStatus: (status: 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED') => void;
  onShuffleSpeakers: () => void;
  onSetCurrentSpeaker: (index: number) => void;
  onControlTimer: (action: TimerControlPayload['action'], seconds?: number) => void;
  onNextSpeaker: () => void;
  onPrevSpeaker: () => void;
  onMoveSpeaker: (speakerId: string, direction: 'UP' | 'DOWN') => void;
  onUpdateSpeakerStatus: (speakerId: string, status: SpeakerStatus) => void;
  onRemoveSpeaker: (speakerId: string) => void;
  onAddExceptionSpeaker: (payload: AddExceptionSpeakerPayload) => void;
  onResetSession: () => void;
  onOpenQR: () => void;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  session,
  serverOffsetMs,
  isFirebaseConnected = false,
  onConfigureFirebase,
  onUpdateConfig,
  onSetRegistrationStatus,
  onShuffleSpeakers,
  onSetCurrentSpeaker,
  onControlTimer,
  onNextSpeaker,
  onPrevSpeaker,
  onMoveSpeaker,
  onUpdateSpeakerStatus,
  onRemoveSpeaker,
  onAddExceptionSpeaker,
  onResetSession,
  onOpenQR
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`mdf_auth_${session.id}`) === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Hook del Timer Sincronizado
  const timerHook = useDebateTimer(session.timer, serverOffsetMs, true);

  const currentSpeaker = session.currentSpeakerIndex >= 0 
    ? session.speakers[session.currentSpeakerIndex] 
    : undefined;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === session.adminPin || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`mdf_auth_${session.id}`, 'true');
      }
    } else {
      setPinError(true);
    }
  };

  // Pantalla de Bloqueo PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan flex items-center justify-center mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Acceso de Moderador</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Ingresa el PIN de administración de la comisión (PIN por defecto: <strong className="text-white">1234</strong>)
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="PIN (1234)"
              className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-white placeholder:tracking-normal placeholder:text-sm"
            />

            {pinError && (
              <p className="text-xs text-red-400 font-semibold">PIN incorrecto. Intenta con 1234.</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-sm shadow-lg shadow-mdf-blue/40 transition-all active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar al Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner de Control de Estado de la Sesión */}
      <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {session.title}
            </h1>
          </div>
          {session.description && (
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{session.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-mdf-cyan" /> Bloque: <strong className="text-white">{session.totalBlockMinutes} min</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-mdf-cyan" /> Inscriptos: <strong className="text-white">{session.speakers.length}</strong>
            </span>
            <span>•</span>
            <span>Tiempo por orador: <strong className="text-mdf-cyan font-mono">{formatDurationHuman(session.calculatedSpeakerSeconds)}</strong></span>
          </div>
        </div>

        {/* Action Buttons: Inscripción, Configuración, Cloud DB, QR, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Abrir / Cerrar Inscripción */}
          {session.status === 'REGISTRATION_OPEN' ? (
            <button
              onClick={() => onSetRegistrationStatus('REGISTRATION_CLOSED')}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <DoorClosed className="w-4 h-4" />
              <span>Cerrar Lista</span>
            </button>
          ) : (
            <button
              onClick={() => onSetRegistrationStatus('REGISTRATION_OPEN')}
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Abrir Lista</span>
            </button>
          )}

          {/* Botón de Sincronización en la Nube */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-colors ${
              isFirebaseConnected 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-mdf-darkBg hover:bg-slate-800 text-slate-300 border-mdf-darkBorder'
            }`}
            title="Conectar Base de Datos en Tiempo Real (Firebase / Vercel)"
          >
            <Cloud className="w-4 h-4 text-mdf-cyan" />
            <span className="hidden sm:inline">{isFirebaseConnected ? 'Nube Conectada' : 'Conectar Nube'}</span>
          </button>

          {/* Configuración */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-mdf-darkBorder text-slate-300 text-xs font-semibold transition-colors"
          >
            <Settings className="w-4 h-4 text-mdf-cyan" />
            <span className="hidden sm:inline">Configurar</span>
          </button>

          {/* QR */}
          <button
            onClick={onOpenQR}
            className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-mdf-darkBorder text-slate-300 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-4 h-4 text-mdf-cyan" />
            <span className="hidden sm:inline">QR Móvil</span>
          </button>

          {/* Reiniciar */}
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas reiniciar el bloque y la lista de oradores?')) {
                onResetSession();
              }
            }}
            className="p-2.5 rounded-xl bg-mdf-darkBg hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-mdf-darkBorder transition-colors"
            title="Reiniciar Bloque"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Grid Principal: Reloj en Vivo & Gestión de Oradores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Cronómetro Central & Controles */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card del Timer */}
          <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center">
            
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold tracking-wider uppercase text-slate-300">Orador en Vivo</span>
              {currentSpeaker && (
                <span className="font-mono font-bold text-mdf-cyan">
                  #{currentSpeaker.order} de {session.speakers.length}
                </span>
              )}
            </div>

            {/* Display Circular del Timer */}
            <BigTimerDisplay
              formattedTime={timerHook.formattedTime}
              isOvertime={timerHook.isOvertime}
              colorState={timerHook.colorState}
              progressPercent={timerHook.progressPercent}
              isPaused={session.timer.status === 'PAUSED'}
              isIdle={session.timer.status === 'IDLE'}
              speakerName={currentSpeaker?.name || (session.speakers.length > 0 ? 'Selecciona o inicia un orador' : 'Sin oradores')}
              speakerOrganization={currentSpeaker?.organization}
              size="md"
            />

          </div>

          {/* Controles de Timer */}
          <LiveTimerControls
            timer={session.timer}
            onControlTimer={onControlTimer}
            onNextSpeaker={onNextSpeaker}
            onPrevSpeaker={onPrevSpeaker}
            hasCurrentSpeaker={Boolean(currentSpeaker)}
            hasNextSpeaker={session.currentSpeakerIndex < session.speakers.length - 1}
            hasPrevSpeaker={session.currentSpeakerIndex > 0}
          />

        </div>

        {/* Columna Derecha: Cola de Oradores y Sorteo */}
        <div className="lg:col-span-7">
          <SpeakerQueueManager
            speakers={session.speakers}
            currentSpeakerIndex={session.currentSpeakerIndex}
            calculatedSpeakerSeconds={session.calculatedSpeakerSeconds}
            onSetCurrentSpeaker={onSetCurrentSpeaker}
            onMoveSpeaker={onMoveSpeaker}
            onUpdateStatus={onUpdateSpeakerStatus}
            onRemoveSpeaker={onRemoveSpeaker}
            onAddExceptionSpeaker={onAddExceptionSpeaker}
            onShuffle={onShuffleSpeakers}
          />
        </div>

      </div>

      {/* Modal de Configuración */}
      <BlockConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        session={session}
        onSave={onUpdateConfig}
      />

      {/* Modal de Sincronización en la Nube */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConfigSaved={(cfg) => {
          onConfigureFirebase?.(cfg);
        }}
      />

    </div>
  );
};
