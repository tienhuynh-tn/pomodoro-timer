import React from 'react';
import clsx from 'clsx';
import type { TimerMode } from '../types';

interface ModeSelectorProps {
  currentMode: TimerMode;
  changeMode: (mode: TimerMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, changeMode }) => {
  return (
    <div className="mode-selector glass-panel">
      <button
        className={clsx('mode-btn', { active: currentMode === 'focus' })}
        onClick={() => changeMode('focus')}
      >
        Focus
      </button>
      <button
        className={clsx('mode-btn', { active: currentMode === 'shortBreak' })}
        onClick={() => changeMode('shortBreak')}
      >
        Short Break
      </button>
      <button
        className={clsx('mode-btn', { active: currentMode === 'longBreak' })}
        onClick={() => changeMode('longBreak')}
      >
        Long Break
      </button>
    </div>
  );
};
