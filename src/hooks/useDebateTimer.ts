import { useState, useEffect, useRef, useMemo } from 'react';
import { TimerState } from '../types/debate';
import { formatTime } from '../utils/timeUtils';
import { playWarning30sSound, playTimeUpSound, triggerHaptic } from '../utils/sound';

export type TimerColorState = 'normal' | 'warning' | 'danger';

export interface UseDebateTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  isOvertime: boolean;
  progressPercent: number;
  colorState: TimerColorState;
  elapsedSeconds: number;
}

export const useDebateTimer = (
  timerState: TimerState | null | undefined,
  serverOffsetMs = 0,
  enableSounds = true
): UseDebateTimerReturn => {
  const [now, setNow] = useState<number>(() => Date.now() + serverOffsetMs);
  
  // Guardamos las alertas disparadas para no repetirlas en el mismo turno
  const alert30FiredRef = useRef<boolean>(false);
  const alert0FiredRef = useRef<boolean>(false);
  const lastStartedAtRef = useRef<number | null>(null);

  // Reiniciar flags de alerta si cambia el startedAt o se resetea el timer
  useEffect(() => {
    if (timerState?.startedAt !== lastStartedAtRef.current) {
      lastStartedAtRef.current = timerState?.startedAt ?? null;
      alert30FiredRef.current = false;
      alert0FiredRef.current = false;
    }
  }, [timerState?.startedAt]);

  useEffect(() => {
    setNow(Date.now() + serverOffsetMs);
  }, [serverOffsetMs]);

  // Loop de actualización local a 10Hz (cada 100ms) cuando está corriendo
  useEffect(() => {
    if (!timerState || timerState.status !== 'RUNNING') {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now() + serverOffsetMs);
    }, 100);

    return () => clearInterval(interval);
  }, [timerState?.status, serverOffsetMs]);

  // Cálculo del tiempo restante sincronizado
  const { remainingSeconds, elapsedSeconds } = useMemo(() => {
    if (!timerState) {
      return { remainingSeconds: 0, elapsedSeconds: 0 };
    }

    const { status, durationSeconds, startedAt, accumulatedSeconds } = timerState;

    if (status === 'IDLE') {
      return { remainingSeconds: durationSeconds, elapsedSeconds: 0 };
    }

    let elapsed = accumulatedSeconds;

    if (status === 'RUNNING' && startedAt) {
      const currentServerTime = now;
      const runningMs = Math.max(0, currentServerTime - startedAt);
      elapsed += runningMs / 1000;
    }

    const remaining = durationSeconds - elapsed;
    return { remainingSeconds: remaining, elapsedSeconds: elapsed };
  }, [timerState, now]);

  // Detección de umbrales para efectos sonoros y hápticos
  useEffect(() => {
    if (!timerState || timerState.status !== 'RUNNING' || !enableSounds) {
      return;
    }

    const roundedRemaining = Math.floor(remainingSeconds);

    // Alerta de 30 segundos
    if (roundedRemaining <= 30 && roundedRemaining > 0 && !alert30FiredRef.current) {
      alert30FiredRef.current = true;
      playWarning30sSound();
      triggerHaptic([200, 100, 200]);
    }

    // Alerta de 0 segundos (tiempo cumplido)
    if (roundedRemaining <= 0 && !alert0FiredRef.current) {
      alert0FiredRef.current = true;
      playTimeUpSound();
      triggerHaptic([400, 200, 400]);
    }
  }, [remainingSeconds, timerState, enableSounds]);

  // Formato visual y porcentajes
  const { formatted: formattedTime, isOvertime } = useMemo(() => {
    return formatTime(remainingSeconds);
  }, [remainingSeconds]);

  const duration = timerState?.durationSeconds || 180;
  const progressPercent = useMemo(() => {
    if (duration <= 0) return 100;
    const pct = Math.max(0, Math.min(100, (elapsedSeconds / duration) * 100));
    return pct;
  }, [elapsedSeconds, duration]);

  const colorState: TimerColorState = useMemo(() => {
    if (remainingSeconds <= 0) return 'danger';
    if (remainingSeconds <= 30) return 'warning';
    return 'normal';
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    formattedTime,
    isOvertime,
    progressPercent,
    colorState,
    elapsedSeconds
  };
};
