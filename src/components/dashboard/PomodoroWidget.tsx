import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, User, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import GlassCard from '../ui/GlassCard';
import { useFocus } from '../../hooks/useFocus';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface TimerState {
  startedAt: number | null;
  workSeconds: number;
  phase: 'work' | 'break';
  sessionId: string | null;
  isActive: boolean;
}

interface PomodoroWidgetProps {
  onSessionComplete?: (minutes: number) => void;
}

export default function PomodoroWidget({ onSessionComplete }: PomodoroWidgetProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const { startFocusSession, endFocusSession, refetchFocus } = useFocus();

  // Load / Sync with localStorage on mount
  useEffect(() => {
    // Clean legacy focus_timer if present
    localStorage.removeItem('focus_timer');

    const saved = localStorage.getItem('focus_timer_state');
    if (saved) {
      try {
        const state: TimerState = JSON.parse(saved);
        setPhase(state.phase || 'work');
        setCurrentSessionId(state.sessionId);
        
        if (state.isActive && state.startedAt) {
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          const remaining = Math.max(0, state.workSeconds - elapsed);
          
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
          } else {
            // Timer finished while user was away - auto complete
            handleComplete(state.sessionId, state.workSeconds, state.phase || 'work', state.startedAt);
          }
        } else {
          setTimeLeft(state.workSeconds);
          setIsActive(false);
        }
      } catch (e) {
        console.error('Failed to resume focus timer', e);
      }
    }
  }, []);

  // Timer Countdown Ticks
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            
            // Fetch state from localStorage to find starting timestamp
            const saved = localStorage.getItem('focus_timer_state');
            let startedAtMs = Date.now() - (phase === 'break' ? 5 * 60 : 25 * 60) * 1000;
            if (saved) {
              try {
                const s = JSON.parse(saved);
                if (s.startedAt) startedAtMs = s.startedAt;
              } catch (e) {}
            }
            
            console.log('[Focus] Timer reached zero, auto-completing');
            handleComplete(currentSessionId, phase === 'break' ? 5 * 60 : 25 * 60, phase, startedAtMs);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, currentSessionId]);

  const handleComplete = async (
    sessionId: string | null,
    totalSeconds: number,
    currentPhase: 'work' | 'break',
    startedAtMs?: number
  ) => {
    localStorage.removeItem('focus_timer_state');
    const durationMinutes = Math.round(totalSeconds / 60);

    console.log('[Focus] Completing session. Duration:', durationMinutes);

    try {
      if (user && currentPhase === 'work' && durationMinutes >= 1) {
        const completedAtISO = new Date().toISOString();
        const startedAtISO = startedAtMs 
          ? new Date(startedAtMs).toISOString() 
          : new Date(Date.now() - totalSeconds * 1000).toISOString();

        console.log('[Focus] User ID:', user?.id);
        const { data, error } = await supabase.from('focus_sessions').insert({
          user_id: user.id,
          duration_minutes: durationMinutes,
          completed: true,
          session_type: 'pomodoro',
          started_at: startedAtISO,
          completed_at: completedAtISO,
          title: 'Focus Session',
          created_at: completedAtISO
        }).select();
        
        if (error) {
          console.error('[Focus] Failed to save focus session:', error);
        } else {
          console.log('[Focus] Focus session saved:', data);
          if (onSessionComplete) {
            onSessionComplete(durationMinutes);
          }
        }
        refetchFocus();
      }
    } catch (err) {
      console.error('Failed to save focus session:', err);
    } finally {
      setIsActive(false);
      setCurrentSessionId(null);
      const nextPhase = currentPhase === 'work' ? 'break' : 'work';
      setPhase(nextPhase);
      const nextSeconds = nextPhase === 'break' ? 5 * 60 : 25 * 60;
      setTimeLeft(nextSeconds);
    }
  };

  const toggleTimer = async () => {
    if (isActive) {
      // Pause - calculate what was completed so far
      const saved = localStorage.getItem('focus_timer_state');
      if (saved) {
        const state: TimerState = JSON.parse(saved);
        if (state.startedAt) {
          const elapsedSeconds = state.workSeconds - timeLeft;
          if (elapsedSeconds >= 60 && phase === 'work') {
            handleComplete(currentSessionId, elapsedSeconds, phase, state.startedAt);
          } else {
            // Keep timeLeft where paused and persist in local storage
            const pausedState: TimerState = {
              startedAt: null,
              workSeconds: timeLeft,
              phase,
              sessionId: currentSessionId,
              isActive: false
            };
            localStorage.setItem('focus_timer_state', JSON.stringify(pausedState));
            setIsActive(false);
          }
        } else {
          setIsActive(false);
        }
      } else {
        setIsActive(false);
      }
    } else {
      // Start/Resume timer
      const timerState: TimerState = {
        startedAt: Date.now(),
        workSeconds: timeLeft, 
        phase: phase,
        sessionId: currentSessionId,
        isActive: true
      };
      
      localStorage.setItem('focus_timer_state', JSON.stringify(timerState));
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(25 * 60);
    setCurrentSessionId(null);
    localStorage.removeItem('focus_timer_state');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = phase === 'break' ? 5 * 60 : 25 * 60;
  const progress = (totalTime - timeLeft) / totalTime;

  return (
    <GlassCard className="p-10 h-full flex flex-col items-center justify-center relative overflow-hidden group">
      <div className={clsx(
        "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-colors duration-1000",
        phase === 'break' ? "bg-emerald-400" : "bg-indigo-400"
      )} />
      
      <div className="flex items-center gap-2 mb-10 relative z-10">
        <div className={clsx(
          "p-2.5 rounded-2xl transition-colors duration-500 shadow-sm border border-white/60",
          phase === 'break' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
        )}>
          {phase === 'break' ? <Coffee size={20} /> : <Timer size={20} />}
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
          {phase === 'break' ? 'Break' : 'Focus'}
        </h3>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center group/timer">
        <svg className="w-full h-full -rotate-90 filter drop-shadow-sm">
          <circle cx="112" cy="112" r="104" className="stroke-slate-100 fill-none" strokeWidth="4" />
          <circle
            cx="112" cy="112" r="104"
            className={clsx(
              "fill-none transition-all duration-1000 ease-linear",
              phase === 'break' ? "stroke-emerald-500" : "stroke-indigo-600"
            )}
            strokeWidth="8"
            strokeDasharray={653}
            strokeDashoffset={653 * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-12 relative z-10">
        <button 
          onClick={resetTimer}
          className="w-12 h-12 flex items-center justify-center glass bg-white/40 text-slate-500 rounded-2xl hover:bg-white transition-all active:scale-90"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          onClick={toggleTimer}
          className={clsx(
            "w-16 h-16 rounded-[1.75rem] shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95",
            isActive 
              ? 'bg-slate-900 text-white shadow-slate-300 hover:bg-slate-800' 
              : phase === 'break' 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
          )}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="translate-x-0.5" />}
        </button>
      </div>
    </GlassCard>
  );
}
