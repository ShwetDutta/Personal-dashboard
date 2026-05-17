import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '../hooks/useTasks';
import { useAnalytics } from '../hooks/useAnalytics';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import TaskForm from '../components/tasks/TaskForm';
import { CheckSquare, Plus, Calendar, ChevronDown, ChevronUp, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { format, isToday, isPast, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

export default function TasksPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const { tasks, loading, addTask, updateTask, toggleTaskComplete, deleteTask } = useTasks();
  const { refetch: refetchAnalytics } = useAnalytics();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const last14Days = eachDayOfInterval({ 
    start: subDays(new Date(), 13), 
    end: new Date() 
  });

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTaskComplete(id, completed);
    refetchAnalytics();
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await deleteTask(id);
      refetchAnalytics();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const taskDate = t.due_date?.split('T')[0];
    const completedDate = t.completed_at?.split('T')[0];
    
    // Exact match on due date OR completion date
    const dateMatch = taskDate === selectedDate || completedDate === selectedDate;
    
    // Carry over: if today is selected, show overdue tasks too
    if (selectedDate === today) {
      const isOverdue = taskDate && taskDate < today && !t.completed;
      return dateMatch || isOverdue;
    }

    return dateMatch;
  });

  const completedCount = filteredTasks.filter(t => t.completed).length;

  const priorityColors = {
    high: 'text-rose-600 bg-rose-50 border-rose-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
            Objectives
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Track your goals • {tasks.filter(t => !t.completed).length} remaining</p>
        </div>

        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl glass border-white/60 overflow-x-auto max-w-full md:max-w-md">
          {last14Days.map((day) => {
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
                  <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all w-fit h-fit"
        >
          <Plus size={18} />
          Add Objective
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
          {format(new Date(selectedDate), 'EEEE, d MMMM')}
          <span className="text-slate-300 mx-3">—</span>
          <span className="text-indigo-600">{filteredTasks.length} tasks</span>
          <span className="text-slate-300 mx-2">·</span>
          <span className="text-slate-400">{completedCount} completed</span>
        </h3>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-[2.5rem]" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task) => (
            <motion.div
              layout
              key={task.id}
            >
              <GlassCard className={clsx(
                "overflow-hidden transition-all duration-500 rounded-[2.5rem] border-white/80 group",
                task.completed && "opacity-60 bg-white/10"
              )}>
                <div
                  className="p-8 flex items-center gap-8 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(task.id, task.completed);
                    }}
                    className={clsx(
                      'w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 active:scale-90 flex-shrink-0',
                      task.completed ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-100 bg-white hover:border-indigo-400'
                    )}
                  >
                    {task.completed && <CheckSquare size={20} />}
                    {!task.completed && <div className="w-2 h-2 rounded-full bg-slate-100" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={clsx(
                        'text-xl font-black text-slate-800 tracking-tight transition-all truncate',
                        task.completed && 'line-through text-slate-400 font-bold'
                      )}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={clsx('text-[9px] uppercase font-black px-2.5 py-1 rounded-lg border tracking-widest', priorityColors[task.priority])}>
                        {task.priority || 'medium'}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                          <Calendar size={14} className="text-slate-300" />
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                        setIsFormOpen(true);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-white/80 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      className={clsx(
                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm border",
                        confirmDeleteId === task.id 
                          ? "bg-rose-600 text-white border-rose-600" 
                          : "bg-white border-white/80 text-slate-400 hover:text-rose-600"
                      )}
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="w-10 h-10 flex items-center justify-center text-slate-300">
                      {expandedId === task.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === task.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-24 pb-10 overflow-hidden"
                    >
                      <div className="pt-6 border-t border-slate-100/50">
                        <p className="text-slate-500 font-medium leading-relaxed">
                          {task.description || 'No detailed briefing provided for this objective.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 glass rounded-[3rem] bg-white/40 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] mb-6 flex items-center justify-center text-slate-300">
              <CheckSquare size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">No objectives</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 mb-8">Ready to define your mission for this day?</p>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl"
            >
              Add Objective
            </button>
        </div>
      )}

      {isFormOpen && (
        <TaskForm
          task={editingTask || { due_date: selectedDate }}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
        />
      )}
    </div>
  );
}
