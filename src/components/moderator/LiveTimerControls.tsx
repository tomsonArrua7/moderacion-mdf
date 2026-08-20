import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  SkipForward, 
  SkipBack, 
  Clock 
} from 'lucide-react';
import { TimerState, TimerControlPayload } from '../../types/debate';

interface LiveTimerControlsProps {
  timer: TimerState;
  onControlTimer: (action: TimerControlPayload['action'], seconds?: number) => void;
  onNextSpeaker: () => void;
  onPrevSpeaker: () => void;
  hasCurrentSpeaker: boolean;
  hasNextSpeaker: boolean;
  hasPrevSpeaker: boolean;
}

export const LiveTimerControls: React.FC<LiveTimerControlsProps> = ({
  timer,
  onControlTimer,
  onNextSpeaker,
  onPrevSpeaker,
  hasCurrentSpeaker,
  hasNextSpeaker,
  hasPrevSpeaker
}) => {
  const isRunning = timer.status === 'RUNNING';
  const isPaused = timer.status === 'PAUSED';

  return (
    <div className="w-full bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
      
      {/* Controles Principales de Tiempo (Play/Pause/Reset) */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        
        {/* Previous Speaker */}
        <button
          onClick={onPrevSpeaker}
          disabled={!hasPrevSpeaker}
          className="p-3.5 rounded-2xl bg-mdf-darkBg hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-mdf-darkBorder transition-all active:scale-95"
          title="Orador Anterior"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Start / Pause / Resume Main Action Button */}
        {isRunning ? (
          <button
            onClick={() => onControlTimer('PAUSE')}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base shadow-lg shadow-amber-500/30 transition-all active:scale-95"
          >
            <Pause className="w-5 h-5 fill-slate-950" />
            <span>PAUSAR</span>
          </button>
        ) : (
          <button
            onClick={() => onControlTimer(isPaused ? 'RESUME' : 'START')}
            disabled={!hasCurrentSpeaker && timer.status === 'IDLE'}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-black text-base shadow-lg shadow-mdf-blue/40 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{isPaused ? 'REANUDAR' : 'INICIAR'}</span>
          </button>
        )}

        {/* Reset Clock */}
        <button
          onClick={() => onControlTimer('RESET')}
          className="p-3.5 rounded-2xl bg-mdf-darkBg hover:bg-slate-800 text-slate-300 border border-mdf-darkBorder transition-all active:scale-95"
          title="Reiniciar Cronómetro a tiempo base"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Next Speaker */}
        <button
          onClick={onNextSpeaker}
          disabled={!hasNextSpeaker}
          className="flex items-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          title="Pasar al Siguiente Orador"
        >
          <span>Siguiente</span>
          <SkipForward className="w-5 h-5" />
        </button>

      </div>

      {/* Ajustes Rápidos de Tiempo (+30s, -30s, +1m, etc.) */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-mdf-cyan" />
          <span>Ajuste en vivo:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onControlTimer('SUB_30S', 30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Minus className="w-3 h-3 text-red-400" /> 30s
          </button>

          <button
            onClick={() => onControlTimer('ADD_30S', 30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> 30s
          </button>

          <button
            onClick={() => onControlTimer('ADD_30S', 60)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> 1 min
          </button>

          <button
            onClick={() => onControlTimer('SET_TIME', 60)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium"
          >
            Fijar 1m
          </button>

          <button
            onClick={() => onControlTimer('SET_TIME', 180)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium"
          >
            Fijar 3m
          </button>
        </div>
      </div>

    </div>
  );
};
