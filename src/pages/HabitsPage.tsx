import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useHabits } from '../hooks/useHabits';
import { useAnalytics } from '../hooks/useAnalytics';
import GlassCard from '../components/ui/GlassCard';
import HabitForm from '../components/habits/HabitForm';
import HabitHeatmap from '../components/habits/HabitHeatmap';
import { Repeat, Plus, Check, Minus, Clock, Flame, Trophy, TrendingUp, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

export default function HabitsPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { habits, entries, loading, addHabit, logHabit, deleteHabit, selectedDate, setSelectedDate } = useHabits(today);
  const { dailyHabits, refetch: refetchAnalytics } = useAnalytics();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const last7Days = eachDayOfInterval({ 
    start: subDays(new Date(), 6), 
    end: new Date() 
  });

  const handleLog = async (id: string, value: any) => {
    try {
      await logHabit(id, value, selectedDate);
      refetchAnalytics();
    } catch (err) {
      console.error('Logging failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await deleteHabit(id);
      refetchAnalytics();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-emerald-600 rounded-full" />
            Habits
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Track your daily routines • {habits.length} active</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl glass border-white/60 overflow-x-auto">
          {last7Days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isTodayDay = dateStr === today;
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={clsx(
                  'px-4 py-2 rounded-xl flex flex-col items-center min-w-[64px] transition-all duration-300',
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'text-slate-400 hover:bg-white hover:text-slate-600'
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-widest mb-1">
                  {format(day, 'EEE')}
                </span>
                <span className="text-sm font-bold">
                  {format(day, 'd')}
                </span>
                {isTodayDay && !isSelected && (
                  <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all h-fit"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {habits.map((habit) => {
          const entry = entries.find(e => e.habit_id === habit.id);
          const isCompleted = entry?.completed || false;
          
          let progress = 0;
          let displayValue = "Not logged yet";
          let targetMet = false;

          if (habit.type === 'numeric') {
            const val = entry?.numeric_value || 0;
            progress = Math.min(100, Math.round((val / (habit.target_value || 1)) * 100));
            displayValue = `${val} / ${habit.target_value} ${habit.unit || ''}`;
            targetMet = val >= habit.target_value;
          } else if (habit.type === 'duration') {
            const val = entry?.duration_value || 0;
            progress = Math.min(100, Math.round((val / (habit.target_value || 1)) * 100));
            displayValue = `${val} / ${habit.target_value} min`;
            targetMet = val >= habit.target_value;
          } else {
            progress = isCompleted ? 100 : 0;
            displayValue = isCompleted ? "Completed" : "incomplete";
            targetMet = isCompleted;
          }

          return (
            <GlassCard key={habit.id} className="p-8 flex flex-col group overflow-hidden border-white/80 rounded-[2.5rem]">
              <div className="flex items-start justify-between mb-8">
                <div 
                  className="p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm transition-transform duration-500 group-hover:scale-110" 
                  style={{ color: habit.color }}
                >
                  {habit.type === 'boolean' ? <Check size={28} strokeWidth={3} /> : habit.type === 'duration' ? <Clock size={28} strokeWidth={3} /> : <TrendingUp size={28} strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                    targetMet ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {habit.type || 'activity'}
                  </span>
                  <button 
                    onClick={() => handleDelete(habit.id)}
                    className={clsx(
                      "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300",
                      confirmDeleteId === habit.id 
                        ? "bg-rose-600 text-white" 
                        : "text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {confirmDeleteId === habit.id ? <span className="text-[10px] font-bold">?!</span> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight truncate group-hover:text-emerald-600 transition-colors duration-500">{habit.name}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {displayValue}
                </p>
              </div>

              <div className="mb-8">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-white/60">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={clsx(
                      "h-full rounded-full transition-all duration-1000",
                      targetMet ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-indigo-500 shadow-lg shadow-indigo-100"
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {habit.type === 'boolean' ? (
                  <button
                    onClick={() => handleLog(habit.id, { completed: !isCompleted })}
                    className={clsx(
                      "flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 active:scale-95 shadow-sm border flex items-center justify-center gap-3",
                      isCompleted 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-300" 
                        : "bg-white border-white/80 text-slate-500 hover:text-emerald-600 hover:border-emerald-200"
                    )}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                    {isCompleted ? 'Target Met' : 'Mark Done'}
                  </button>
                ) : habit.type === 'duration' ? (
                  <div className="flex-1 flex items-center gap-2 bg-slate-50/50 p-1 rounded-2xl border border-white">
                    <input 
                      type="number"
                      value={entry?.duration_value || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleLog(habit.id, { duration_value: val, completed: val >= habit.target_value });
                      }}
                      className="flex-1 bg-white border border-slate-100 rounded-xl py-3 px-4 text-center font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-4">min</span>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 bg-slate-50/50 p-1 rounded-2xl border border-white">
                    <button 
                      onClick={() => {
                        const currentVal = entry?.numeric_value || 0;
                        const val = Math.max(0, currentVal - 1);
                        handleLog(habit.id, { numeric_value: val, completed: val >= habit.target_value });
                      }}
                      className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                    >
                      <Minus size={20} strokeWidth={3} />
                    </button>
                    <div className="flex-1 text-center">
                       <span className="text-xl font-black text-slate-900 tabular-nums">{entry?.numeric_value || 0}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const currentVal = entry?.numeric_value || 0;
                        const val = currentVal + 1;
                        handleLog(habit.id, { numeric_value: val, completed: val >= habit.target_value });
                      }}
                      className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl text-slate-400 hover:text-emerald-600 transition-all active:scale-90 shadow-sm"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
        {habits.length === 0 && !loading && (
          <div className="lg:col-span-3 py-24 glass rounded-[4rem] bg-white/40 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] mb-6 flex items-center justify-center text-slate-300">
              <Repeat size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">No habits yet</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 mb-8">Start small to build long-term routines</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl"
            >
              Add Your First Habit
            </button>
          </div>
        )}
      </div>

      <HabitHeatmap data={dailyHabits} />

      {isFormOpen && (
        <HabitForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={addHabit}
        />
      )}
    </div>
  );
}
