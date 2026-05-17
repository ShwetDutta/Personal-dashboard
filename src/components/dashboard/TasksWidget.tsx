import { useNavigate } from 'react-router-dom';
import { CheckSquare, Plus, Calendar, Flag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { useTasks } from '../../hooks/useTasks';
import { clsx } from 'clsx';
import { format, isPast, isToday } from 'date-fns';

export default function TasksWidget() {
  const { tasks, loading, toggleTaskComplete } = useTasks();
  const navigate = useNavigate();

  const priorityColors = {
    high: 'text-rose-600 bg-rose-50 border-rose-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(t => {
    const taskDateStr = t.due_date?.split('T')[0];
    const status = t.status || (t.completed ? 'completed' : 'todo');
    
    // (a) due_date is today
    if (taskDateStr === todayStr) return true;
    
    // (b) due_date is null and status is 'todo' or 'in_progress'
    if (!t.due_date && (status === 'todo' || status === 'in_progress')) return true;
    
    // (c) due_date is in the past and status is NOT 'completed'
    if (taskDateStr && taskDateStr < todayStr && status !== 'completed') return true;
    
    return false;
  }).filter(t => !t.archived);

  const upcomingTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const taskDateStr = t.due_date.split('T')[0];
    return taskDateStr > todayStr && !t.completed;
  }).slice(0, 3);

  const displayTasks = todayTasks.length > 0 ? todayTasks : upcomingTasks;
  const isViewingUpcoming = todayTasks.length === 0 && upcomingTasks.length > 0;

  return (
    <GlassCard className="h-full flex flex-col group overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 shadow-xl shadow-slate-200 text-white rounded-2xl">
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isViewingUpcoming ? 'Upcoming Tasks' : "Today's Tasks"}
            </h3>
            <div className="flex items-center gap-2">
              <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", isViewingUpcoming ? "bg-amber-400" : "bg-indigo-500")} />
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {isViewingUpcoming ? 'Getting ahead' : `${todayTasks.filter(t => !t.completed).length} items remaining`}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/tasks')}
          className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-2xl transition-all duration-300 text-slate-400 hover:text-indigo-600 shadow-sm"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-6 pt-2 flex-1 overflow-auto custom-scrollbar max-h-[480px]">
        {loading ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-20 rounded-3xl" />
            <LoadingSkeleton className="h-20 rounded-3xl" />
            <LoadingSkeleton className="h-20 rounded-3xl" />
          </div>
        ) : displayTasks.length > 0 ? (
          <div className="space-y-4">
            {displayTasks.sort((a, b) => {
              // Priority sorting
              const priorities = { high: 3, medium: 2, low: 1 };
              const ap = priorities[a.priority as keyof typeof priorities] || 2;
              const bp = priorities[b.priority as keyof typeof priorities] || 2;
              if (ap !== bp) return bp - ap;
              if (a.completed === b.completed) return 0;
              return a.completed ? 1 : -1;
            }).map((task) => (
              <motion.div 
                layout
                key={task.id}
                className={clsx(
                  "p-5 rounded-3xl border border-white/60 bg-white/40 flex items-center gap-5 transition-all hover:bg-white/60 group",
                  task.completed && "opacity-50"
                )}
              >
                <button 
                  onClick={() => toggleTaskComplete(task.id, task.completed)}
                  className={clsx(
                    "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0",
                    task.completed 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "border-slate-200 hover:border-indigo-400 bg-white"
                  )}
                >
                  {task.completed && <CheckSquare size={16} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className={clsx(
                    "font-bold text-slate-800 tracking-tight truncate transition-all duration-300",
                    task.completed && "line-through text-slate-400 font-medium"
                  )}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={clsx("text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border", priorityColors[task.priority || 'medium'])}>
                      {task.priority || 'medium'}
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <Calendar size={12} className="text-slate-300" />
                        {task.due_date.split('T')[0] === todayStr ? 'Today' : format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                   <ChevronRight size={20} className="text-slate-300" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center opacity-40">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl mb-4 flex items-center justify-center text-slate-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No tasks</p>
            <p className="text-xs text-slate-400 mt-1">Ready for something new?</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/20">
        <button 
          onClick={() => navigate('/tasks')}
          className="w-full py-4 glass bg-white/60 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all duration-300 active:scale-95 shadow-sm border-white/80"
        >
          View All Tasks
        </button>
      </div>
    </GlassCard>
  );
}
