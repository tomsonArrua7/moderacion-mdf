import React, { useState, useEffect } from 'react';
import { DebateSession } from '../../types/debate';
import { useDebateTimer } from '../../hooks/useDebateTimer';
import { BigTimerDisplay } from '../timer/BigTimerDisplay';
import { 
  Users, 
  Clock, 
  Mic, 
  UserCheck, 
  ArrowRight,
  Lock,
  UserPlus,
  MapPin
} from 'lucide-react';
import { triggerHaptic } from '../../utils/sound';

interface ParticipantViewProps {
  session: DebateSession;
  serverOffsetMs: number;
  currentUserSpeakerId: string | null;
  myRegisteredSpeakerIds?: string[];
  onRegister: (firstName: string, lastName: string, organization?: string) => void;
  onSelectSpeaker?: (speakerId: string | null) => void;
  onOpenCommissionSelect?: () => void;
  onRequestAdminAccess?: () => void;
  isAdminAuthenticated?: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  session,
  serverOffsetMs,
  currentUserSpeakerId,
  myRegisteredSpeakerIds = [],
  onRegister,
  onSelectSpeaker,
  onOpenCommissionSelect,
  onRequestAdminAccess,
  isAdminAuthenticated
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isRegisteringAnother, setIsRegisteringAnother] = useState(false);

  // Hook del timer sincronizado
  const timerHook = useDebateTimer(session.timer, serverOffsetMs, true);

  // Buscar si el usuario actual está en la lista de oradores
  const mySpeaker = session.speakers.find((s) => s.id === currentUserSpeakerId);
  const isRegistered = Boolean(mySpeaker);

  // Todos los oradores anotados desde este teléfono
  const mySpeakersList = session.speakers.filter((s) => myRegisteredSpeakerIds.includes(s.id));

  // Orador actual en el escenario
  const currentSpeaker = session.currentSpeakerIndex >= 0 
    ? session.speakers[session.currentSpeakerIndex] 
    : undefined;

  // Solo mostrar la alerta "¡ES TU TURNO DE HABLAR!" si el debate está activo y realmente está hablando
  const isMyTurn = Boolean(
    mySpeaker && 
    currentSpeaker && 
    mySpeaker.id === currentSpeaker.id && 
    session.status === 'DEBATE_ACTIVE' && 
    currentSpeaker.status === 'SPEAKING'
  );

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
    if (!firstName.trim() || !lastName.trim()) return;
    onRegister(firstName.trim(), lastName.trim(), organization.trim() || undefined);
    setFirstName('');
    setLastName('');
    setOrganization('');
    setIsRegisteringAnother(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-20">
      
      {/* MDF Juventudes Mobile Header con botón de cambio de comisión */}
      <div className="text-center pt-2">
        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mdf-blue/20 border border-mdf-cyan/30 text-mdf-cyan text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-mdf-cyan animate-ping" />
            MDF Juventudes
          </div>

          <button
            onClick={onOpenCommissionSelect}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mdf-darkSurface hover:bg-slate-800 border border-mdf-cyan/40 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Toca para cambiar de comisión"
          >
            <MapPin className="w-3 h-3 text-mdf-cyan" />
            <span>Cambiar Comisión</span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {session.title}
        </h1>
        {session.description && (
          <p className="text-xs text-slate-400 mt-1">{session.description}</p>
        )}
      </div>

      {/* Selector de perfil si anotó a más de una persona desde este móvil */}
      {mySpeakersList.length > 1 && (
        <div className="bg-mdf-darkSurface p-2 rounded-2xl border border-mdf-darkBorder">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 px-2">
            Oradores anotados desde este teléfono:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {mySpeakersList.map((spk) => (
              <button
                key={spk.id}
                onClick={() => {
                  onSelectSpeaker?.(spk.id);
                  setIsRegisteringAnother(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  currentUserSpeakerId === spk.id
                    ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40 border border-mdf-cyan'
                    : 'bg-mdf-darkBg text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                #{spk.order} {spk.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
      {isRegistered && !isRegisteringAnother ? (
        <div className="glass-panel-mdf rounded-3xl p-5 shadow-xl border border-mdf-cyan/30 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs text-mdf-cyan font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Inscripción Confirmada</span>
          </div>
          <div className="text-xl font-black text-white">{mySpeaker?.name}</div>
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
                  : session.status === 'CONFIG' || session.status === 'REGISTRATION_OPEN'
                  ? '⏳ En lista (Esperando sorteo)'
                  : speakersAhead > 0
                  ? `Faltan ${speakersAhead} oradores`
                  : 'Próximo a hablar'}
              </span>
            </div>
          </div>

          {/* Botón para Anotar a otra persona desde este dispositivo */}
          {session.status === 'REGISTRATION_OPEN' && (
            <button
              onClick={() => setIsRegisteringAnother(true)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkBg hover:bg-slate-800 text-mdf-cyan hover:text-white border border-mdf-darkBorder text-xs font-bold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Anotar a otro compañero desde este móvil</span>
            </button>
          )}
        </div>
      ) : (
        /* Formulario de Inscripción con Nombre, Apellido y Organización Opcional */
        session.status === 'REGISTRATION_OPEN' ? (
          <div className="bg-mdf-darkSurface/95 border-2 border-mdf-cyan/40 rounded-3xl p-5 shadow-2xl shadow-mdf-blue/30">
            <div className="text-center mb-4">
              <div className="inline-flex p-3 rounded-2xl bg-mdf-blue/20 text-mdf-cyan mb-2">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isRegisteringAnother ? 'Anotar a Otro Compañero' : 'Anotarme para Hablar'}
              </h3>
              <p className="text-xs text-slate-400">
                Ingresa los datos para registrar el turno de oratoria
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Apellido <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Organización / Agrupación <span className="text-slate-500 text-[10px] lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Ej: Juventudes Centro / Univ. / Bloque"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {isRegisteringAnother && (
                  <button
                    type="button"
                    onClick={() => setIsRegisteringAnother(false)}
                    className="py-3.5 px-4 rounded-xl bg-mdf-darkBg text-slate-400 text-xs font-bold hover:text-white"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-mdf-blue to-mdf-blueHover text-white font-black text-sm shadow-xl shadow-mdf-blue/40 transition-all active:scale-95"
                >
                  <span>{isRegisteringAnother ? 'Guardar Inscripción' : '¡Anotarme en la Lista!'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-mdf-darkSurface/60 border border-slate-800 rounded-3xl p-5 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold text-slate-300 text-sm mb-1">Inscripciones Cerradas</p>
            <p>El moderador abrirá las inscripciones en vivo cuando inicie el bloque.</p>
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

      {/* Lista de Oradores del Debate */}
      <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-mdf-cyan" /> Lista de Oradores
          </span>
          <span className="text-slate-400 font-mono">
            {session.speakers.length} inscriptos
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {session.speakers.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              Aún no hay oradores inscriptos.
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

      {/* Footer discreto para Acceso Moderador */}
      <div className="text-center pt-4 border-t border-slate-900">
        <button
          onClick={onRequestAdminAccess}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors py-1 px-3 rounded-lg hover:bg-slate-800/40"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isAdminAuthenticated ? 'Panel de Moderador (Activo)' : 'Acceso Moderador'}</span>
        </button>
      </div>

    </div>
  );
};
