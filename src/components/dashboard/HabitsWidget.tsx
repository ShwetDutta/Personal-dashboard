import { useNavigate } from 'react-router-dom';
import { Repeat, Plus, Check, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { useHabits } from '../../hooks/useHabits';
import { clsx } from 'clsx';

export default function HabitsWidget() {
  const { habits, entries, loading, logHabit } = useHabits();
  const navigate = useNavigate();

  return (
    <GlassCard className="h-full flex flex-col group overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 shadow-xl shadow-emerald-200 text-white rounded-2xl">
            <Repeat size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Habits</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Daily Progress</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/habits')}
          className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-2xl transition-all duration-300 text-slate-400 hover:text-emerald-600 shadow-sm"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-8 pt-4 flex-1 custom-scrollbar overflow-auto max-h-[480px]">
        {loading ? (
          <div className="space-y-6">
             <LoadingSkeleton className="h-24 rounded-[2rem]" />
             <LoadingSkeleton className="h-24 rounded-[2rem]" />
          </div>
        ) : habits.length > 0 ? (
          <div className="space-y-6">
            {habits.map((habit) => {
              const entry = entries.find(e => e.habit_id === habit.id);
              const isCompleted = entry?.completed || false;
              const progress = habit.type === 'numeric' 
                ? Math.min(100, Math.round(((entry?.numeric_value || 0) / (habit.target_value || 1)) * 100))
                : (isCompleted ? 100 : 0);

              return (
                <div key={habit.id} className="relative group/item">
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => logHabit(habit.id, { completed: !isCompleted })}
                        className={clsx(
                          "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 active:scale-90 border-2 shrink-0",
                          isCompleted 
                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                            : "border-slate-100 bg-white text-slate-300 hover:border-emerald-400 hover:text-emerald-500"
                        )}
                      >
                        <Check size={24} strokeWidth={3} className={clsx(isCompleted ? "scale-100" : "scale-50 opacity-0")} />
                        {!isCompleted && <div className="w-2 h-2 rounded-full bg-slate-200" />}
                      </button>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 tracking-tight truncate">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Trophy size={10} className="text-amber-500" />
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {habit.streak || 0} Day Streak
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900 tracking-tighter">
                          {habit.type === 'numeric' ? (entry?.numeric_value || 0) : (isCompleted ? 'Done' : 'Pending')}
                        </span>
                        {habit.type === 'numeric' && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ {habit.target_value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={clsx(
                        "h-full rounded-full transition-colors duration-500",
                        isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center opacity-40">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl mb-4 flex items-center justify-center text-slate-300">
              <Repeat size={32} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No habits</p>
            <p className="text-xs text-slate-400 mt-1">Start small today.</p>
          </div>
        )}
      </div>

      <div className="p-8 pt-4 border-t border-white/20">
        <button 
          onClick={() => navigate('/habits')}
          className="w-full py-4 glass bg-white/60 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all duration-300 active:scale-95 shadow-sm border-white/80"
        >
          View Habits
        </button>
      </div>
    </GlassCard>
  );
}
