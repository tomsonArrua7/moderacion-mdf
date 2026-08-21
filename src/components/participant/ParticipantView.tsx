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
  UserPlus,
  MapPin,
  AlertTriangle,
  Flame,
  Clock3,
  Shield
} from 'lucide-react';
import { triggerHaptic } from '../../utils/sound';

interface ParticipantViewProps {
  session: DebateSession;
  serverOffsetMs: number;
  currentUserSpeakerId: string | null;
  myRegisteredSpeakerIds?: string[];
  onRegister: (
    firstName: string, 
    lastName: string, 
    organization?: string, 
    allowDuplicate?: boolean
  ) => { success: boolean; speakerId?: string; isDuplicate?: boolean; isLate?: boolean; existingName?: string };
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
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Hook del timer sincronizado
  const timerHook = useDebateTimer(session.timer, serverOffsetMs, true);

  // Buscar si el usuario actual está en la lista oficial o en la complementaria
  const mySpeaker = session.speakers.find((s) => s.id === currentUserSpeakerId);
  const myLateSpeaker = session.lateSpeakers?.find((s) => s.id === currentUserSpeakerId);
  const isRegistered = Boolean(mySpeaker || myLateSpeaker);

  // Todos los oradores anotados desde este teléfono
  const allSpeakers = [...session.speakers, ...(session.lateSpeakers || [])];
  const mySpeakersList = allSpeakers.filter((s) => myRegisteredSpeakerIds.includes(s.id));

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

  const handleRegisterSubmit = (e: React.FormEvent, forceDuplicate = false) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const res = onRegister(
      firstName.trim(), 
      lastName.trim(), 
      organization.trim() || undefined,
      forceDuplicate
    );

    if (res.isDuplicate && !forceDuplicate) {
      setDuplicateWarning(
        `Ya existe una persona registrada como "${res.existingName || firstName.trim() + ' ' + lastName.trim()}" en esta comisión.`
      );
      return;
    }

    setDuplicateWarning(null);
    setFirstName('');
    setLastName('');
    setOrganization('');
    setIsRegisteringAnother(false);
  };

  const isRegistrationClosed = session.status !== 'REGISTRATION_OPEN';

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
                  spk.id === currentUserSpeakerId && !isRegisteringAnother
                    ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40 border border-mdf-cyan'
                    : 'bg-mdf-darkBg text-slate-400 border border-mdf-darkBorder hover:text-slate-200'
                }`}
              >
                {spk.name.split(' ')[0]} {spk.isLate ? '(Post.)' : `#${spk.order}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ALERTA EN VIVO: ES TU TURNO DE HABLAR */}
      {isMyTurn && (
        <div className="relative overflow-hidden bg-gradient-to-br from-mdf-blue via-[#0040C8] to-[#002D8C] border-2 border-mdf-cyan rounded-3xl p-6 text-center text-white shadow-2xl shadow-mdf-blue/60 animate-bounce">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3 text-cyan-200 animate-pulse">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            ¡Es tu turno de hablar!
          </h2>
          <p className="text-sm text-cyan-100 font-medium mt-1">
            Acércate al micrófono. Tu tiempo está corriendo en vivo.
          </p>
        </div>
      )}

      {/* ESTADO DE INSCRIPCIÓN / FORMULARIO */}
      {isRegistered && !isRegisteringAnother ? (
        mySpeaker ? (
          /* Tarjeta de Orador Oficial */
          <div className="bg-mdf-darkSurface/90 border border-mdf-cyan/30 rounded-3xl p-5 shadow-xl text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <UserCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                ● Inscripción Oficial Confirmada
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">{mySpeaker.name}</h3>
              {mySpeaker.organization && (
                <p className="text-xs text-mdf-cyan font-medium">{mySpeaker.organization}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="bg-mdf-darkBg/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Orden Sorteado</span>
                <span className="text-xl font-black text-mdf-cyan font-mono mt-0.5 block">
                  #{mySpeaker.order}
                </span>
              </div>

              <div className="bg-mdf-darkBg/80 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {mySpeaker.status === 'SPEAKING'
                    ? '🎤 En uso de la palabra'
                    : mySpeaker.status === 'DONE'
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
            <button
              onClick={() => {
                setIsRegisteringAnother(true);
                setDuplicateWarning(null);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkBg hover:bg-slate-800 text-mdf-cyan hover:text-white border border-mdf-darkBorder text-xs font-bold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Anotar a otro compañero desde este móvil</span>
            </button>
          </div>
        ) : (
          /* Tarjeta de Orador Inscripto Posteriormente (Lista Complementaria) */
          <div className="bg-mdf-darkSurface/90 border border-amber-500/40 rounded-3xl p-5 shadow-xl text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock3 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                ● Se agregó después para hablar
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">{myLateSpeaker?.name}</h3>
              {myLateSpeaker?.organization && (
                <p className="text-xs text-amber-200 font-medium">{myLateSpeaker.organization}</p>
              )}
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 text-left space-y-1">
              <p className="font-bold text-amber-300">📌 Listado Complementario</p>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Te registraste después del cierre de lista. Los moderadores podrán llamarte si hay tiempo disponible durante la comisión.
              </p>
            </div>

            {/* Botón para Anotar a otra persona */}
            <button
              onClick={() => {
                setIsRegisteringAnother(true);
                setDuplicateWarning(null);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkBg hover:bg-slate-800 text-amber-400 hover:text-white border border-mdf-darkBorder text-xs font-bold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Anotar a otro compañero desde este móvil</span>
            </button>
          </div>
        )
      ) : (
        /* Formulario de Inscripción (Tanto en lista abierta como en lista complementaria posterior) */
        <div className={`bg-mdf-darkSurface/95 border-2 rounded-3xl p-5 shadow-2xl ${
          isRegistrationClosed 
            ? 'border-amber-500/40 shadow-amber-500/20' 
            : 'border-mdf-cyan/40 shadow-mdf-blue/30'
        }`}>
          <div className="text-center mb-4">
            <div className={`inline-flex p-3 rounded-2xl mb-2 ${
              isRegistrationClosed ? 'bg-amber-500/20 text-amber-300' : 'bg-mdf-blue/20 text-mdf-cyan'
            }`}>
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {isRegisteringAnother ? 'Anotar a Otro Compañero' : 'Anotarme para Hablar'}
            </h3>
            
            {isRegistrationClosed ? (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
                <span className="font-bold text-amber-300 block mb-0.5">⚠️ Lista Oficial Cerrada</span>
                Te anotarás en el apartado <strong>"Se agregaron después para hablar"</strong> para que el moderador lo evalúe.
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Ingresa tus datos para registrar tu turno de oratoria
              </p>
            )}
          </div>

          <form onSubmit={(e) => handleRegisterSubmit(e, false)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setDuplicateWarning(null);
                  }}
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
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setDuplicateWarning(null);
                  }}
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

            {/* Aviso de Duplicado si ya existe el nombre */}
            {duplicateWarning && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 space-y-2 animate-shake">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{duplicateWarning}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleRegisterSubmit(e, true)}
                    className="py-1.5 px-3 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-[11px] transition-colors"
                  >
                    Anotar de todos modos (persona distinta)
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {isRegisteringAnother && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisteringAnother(false);
                    setDuplicateWarning(null);
                  }}
                  className="py-3.5 px-4 rounded-xl bg-mdf-darkBg text-slate-400 text-xs font-bold hover:text-white"
                >
                  Volver
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 ${
                  isRegistrationClosed
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-amber-600/30'
                    : 'bg-gradient-to-r from-mdf-blue to-mdf-blueHover text-white shadow-mdf-blue/40'
                }`}
              >
                <span>
                  {isRegisteringAnother 
                    ? 'Guardar Inscripción' 
                    : isRegistrationClosed 
                    ? 'Anotarme en Lista Complementaria' 
                    : '¡Anotarme en la Lista!'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
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
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-mdf-cyan" />
            <span>Lista Oficial de Oradores ({session.speakers.length})</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {session.status === 'SORTED' || session.status === 'DEBATE_ACTIVE' ? 'Sorteado' : 'Sin sortear'}
          </span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {session.speakers.length === 0 ? (
            <p className="text-center py-6 text-slate-500 text-xs">
              Aún no hay oradores inscriptos en esta comisión.
            </p>
          ) : (
            session.speakers.map((spk, idx) => {
              const isCurrent = idx === session.currentSpeakerIndex;
              const isMe = mySpeaker && mySpeaker.id === spk.id;

              return (
                <div
                  key={spk.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-mdf-blue/30 border-mdf-cyan text-white shadow-md'
                      : isMe
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : spk.status === 'DONE'
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                      : 'bg-mdf-darkBg border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-[11px] text-slate-400 w-5">
                      #{spk.order}
                    </span>
                    <span className="font-semibold truncate">
                      {spk.name} {isMe && '(Tú)'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {isCurrent ? (
                      <span className="text-mdf-cyan flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Hablando
                      </span>
                    ) : spk.status === 'DONE' ? (
                      <span className="text-slate-500">Expuso</span>
                    ) : spk.status === 'ABSENT' ? (
                      <span className="text-red-400">Ausente</span>
                    ) : (
                      <span className="text-slate-400">En espera</span>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Sección compacta de "Se agregaron después" en vista pública */}
        {session.lateSpeakers && session.lateSpeakers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Se agregaron después ({session.lateSpeakers.length})</span>
              </span>
            </div>
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
              {session.lateSpeakers.map((spk, idx) => (
                <div
                  key={spk.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-100"
                >
                  <span className="truncate">
                    #{idx + 1} {spk.name} {myLateSpeaker?.id === spk.id && '(Tú)'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Complementaria</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer de Acceso Moderador */}
      {!isAdminAuthenticated && (
        <div className="text-center pt-2">
          <button
            onClick={onRequestAdminAccess}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 px-3 rounded-xl hover:bg-slate-800/40"
          >
            <Shield className="w-3.5 h-3.5 text-mdf-cyan" />
            <span>Acceso Moderador (Contraseña)</span>
          </button>
        </div>
      )}

    </div>
  );
};
