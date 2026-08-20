import React, { useState } from 'react';
import { 
  Tv, 
  Smartphone, 
  Shield, 
  Volume2, 
  VolumeX, 
  QrCode, 
  Wifi, 
  WifiOff, 
  Users,
  Clock
} from 'lucide-react';
import { DebateSession } from '../../types/debate';
import { setSoundEnabled } from '../../utils/sound';

interface NavbarProps {
  session: DebateSession;
  currentView: 'moderator' | 'participant' | 'projector';
  onViewChange: (view: 'moderator' | 'participant' | 'projector') => void;
  isConnected: boolean;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  currentView,
  onViewChange,
  isConnected,
  onOpenQR
}) => {
  const [audioOn, setAudioOn] = useState<boolean>(true);

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setSoundEnabled(next);
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'CONFIG':
        return <span className="bg-slate-700/80 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">Configuración</span>;
      case 'REGISTRATION_OPEN':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">Inscripción Abierta</span>;
      case 'REGISTRATION_CLOSED':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-semibold">Inscripción Cerrada</span>;
      case 'SORTED':
        return <span className="bg-mdf-blue/30 text-mdf-cyan border border-mdf-cyan/40 px-2.5 py-1 rounded-full text-xs font-semibold">Lista Sorteada</span>;
      case 'DEBATE_ACTIVE':
        return <span className="bg-mdf-blue text-white border border-mdf-cyan px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg shadow-mdf-blue/40 animate-pulse">Debate en Vivo</span>;
      case 'FINISHED':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-semibold">Debate Finalizado</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080E21]/90 backdrop-blur-md border-b border-mdf-darkBorder/60 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        
        {/* Brand & Logo MDF */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden shadow-md shadow-mdf-blue/30 border border-mdf-cyan/30 bg-mdf-blue flex-shrink-0">
            <img 
              src="/mdf-logo.jpg" 
              alt="MDF Juventudes Logo" 
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback visual si no cargara la imagen
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white flex items-center">
                MDF <span className="text-mdf-cyan ml-1 font-semibold text-xs tracking-widest uppercase bg-mdf-cyan/10 px-1.5 py-0.5 rounded border border-mdf-cyan/30">Juventudes</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate max-w-[200px] md:max-w-xs font-medium text-slate-300">{session.title}</span>
            </div>
          </div>
        </div>

        {/* Status and Info */}
        <div className="hidden sm:flex items-center gap-2">
          {getStatusBadge()}
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-mdf-darkSurface px-2.5 py-1 rounded-lg border border-slate-800">
            <Users className="w-3.5 h-3.5 text-mdf-cyan" />
            <span className="font-semibold text-slate-200">{session.speakers.length}</span> inscriptos
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-mdf-darkSurface px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-mdf-cyan" />
            <span className="font-semibold text-slate-200">{session.totalBlockMinutes}m</span> bloque
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Navigation Tabs for Views */}
          <div className="flex bg-mdf-darkSurface/90 p-1 rounded-xl border border-mdf-darkBorder">
            <button
              onClick={() => onViewChange('moderator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'moderator'
                  ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Panel de Moderador (Admin)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Moderador</span>
            </button>

            <button
              onClick={() => onViewChange('participant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'participant'
                  ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Vista Participante (Móvil)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Participante</span>
            </button>

            <button
              onClick={() => onViewChange('projector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'projector'
                  ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Vista Pantalla / Proyector"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Proyector</span>
            </button>
          </div>

          {/* QR Button */}
          <button
            onClick={onOpenQR}
            className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-mdf-blue/20 text-slate-300 hover:text-mdf-cyan border border-mdf-darkBorder hover:border-mdf-cyan/40 transition-colors"
            title="Mostrar Código QR para unirse"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-xl border transition-colors ${
              audioOn 
                ? 'bg-mdf-darkSurface text-mdf-cyan border-mdf-cyan/30 hover:bg-mdf-cyan/10' 
                : 'bg-mdf-darkSurface text-slate-500 border-mdf-darkBorder hover:text-slate-300'
            }`}
            title={audioOn ? 'Sonido Activado' : 'Sonido Silenciado'}
          >
            {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Online Connection Status indicator */}
          <div 
            className="flex items-center gap-1 p-2 rounded-xl bg-mdf-darkSurface border border-mdf-darkBorder text-xs text-slate-400"
            title={isConnected ? 'Conectado al servidor en tiempo real' : 'Modo local (sin servidor socket activo)'}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
