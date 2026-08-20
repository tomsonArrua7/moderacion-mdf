// Sintetizador Web Audio API puro para efectos de sonido sin dependencias de archivos externos

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const isAudioSupported = (): boolean => {
  return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
};

const getAudioContext = (): AudioContext | null => {
  if (!isAudioSupported()) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const getSoundEnabled = (): boolean => soundEnabled;

/**
 * Sonido de aviso a los 30 segundos (campana/ping suave de dos tonos)
 */
export const playWarning30sSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Tono 1 (880 Hz - La5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Tono 2 (1174.66 Hz - Re6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.15);
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio playback not allowed yet:', err);
  }
};

/**
 * Sonido de tiempo cumplido a los 0 segundos (triple bip de atención)
 */
export const playTimeUpSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beeps = [0, 0.18, 0.36];

    beeps.forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now + delay); // D5
      gain.gain.setValueAtTime(0.4, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

/**
 * Fanfarria alegre para el Sorteo / Shuffle
 */
export const playFanfareSound = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, t: 0 },      // C5
      { f: 659.25, t: 0.1 },    // E5
      { f: 783.99, t: 0.2 },    // G5
      { f: 1046.50, t: 0.35 }   // C6
    ];

    const now = ctx.currentTime;
    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.3, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.45);
    });
  } catch (err) {
    console.warn('Fanfare error:', err);
  }
};

/**
 * Vibración háptica para dispositivos móviles (Android/iOS con soporte)
 */
export const triggerHaptic = (pattern: number | number[] = [200, 100, 200]) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignorar si el navegador bloquea vibración
    }
  }
};
