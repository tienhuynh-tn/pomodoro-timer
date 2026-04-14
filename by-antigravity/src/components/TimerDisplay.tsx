import type { FC } from 'react';
import type { TimerMode } from '../types';

interface TimerDisplayProps {
  minutes: string;
  seconds: string;
  progress: number;
  mode: TimerMode;
}

export const TimerDisplay: FC<TimerDisplayProps> = ({ minutes, seconds, progress, mode }) => {
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const modeColors = {
    focus: 'var(--focus-color)',
    shortBreak: 'var(--break-color)',
    longBreak: 'var(--long-break-color)'
  };

  const currentColor = modeColors[mode];

  return (
    <div className="timer-display glass-panel">
      <svg className="timer-svg" width="320" height="320" viewBox="0 0 320 320">
        <circle
          className="timer-circle-bg"
          cx="160"
          cy="160"
          r={radius}
          strokeWidth="8"
        />
        <circle
          className="timer-circle-progress"
          cx="160"
          cy="160"
          r={radius}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          stroke={currentColor}
          strokeLinecap="round"
        />
      </svg>
      <div className="timer-text">
        <span className="time">{minutes}:{seconds}</span>
      </div>
    </div>
  );
};
