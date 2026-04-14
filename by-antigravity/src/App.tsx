import './App.css';
import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { ModeSelector } from './components/ModeSelector';
import type { TimerSettings } from './types';

const defaultSettings: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15
};

function App() {
  const {
    mode,
    isActive,
    minutes,
    seconds,
    progress,
    toggleTimer,
    resetTimer,
    changeMode
  } = useTimer(defaultSettings);

  const handleSkip = () => {
    // Simple skip logic matching a popular Pomodoro behavior:
    // Focus -> Short Break
    // (We could keep a count for Long Break, but keep it simple right now)
    if (mode === 'focus') {
      changeMode('shortBreak');
    } else {
      changeMode('focus');
    }
  };

  return (
    <div className={`app-container ${mode}`}>
      <div className="main-content animate-fade-in">
        <ModeSelector currentMode={mode} changeMode={changeMode} />

        <div className="timer-wrapper">
          <TimerDisplay
            minutes={minutes}
            seconds={seconds}
            progress={progress}
            mode={mode}
          />
        </div>

        <TimerControls
          isActive={isActive}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}

export default App;
