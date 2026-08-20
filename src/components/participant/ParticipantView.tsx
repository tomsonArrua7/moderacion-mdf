import React, { useState, useEffect } from 'react';
import { DebateSession } from '../../types/debate';
import { useDebateTimer } from '../../hooks/useDebateTimer';
import { BigTimerDisplay } from '../timer/BigTimerDisplay';
import { 
  Users, 
  Clock, 
  Mic, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';
import { triggerHaptic } from '../../utils/sound';

interface ParticipantViewProps {
  session: DebateSession;
  serverOffsetMs: number;
  currentUserSpeakerId: string | null;
  onRegister: (name: string, organization?: string) => void;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  session,
  serverOffsetMs,
  currentUserSpeakerId,
  onRegister
}) => {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');

  // Hook del timer sincronizado
  const timerHook = useDebateTimer(session.timer, serverOffsetMs, true);

  // Buscar si el usuario actual está en la lista de oradores
  const mySpeaker = session.speakers.find((s) => s.id === currentUserSpeakerId);
  const isRegistered = Boolean(mySpeaker);

  // Orador actual
  const currentSpeaker = session.currentSpeakerIndex >= 0 
    ? session.speakers[session.currentSpeakerIndex] 
    : undefined;

  const isMyTurn = mySpeaker && currentSpeaker && mySpeaker.id === currentSpeaker.id;

  // Cuántos oradores faltan para mi turno
  const speakersAhead = mySpeaker
    ? session.speakers.filter(
        (s) => s.order < mySpeaker.order && s.status === 'WAITING'
      ).length + (currentSpeaker && currentSpeaker.order < mySpeaker.order ? 1 : 0)
    : 0;

  // Vibración háptica cuando llega mi turno
  useEffect(() => {
    if (isMyTurn) {
      triggerHaptic([300, 150, 300, 150, 500]);
    }
  }, [isMyTurn]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegister(name, organization);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-16">
      
      {/* MDF Juventudes Mobile Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mdf-blue/20 border border-mdf-cyan/30 text-mdf-cyan text-xs font-semibold mb-2">
          <span className="h-2 w-2 rounded-full bg-mdf-cyan animate-ping" />
          MDF Juventudes • Comisión en Vivo
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {session.title}
        </h1>
        {session.description && (
          <p className="text-xs text-slate-400 mt-1">{session.description}</p>
        )}
      </div>

      {/* Alerta de "¡ES TU TURNO DE HABLAR!" */}
      {isMyTurn && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-mdf-blue via-mdf-cyan to-mdf-blue text-slate-950 shadow-2xl shadow-mdf-cyan/50 animate-bounce-short border-2 border-white text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-md mb-2">
            <Mic className="w-6 h-6 text-mdf-blue animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-none text-slate-950">
            ¡ES TU TURNO DE HABLAR!
          </h2>
          <p className="text-xs font-bold text-slate-900 mt-1">
            Dirígete al estrado o enciende tu micrófono
          </p>
        </div>
      )}

      {/* Tarjeta de Estado del Participante */}
      {isRegistered ? (
        <div className="glass-panel-mdf rounded-3xl p-5 shadow-xl border border-mdf-cyan/30 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs text-mdf-cyan font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Inscripción Confirmada</span>
          </div>
          <div className="text-lg font-black text-white">{mySpeaker?.name}</div>
          {mySpeaker?.organization && (
            <div className="text-xs text-slate-300 font-medium">{mySpeaker.organization}</div>
          )}

          <div className="mt-4 pt-4 border-t border-mdf-cyan/20 grid grid-cols-2 gap-3">
            <div className="bg-mdf-darkBg/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tu Orden</span>
              <span className="text-2xl font-mono font-black text-mdf-cyan">
                #{mySpeaker?.order}
              </span>
            </div>

            <div className="bg-mdf-darkBg/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado</span>
              <span className="text-xs font-bold text-white mt-1 block">
                {mySpeaker?.status === 'SPEAKING'
                  ? '🎤 En uso de la palabra'
                  : mySpeaker?.status === 'DONE'
                  ? '✅ Turno cumplido'
                  : speakersAhead > 0
                  ? `Faltan ${speakersAhead} oradores`
                  : 'Próximo a hablar'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Formulario de Inscripción 1-Tap */
        session.status === 'REGISTRATION_OPEN' ? (
          <div className="bg-mdf-darkSurface/95 border-2 border-mdf-cyan/40 rounded-3xl p-5 shadow-2xl shadow-mdf-blue/30">
            <div className="text-center mb-4">
              <div className="inline-flex p-3 rounded-2xl bg-mdf-blue/20 text-mdf-cyan mb-2">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Anotarme para Hablar
              </h3>
              <p className="text-xs text-slate-400">
                Ingresa tus datos para entrar en la lista de oradores
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Tu Nombre y Apellido
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Sofía Martínez"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Bloque / Agrupación (Opcional)
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Ej: Juventudes Zona Sur / Univ."
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-mdf-blue to-mdf-blueHover text-white font-black text-sm shadow-xl shadow-mdf-blue/40 transition-all active:scale-95 mt-2"
              >
                <span>¡Anotarme en la Lista!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-mdf-darkSurface/60 border border-slate-800 rounded-3xl p-5 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold text-slate-300 text-sm mb-1">Inscripciones Cerradas</p>
            <p>El moderador ha cerrado las anotaciones para este bloque de debate.</p>
          </div>
        )
      )}

      {/* Reloj Sincronizado en Vivo del Orador Actual */}
      <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-5 shadow-xl text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Orador Actual en Escenario
        </div>

        <BigTimerDisplay
          formattedTime={timerHook.formattedTime}
          isOvertime={timerHook.isOvertime}
          colorState={timerHook.colorState}
          progressPercent={timerHook.progressPercent}
          isPaused={session.timer.status === 'PAUSED'}
          isIdle={session.timer.status === 'IDLE'}
          speakerName={currentSpeaker?.name || 'Esperando inicio'}
          speakerOrganization={currentSpeaker?.organization}
          size="sm"
        />
      </div>

      {/* Próximos Oradores en Lista */}
      <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-mdf-cyan" /> Orden del Debate
          </span>
          <span className="text-slate-400 font-mono">
            {session.speakers.length} inscriptos
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {session.speakers.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No hay oradores inscriptos todavía.
            </div>
          ) : (
            session.speakers.map((speaker, idx) => {
              const isCurrent = idx === session.currentSpeakerIndex;
              const isMe = speaker.id === currentUserSpeakerId;

              return (
                <div
                  key={speaker.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                    isCurrent
                      ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/30 font-bold'
                      : isMe
                      ? 'bg-mdf-cyan/15 border border-mdf-cyan/40 text-white font-semibold'
                      : speaker.status === 'DONE'
                      ? 'bg-slate-900/40 text-slate-500 line-through'
                      : 'bg-mdf-darkBg text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400 font-bold">#{speaker.order}</span>
                    <span className="truncate">{speaker.name}</span>
                    {isMe && (
                      <span className="bg-mdf-cyan text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        Tú
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex-shrink-0">
                    {isCurrent ? 'Hablando' : speaker.status === 'DONE' ? 'Expuso' : 'En espera'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
