import React from 'react';
import { TimerColorState } from '../../hooks/useDebateTimer';
import { AlertCircle, Pause } from 'lucide-react';

interface BigTimerDisplayProps {
  formattedTime: string;
  isOvertime: boolean;
  colorState: TimerColorState;
  progressPercent: number;
  isPaused: boolean;
  isIdle: boolean;
  speakerName?: string;
  speakerOrganization?: string;
  size?: 'sm' | 'md' | 'lg' | 'giant';
  showProgressRing?: boolean;
}

export const BigTimerDisplay: React.FC<BigTimerDisplayProps> = ({
  formattedTime,
  isOvertime,
  colorState,
  progressPercent,
  isPaused,
  isIdle,
  speakerName,
  speakerOrganization,
  size = 'md',
  showProgressRing = true // Not used anymore for minimalist look, but kept for prop compatibility
}) => {
  // Configuración de colores dinámicos (sin glows, minimalista)
  const getColorStyles = () => {
    switch (colorState) {
      case 'danger':
        return {
          textColor: 'text-red-500',
          badgeText: isOvertime ? '¡TIEMPO EXCEDIDO!' : '¡TIEMPO CUMPLIDO!',
          badgeClass: 'bg-red-100 text-red-700 border border-red-200'
        };
      case 'warning':
        return {
          textColor: 'text-amber-500',
          badgeText: 'ÚLTIMOS 30 SEGUNDOS',
          badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200'
        };
      case 'normal':
      default:
        return {
          textColor: 'text-white',
          badgeText: 'EN USO DE LA PALABRA',
          badgeClass: 'bg-slate-100 text-mdf-blueDark border border-slate-300'
        };
    }
  };

  const colors = getColorStyles();

  // Dimensiones del reloj según el tamaño seleccionado
  const getSizeStyles = () => {
    switch (size) {
      case 'giant':
        return {
          container: 'w-full max-w-4xl py-6',
          timeText: 'text-8xl sm:text-9xl md:text-[12rem] font-black tracking-tighter',
        };
      case 'lg':
        return {
          container: 'w-full max-w-2xl py-4',
          timeText: 'text-7xl sm:text-8xl md:text-9xl font-black tracking-tight',
        };
      case 'sm':
        return {
          container: 'w-full max-w-sm py-2',
          timeText: 'text-5xl sm:text-6xl font-black tracking-tight',
        };
      case 'md':
      default:
        return {
          container: 'w-full max-w-lg py-3',
          timeText: 'text-6xl sm:text-7xl md:text-8xl font-black tracking-tight',
        };
    }
  };

  const dim = getSizeStyles();

  return (
    <div className={`relative flex flex-col items-center justify-center mx-auto ${dim.container}`}>
      
      {/* Minimalist Flat Container */}
      <div className={`relative flex items-center justify-center p-6 md:p-8 transition-all duration-500 w-full`}>
        
        {/* Center Content: Speaker Name & Big Time Numbers */}
        <div className="z-10 flex flex-col items-center justify-center text-center px-4 w-full">
          
          {/* Status Alert Badge */}
          <div className="mb-4">
            {isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-700 border border-amber-300 uppercase tracking-wider">
                <Pause className="w-4 h-4 fill-amber-700" /> PAUSADO
              </span>
            ) : isIdle ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                LISTO PARA INICIAR
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${colors.badgeClass}`}>
                {isOvertime && <AlertCircle className="w-4 h-4" />}
                {colors.badgeText}
              </span>
            )}
          </div>

          {/* Time digits */}
          <div className={`font-mono tabular-nums leading-none select-none transition-colors duration-300 ${colors.textColor} ${dim.timeText}`}>
            {formattedTime}
          </div>

          {/* Progress Bar (reemplaza al anillo circular por una barra lineal minimalista) */}
          {showProgressRing && !isIdle && (
            <div className="w-full max-w-lg h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  colorState === 'danger' ? 'bg-red-500' : colorState === 'warning' ? 'bg-amber-500' : 'bg-mdf-cyan'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              />
            </div>
          )}

          {/* Speaker label if provided */}
          {speakerName && (
            <div className="mt-6 max-w-full w-full truncate">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                {speakerName}
              </div>
              {speakerOrganization && (
                <div className="text-base sm:text-lg text-mdf-cyan font-bold truncate mt-1">
                  {speakerOrganization}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
