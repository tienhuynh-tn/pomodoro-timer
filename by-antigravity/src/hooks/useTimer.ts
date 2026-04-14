import { useState, useEffect, useCallback } from 'react';
import type { TimerMode, TimerSettings } from '../types';

export function useTimer(settings: TimerSettings) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto-switch mode logic could go here or can be manually handled.
      // For a simple calm app, switching after ring is a good idea.
      setIsActive(false);
      const audio = new Audio('/notification.mp3'); // We'll assume a soft chime if available
      audio.play().catch(() => {}); // ignore error if no file
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = useCallback(() => setIsActive(!isActive), [isActive]);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  const changeMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  }, [settings]);

  // Derived state for display
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const progress = 1 - timeLeft / (settings[mode] * 60);

  return {
    mode,
    timeLeft,
    isActive,
    minutes,
    seconds,
    progress,
    toggleTimer,
    resetTimer,
    changeMode
  };
}
