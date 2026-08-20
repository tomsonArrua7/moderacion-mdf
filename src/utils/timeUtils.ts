/**
 * Formatea segundos a cadena mm:ss o +mm:ss para tiempo en exceso
 */
export const formatTime = (totalSeconds: number): { formatted: string; isOvertime: boolean; sign: string } => {
  const isOvertime = totalSeconds < 0;
  const absSeconds = Math.abs(Math.round(totalSeconds));
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  const sign = isOvertime ? '+' : '';
  const formatted = `${sign}${formattedMinutes}:${formattedSeconds}`;
  
  return { formatted, isOvertime, sign };
};

/**
 * Calcula automáticamente el tiempo por orador con límites configurables
 * Tiempo = Tiempo total del bloque / Cantidad de inscriptos
 * Clampeado a [minSeconds, maxSeconds]
 */
export const calculateSpeakerTimeSeconds = (
  totalBlockMinutes: number,
  speakerCount: number,
  minSeconds = 60,
  maxSeconds = 300
): number => {
  if (speakerCount <= 0) {
    return Math.min(Math.max(180, minSeconds), maxSeconds); // Default 3 min si no hay nadie
  }

  const totalSeconds = totalBlockMinutes * 60;
  const rawSecondsPerSpeaker = Math.floor(totalSeconds / speakerCount);

  // Redondear a múltiplos de 15 o 30 segundos para mayor comodidad humana
  let rounded = Math.round(rawSecondsPerSpeaker / 15) * 15;
  if (rounded < minSeconds) rounded = minSeconds;
  if (rounded > maxSeconds) rounded = maxSeconds;

  return rounded;
};

/**
 * Convierte segundos a formato amigable de lectura (ej: "2 min 30 s")
 */
export const formatDurationHuman = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec}s`;
  if (sec === 0) return `${min} min`;
  return `${min}m ${sec}s`;
};
