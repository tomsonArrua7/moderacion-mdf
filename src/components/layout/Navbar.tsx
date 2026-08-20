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
  Clock, 
  Lock, 
  LogOut,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { DebateSession } from '../../types/debate';
import { setSoundEnabled } from '../../utils/sound';

interface NavbarProps {
  session: DebateSession;
  currentView: 'moderator' | 'participant' | 'projector';
  onViewChange: (view: 'moderator' | 'participant' | 'projector') => void;
  isConnected: boolean;
  onOpenQR: () => void;
  onOpenCommissionSelect?: () => void;
  isAdminAuthenticated: boolean;
  onRequestAdminAuth: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  currentView,
  onViewChange,
  isConnected,
  onOpenQR,
  onOpenCommissionSelect,
  isAdminAuthenticated,
  onRequestAdminAuth,
  onAdminLogout
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
        
        {/* Brand & Selector de Comisión */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden shadow-md shadow-mdf-blue/30 border border-mdf-cyan/30 bg-mdf-blue flex-shrink-0">
            <img 
              src="/mdf-logo.jpg" 
              alt="MDF Juventudes Logo" 
              className="h-full w-full object-cover"
              onError={(e) => {
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
            
            {/* Botón para cambiar de comisión */}
            <button
              onClick={onOpenCommissionSelect}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white group transition-colors text-left"
              title="Cambiar de Comisión de Debate"
            >
              <MapPin className="w-3 h-3 text-mdf-cyan group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[170px] md:max-w-xs font-semibold underline decoration-mdf-cyan/40 underline-offset-2">
                {session.title}
              </span>
              <ChevronDown className="w-3 h-3 text-mdf-cyan" />
            </button>
          </div>
        </div>

        {/* Status and Info */}
        <div className="hidden lg:flex items-center gap-2">
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

        {/* Navigation & Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Navigation Tabs */}
          <div className="flex bg-mdf-darkSurface/90 p-1 rounded-xl border border-mdf-darkBorder">
            
            {/* Tab Participante */}
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

            {/* Tab Proyector */}
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

            {/* Tab Moderador: Solo si autenticado como Admin */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => onViewChange('moderator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'moderator'
                    ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/40 ring-1 ring-mdf-cyan'
                    : 'text-mdf-cyan hover:bg-mdf-blue/20'
                }`}
                title="Panel de Moderador (Admin)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Moderador</span>
              </button>
            ) : (
              <button
                onClick={onRequestAdminAuth}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                title="Acceder como Moderador (Requiere PIN)"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Admin</span>
              </button>
            )}

          </div>

          {/* Si está autenticado como moderador, botón para cerrar sesión admin */}
          {isAdminAuthenticated && (
            <button
              onClick={onAdminLogout}
              className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-mdf-darkBorder transition-colors"
              title="Cerrar Sesión de Moderador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

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
            title={isConnected ? 'Conectado al servidor en tiempo real' : 'Modo local / P2P'}
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
