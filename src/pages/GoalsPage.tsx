import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import GoalForm from '../components/goals/GoalForm';
import { Target, Plus, ChevronRight, Calendar, CheckCircle2, Circle, Trash2, Minus, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';

export default function GoalsPage() {
  const { goals, milestones, loading, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone } = useGoals();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<{ [key: string]: string }>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'learning': return '📚';
      case 'career': return '💼';
      case 'personal': return '👤';
      case 'finance': return '💰';
      case 'health': return '🥗';
      default: return '🎯';
    }
  };

  const handleUpdateProgress = async (goalId: string, newVal: number) => {
    await updateGoal(goalId, { current_value: newVal });
  };

  const handleAddMilestone = async (goalId: string) => {
    const title = newMilestoneTitle[goalId];
    if (!title?.trim()) return;
    
    await addMilestone(goalId, title);
    setNewMilestoneTitle(prev => ({ ...prev, [goalId]: '' }));
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await deleteGoal(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
            Goals
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Your objectives • {goals.length} active</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all w-fit"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-80 rounded-[3rem]" />
          <LoadingSkeleton className="h-80 rounded-[3rem]" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {goals.map((goal) => {
            const goalMilestones = milestones.filter(m => m.goal_id === goal.id);
            const progress = goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
            const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

            return (
              <GlassCard key={goal.id} className="p-10 flex flex-col group relative rounded-[3rem] border-white/80 transition-all duration-700 hover:bg-white overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-[80px] opacity-40 group-hover:bg-indigo-100 transition-colors duration-1000" />
                
                <div className="flex items-start justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.75rem] flex items-center justify-center text-4xl shadow-xl shadow-slate-100/50 group-hover:scale-110 transition-transform duration-500">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{goal.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                          {goal.category}
                        </span>
                        {goal.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-300" />
                            <span className={clsx(
                              "text-[10px] font-black uppercase tracking-widest",
                              daysLeft && daysLeft < 0 ? "text-rose-500" : "text-slate-400"
                            )}>
                              {daysLeft !== null 
                                ? (daysLeft < 0 ? `Late by ${Math.abs(daysLeft)} days` : `${daysLeft} days left`) 
                                : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className={clsx(
                      "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
                      confirmDeleteId === goal.id 
                        ? "bg-rose-600 text-white" 
                        : "bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {confirmDeleteId === goal.id ? <span className="text-[10px] font-bold">?!</span> : <Trash2 size={18} />}
                  </button>
                </div>

                <div className="mb-10 relative z-10">
                   <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-4 bg-slate-50/50 p-1.5 rounded-2xl border border-white">
                        <input 
                          type="number"
                          value={goal.current_value}
                          onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                          className="w-20 bg-white border border-slate-100 rounded-xl py-2 px-3 text-center font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <span className="text-sm font-black text-slate-800 tracking-tight pr-3">
                          / {goal.target_value} <span className="text-[10px] uppercase text-slate-400 ml-1">{goal.unit}</span>
                        </span>
                      </div>
                      <div className="text-right">
                         <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{Math.round(progress)}%</span>
                      </div>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-4 p-1 border border-white/60">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="bg-slate-900 h-full rounded-full shadow-lg shadow-slate-200 transition-all duration-1000 relative"
                      >
                         <div className="absolute right-0 top-0 h-full w-4 bg-white/20 blur-[2px] rounded-full" />
                      </motion.div>
                   </div>
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Milestones</h4>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{goalMilestones.filter(m => m.completed).length} / {goalMilestones.length} completed</span>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {goalMilestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMilestone(m.id, m.completed)}
                          className="w-full flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60 hover:bg-white hover:border-indigo-100 transition-all text-left shadow-sm group/milestone"
                        >
                           <div className={clsx(
                             "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                             m.completed 
                               ? "bg-slate-900 border-slate-900 text-white" 
                               : "border-slate-200 group-hover/milestone:border-indigo-400"
                           )}>
                              {m.completed && <CheckCircle2 size={14} />}
                              {!m.completed && <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />}
                           </div>
                           <span className={clsx(
                             "text-sm font-bold tracking-tight transition-all duration-300",
                             m.completed ? "text-slate-400 line-through font-medium" : "text-slate-800"
                           )}>
                              {m.title}
                           </span>
                        </button>
                     ))}
                   </div>
                   
                   <div className="flex gap-2 mt-6 p-2 bg-slate-50/50 rounded-2xl border border-white/40">
                      <input 
                        type="text" 
                        placeholder="Add a milestone..." 
                        value={newMilestoneTitle[goal.id] || ''}
                        onChange={(e) => setNewMilestoneTitle(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-transparent text-sm font-bold tracking-tight focus:outline-none placeholder:text-slate-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                      />
                      <button 
                        onClick={() => handleAddMilestone(goal.id)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-100"
                      >
                         <Plus size={18} strokeWidth={3} />
                      </button>
                   </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="py-24 glass rounded-[4rem] bg-white/40 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] mb-6 flex items-center justify-center text-slate-300">
              <Target size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Focus on your next big thing</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 mb-8">No goals set yet</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl"
            >
              Add Your First Goal
            </button>
        </div>
      )}

      {isFormOpen && (
        <GoalForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={addGoal}
        />
      )}
    </div>
  );
}
