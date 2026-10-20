import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, CloudRain, Plus, Minus } from 'lucide-react';
import { Task, UserSettings } from '../types';
import { playBell, rainSynthesizer } from '../utils/audio';

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  settings: UserSettings;
  completedFocusCount: number;
  onFocusSessionComplete: (targetTaskTitle: string) => void;
}

type Mode = 'focus' | 'shortBreak' | 'longBreak';

export const FocusModal: React.FC<FocusModalProps> = ({
  isOpen,
  onClose,
  tasks,
  settings,
  completedFocusCount,
  onFocusSessionComplete,
}) => {
  const [mode, setMode] = useState<Mode>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('general');
  const [isRainActive, setIsRainActive] = useState<boolean>(false);

  // Duration in seconds
  const getInitialSeconds = useCallback((m: Mode): number => {
    if (m === 'focus') return (settings.workSessionDuration || 25) * 60;
    if (m === 'shortBreak') return (settings.shortBreakDuration || 5) * 60;
    return (settings.longBreakDuration || 15) * 60;
  }, [settings.workSessionDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  const [totalSeconds, setTotalSeconds] = useState<number>(() => getInitialSeconds('focus'));
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => getInitialSeconds('focus'));
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when mode changes or modal opens
  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    const secs = getInitialSeconds(newMode);
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  }, [getInitialSeconds]);

  useEffect(() => {
    if (isOpen) {
      // Refresh default time if modal reopened
      const initial = getInitialSeconds(mode);
      setTotalSeconds(initial);
      setSecondsRemaining(initial);
      setIsRunning(false);
    } else {
      setIsRunning(false);
      rainSynthesizer.stop();
      setIsRainActive(false);
    }
  }, [isOpen, mode, getInitialSeconds]);

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            if (settings.soundEffectsEnabled) {
              playBell();
            }
            if (mode === 'focus') {
              const target = selectedTaskId === 'general'
                ? 'General Study Session'
                : tasks.find((t) => t.id === selectedTaskId)?.title || 'Task Focus';
              onFocusSessionComplete(target);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId, tasks, settings.soundEffectsEnabled, onFocusSessionComplete]);

  // Toggle ambient rain audio
  const handleToggleRain = () => {
    if (isRainActive) {
      rainSynthesizer.stop();
      setIsRainActive(false);
    } else {
      rainSynthesizer.start();
      setIsRainActive(true);
    }
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    setSecondsRemaining((prev) => {
      const next = Math.max(60, prev + deltaSeconds);
      if (next > totalSeconds) {
        setTotalSeconds(next);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    const initial = getInitialSeconds(mode);
    setTotalSeconds(initial);
    setSecondsRemaining(initial);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const strokeDashoffset = 565.48 * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Focus Session</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pomodoro focus timer & ambient study space</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-2 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
            <button
              onClick={() => switchMode('focus')}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'focus' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Focus ({settings.workSessionDuration || 25}m)
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'shortBreak' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Short Break ({settings.shortBreakDuration || 5}m)
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'longBreak' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Long Break ({settings.longBreakDuration || 15}m)
            </button>
          </div>

          {/* Circular Timer Display */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="565.48"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-slate-800 tracking-tight font-mono">
                  {timeFormatted}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {mode === 'focus' ? 'DEEP WORK' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Adjust +/- 5 min */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-slate-600 text-xs">
                <button
                  onClick={() => handleAdjustTime(-300)}
                  className="px-2 py-2 hover:bg-slate-200/60 active:bg-slate-300 transition-colors"
                  title="Subtract 5 minutes"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 text-[11px] font-medium text-slate-600">5m</span>
                <button
                  onClick={() => handleAdjustTime(300)}
                  className="px-2 py-2 hover:bg-slate-200/60 active:bg-slate-300 transition-colors"
                  title="Add 5 minutes"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Current Focus Target Select */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Current Focus Target
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="general">General Study Session</option>
              {tasks.filter(t => t.status !== 'Completed').map((task) => (
                <option key={task.id} value={task.id}>
                  {task.subject ? `[${task.subject}] ` : ''}{task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Ambient Rain Audio row */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <CloudRain className={`w-5 h-5 ${isRainActive ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Ambient Rain Audio</span>
                <span className="text-[10px] text-slate-400">Deep study background acoustics</span>
              </div>
            </div>
            <button
              onClick={handleToggleRain}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                isRainActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isRainActive ? 'Turn Off' : 'Turn On'}
            </button>
          </div>

          {/* Sessions completed today */}
          <div className="text-center pt-1 text-xs text-slate-500 font-medium">
            Sessions completed today: <span className="font-bold text-slate-800">{completedFocusCount}</span> 🍅
          </div>
        </div>
      </div>
    </div>
  );
};
