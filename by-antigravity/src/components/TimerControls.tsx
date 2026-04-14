import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import clsx from 'clsx';

interface TimerControlsProps {
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  onSkip: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isActive, toggleTimer, resetTimer, onSkip
}) => {
  return (
    <div className="timer-controls glass-panel">
      <button 
        className="control-btn" 
        onClick={resetTimer} 
        aria-label="Reset timer"
        title="Reset"
      >
        <RotateCcw size={24} />
      </button>
      
      <button 
        className={clsx("control-btn play-btn", { active: isActive })} 
        onClick={toggleTimer} 
        aria-label={isActive ? "Pause timer" : "Start timer"}
      >
        {isActive ? <Pause size={32} /> : <Play size={32} className="play-icon" />}
      </button>
      
      <button 
        className="control-btn" 
        onClick={onSkip} 
        aria-label="Skip phase"
        title="Skip"
      >
        <SkipForward size={24} />
      </button>
    </div>
  );
};
