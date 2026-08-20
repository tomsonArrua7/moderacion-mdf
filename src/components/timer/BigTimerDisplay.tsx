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
  showProgressRing = true
}) => {
  // Configuración de colores dinámicos
  const getColorStyles = () => {
    switch (colorState) {
      case 'danger':
        return {
          textColor: 'text-red-500 text-glow-red',
          ringColor: '#EF4444',
          bgGlow: 'bg-red-500/10 border-red-500/40 animate-glow-red',
          badgeText: isOvertime ? '¡TIEMPO EXCEDIDO!' : '¡TIEMPO CUMPLIDO!',
          badgeClass: 'bg-red-600 text-white animate-pulse'
        };
      case 'warning':
        return {
          textColor: 'text-amber-400 text-glow-amber',
          ringColor: '#F59E0B',
          bgGlow: 'bg-amber-500/10 border-amber-500/30',
          badgeText: 'ÚLTIMOS 30 SEGUNDOS',
          badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
        };
      case 'normal':
      default:
        return {
          textColor: 'text-white text-glow-cyan',
          ringColor: '#00D2FF',
          bgGlow: 'bg-mdf-blue/10 border-mdf-cyan/30',
          badgeText: 'EN USO DE LA PALABRA',
          badgeClass: 'bg-mdf-blue/30 text-mdf-cyan border border-mdf-cyan/40'
        };
    }
  };

  const colors = getColorStyles();

  // Dimensiones del reloj según el tamaño seleccionado
  const getSizeStyles = () => {
    switch (size) {
      case 'giant':
        return {
          container: 'w-full max-w-2xl py-6',
          timeText: 'text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter',
          ringSize: 360,
          strokeWidth: 12
        };
      case 'lg':
        return {
          container: 'w-full max-w-lg py-4',
          timeText: 'text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight',
          ringSize: 280,
          strokeWidth: 10
        };
      case 'sm':
        return {
          container: 'w-full max-w-xs py-2',
          timeText: 'text-4xl sm:text-5xl font-bold tracking-tight',
          ringSize: 180,
          strokeWidth: 6
        };
      case 'md':
      default:
        return {
          container: 'w-full max-w-md py-3',
          timeText: 'text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight',
          ringSize: 230,
          strokeWidth: 8
        };
    }
  };

  const dim = getSizeStyles();
  const radius = (dim.ringSize - dim.strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Stroke dash offset invertido para que se vaya vaciando
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center mx-auto ${dim.container}`}>
      
      {/* Background glow circle */}
      <div className={`relative flex items-center justify-center p-6 md:p-8 rounded-full border transition-all duration-500 ${colors.bgGlow}`}>
        
        {/* SVG Circular Progress Ring */}
        {showProgressRing && (
          <svg
            width={dim.ringSize}
            height={dim.ringSize}
            className="absolute inset-0 m-auto -rotate-90 transform pointer-events-none"
          >
            {/* Background track */}
            <circle
              cx={dim.ringSize / 2}
              cy={dim.ringSize / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={dim.strokeWidth}
              fill="transparent"
            />
            {/* Dynamic Progress track */}
            <circle
              cx={dim.ringSize / 2}
              cy={dim.ringSize / 2}
              r={radius}
              stroke={colors.ringColor}
              strokeWidth={dim.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-200"
            />
          </svg>
        )}

        {/* Center Content: Speaker Name & Big Time Numbers */}
        <div className="z-10 flex flex-col items-center justify-center text-center px-4">
          
          {/* Status Alert Badge */}
          <div className="mb-2">
            {isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50 uppercase tracking-wider">
                <Pause className="w-3.5 h-3.5 fill-amber-300" /> PAUSADO
              </span>
            ) : isIdle ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                LISTO PARA INICIAR
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badgeClass}`}>
                {isOvertime && <AlertCircle className="w-3.5 h-3.5" />}
                {colors.badgeText}
              </span>
            )}
          </div>

          {/* Time digits */}
          <div className={`font-mono tabular-nums leading-none select-none transition-colors duration-300 ${colors.textColor} ${dim.timeText}`}>
            {formattedTime}
          </div>

          {/* Speaker label if provided */}
          {speakerName && (
            <div className="mt-3 max-w-xs sm:max-w-sm truncate">
              <div className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {speakerName}
              </div>
              {speakerOrganization && (
                <div className="text-xs sm:text-sm text-mdf-cyan font-medium truncate">
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
