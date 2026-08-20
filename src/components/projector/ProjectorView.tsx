import React, { useState, useEffect } from 'react';
import { DebateSession } from '../../types/debate';
import { useDebateTimer } from '../../hooks/useDebateTimer';
import { BigTimerDisplay } from '../timer/BigTimerDisplay';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize, Minimize, Users, Mic, Clock } from 'lucide-react';
import { formatDurationHuman } from '../../utils/timeUtils';

interface ProjectorViewProps {
  session: DebateSession;
  serverOffsetMs: number;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ session, serverOffsetMs }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerHook = useDebateTimer(session.timer, serverOffsetMs, true);

  const currentSpeaker = session.currentSpeakerIndex >= 0 
    ? session.speakers[session.currentSpeakerIndex] 
    : undefined;

  // Próximos 3 oradores en espera
  const upcomingSpeakers = session.speakers
    .filter((_, idx) => idx > session.currentSpeakerIndex && session.speakers[idx].status === 'WAITING')
    .slice(0, 3);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const participantUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/?session=${session.id}&role=participant`
    : `https://mdf-juventudes.app/?session=${session.id}`;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#060A17] text-white p-4 md:p-8 flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mdf-blue/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-mdf-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar for Projector */}
      <div className="flex items-center justify-between gap-4 border-b border-mdf-darkBorder/80 pb-4 z-10">
        
        {/* Branding & Topic */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-mdf-blue p-1 flex items-center justify-center border border-mdf-cyan/40 shadow-lg shadow-mdf-blue/40 flex-shrink-0">
            <img src="/mdf-logo.jpg" alt="MDF" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">MDF <span className="text-mdf-cyan font-bold">JUVENTUDES</span></span>
              <span className="bg-mdf-cyan/20 text-mdf-cyan border border-mdf-cyan/40 text-xs px-2 py-0.5 rounded-full font-bold uppercase">
                Comisión de Debate
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight mt-0.5">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Fullscreen & Stats Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-300 bg-mdf-darkSurface/90 px-4 py-2 rounded-2xl border border-mdf-darkBorder">
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="w-4 h-4 text-mdf-cyan" /> {session.speakers.length} Inscriptos
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono text-mdf-cyan font-bold">
              <Clock className="w-4 h-4" /> {formatDurationHuman(session.calculatedSpeakerSeconds)} c/u
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-mdf-darkSurface hover:bg-mdf-blue/30 text-slate-300 hover:text-white border border-mdf-darkBorder transition-all"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (F11)'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Main Center Stage: Giant Timer & Active Speaker */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 z-10">
        
        {/* Active Speaker Card */}
        {currentSpeaker ? (
          <div className="text-center mb-4 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mdf-blue/30 border border-mdf-cyan/50 text-mdf-cyan text-sm font-bold uppercase tracking-widest mb-3">
              <Mic className="w-4 h-4 animate-pulse" />
              Orador #{currentSpeaker.order} de {session.speakers.length}
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg">
              {currentSpeaker.name}
            </h1>
            {currentSpeaker.organization && (
              <p className="text-xl md:text-2xl text-mdf-cyan font-semibold mt-1">
                {currentSpeaker.organization}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-400">
              {session.speakers.length === 0 ? 'Esperando Inscripciones' : 'Listo para Comenzar el Debate'}
            </h1>
          </div>
        )}

        {/* Big Giant Timer */}
        <BigTimerDisplay
          formattedTime={timerHook.formattedTime}
          isOvertime={timerHook.isOvertime}
          colorState={timerHook.colorState}
          progressPercent={timerHook.progressPercent}
          isPaused={session.timer.status === 'PAUSED'}
          isIdle={session.timer.status === 'IDLE'}
          size="giant"
        />

      </div>

      {/* Bottom Stage Deck: Upcoming Speakers & Mini QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end z-10">
        
        {/* Próximos 3 Oradores */}
        <div className="md:col-span-9 bg-mdf-darkSurface/80 backdrop-blur-md border border-mdf-darkBorder rounded-3xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <Users className="w-4 h-4 text-mdf-cyan" />
            <span>Próximos en hacer uso de la palabra:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {upcomingSpeakers.length === 0 ? (
              <div className="col-span-3 text-xs text-slate-500 py-2">
                No hay más oradores en espera para este bloque.
              </div>
            ) : (
              upcomingSpeakers.map((speaker, i) => (
                <div
                  key={speaker.id}
                  className="flex items-center gap-3 bg-mdf-darkBg/90 border border-slate-800 p-3 rounded-2xl"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-mdf-cyan font-black font-mono text-sm flex-shrink-0">
                    #{speaker.order}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{speaker.name}</div>
                    <div className="text-xs text-slate-400 truncate">
                      {speaker.organization || (i === 0 ? 'Siguiente orador' : `En ${i + 1} turnos`)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Small Corner QR Code for Audience to Scan */}
        <div className="md:col-span-3 bg-mdf-darkSurface/80 backdrop-blur-md border border-mdf-cyan/30 rounded-3xl p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-white">¿Quieres hablar?</div>
            <div className="text-[11px] text-mdf-cyan font-medium">Escanea para anotarte</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">#{session.id}</div>
          </div>
          <div className="p-1.5 bg-white rounded-xl flex-shrink-0 shadow-md">
            <QRCodeSVG value={participantUrl} size={64} level="M" />
          </div>
        </div>

      </div>

    </div>
  );
};
