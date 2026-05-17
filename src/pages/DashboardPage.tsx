import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import GlassCard from '../components/ui/GlassCard';
import { 
  CheckCircle2, 
  Target, 
  Zap, 
  Repeat, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useFocus } from '../hooks/useFocus';
import { useAnalytics } from '../hooks/useAnalytics';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { AreaChart, Area, XAxis, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, toggleTaskComplete } = useTasks();
  
  const [focusData, setFocusData] = useState<any[]>([]);
  const [totalDoneCount, setTotalDoneCount] = useState(0);
  const [doneThisWeek, setDoneThisWeek] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [habitConsistencyPercent, setHabitConsistencyPercent] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const sevenDaysAgo = subDays(new Date(), 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Focus data for chart
      const { data: focusSessions } = await supabase
        .from('focus_sessions')
        .select('duration_minutes, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());
      
      const days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      });

      const groupedFocus = days.map(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const mins = focusSessions?.filter(s => s.created_at.startsWith(dateStr))
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
        return { name: format(d, 'EEE').charAt(0), value: parseFloat((mins / 60).toFixed(1)) };
      });
      setFocusData(groupedFocus);

      // Tasks stats
      const [totalTasksRes, weekTasksRes, inProgressRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').gte('completed_at', subDays(new Date(), 7).toISOString()),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'completed').is('archived', false)
      ]);

      setTotalDoneCount(totalTasksRes.count || 0);
      setDoneThisWeek(weekTasksRes.count || 0);
      setInProgressCount(inProgressRes.count || 0);

      // Habit consistency
      const [habitsRes, todayEntriesRes] = await Promise.all([
        supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('habit_entries').select('id').eq('user_id', user.id).eq('entry_date', todayStr).eq('completed', true)
      ]);
      
      const totalHabits = habitsRes.count || 0;
      const completedToday = todayEntriesRes.data?.length || 0;
      setHabitConsistencyPercent(totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0);

      // Recent Activity
      const [recentTasks, recentFocus] = await Promise.all([
        supabase.from('tasks').select('id, title, completed_at').eq('user_id', user.id).eq('status', 'completed').gte('completed_at', todayStart.toISOString()).order('completed_at', { ascending: false }).limit(4),
        supabase.from('focus_sessions').select('id, duration_minutes, created_at').eq('user_id', user.id).gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(4)
      ]);

      const activities = [
        ...(recentTasks.data || []).map(t => ({
          id: t.id,
          title: t.title,
          type: 'task',
          time: t.completed_at,
          icon: CheckCircle2,
          color: 'text-emerald-500'
        })),
        ...(recentFocus.data || []).map(s => ({
          id: s.id,
          title: `Focused for ${s.duration_minutes}m`,
          type: 'focus',
          time: s.created_at,
          icon: Zap,
          color: 'text-indigo-500'
        }))
      ].sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime()).slice(0, 4);
      
      setRecentActivities(activities);
    };

    fetchStats();
  }, [user]);

  const { goals } = useGoals();
  const inProgressTasks = tasks.filter(t => !t.completed && !t.archived);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-10"
    >
      {/* Row 2: Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={item} className="lg:col-span-5">
          <GlassCard className="p-8 h-full bg-slate-900/5 border-slate-900/10">
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Overall Summary</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{totalDoneCount}</h3>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Done</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-900/5">
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{inProgressCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{doneThisWeek}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done This Week</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-4">
          <GlassCard className="p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Weekly Progress</p>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>
            <div className="h-[120px] -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData}>
                  <defs>
                    <linearGradient id="dashFocusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#dashFocusGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3">
          <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 w-full text-left">Habit Consistency</p>
            <div className="relative w-32 h-32">
               <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="80%" outerRadius="100%" data={[{ value: habitConsistencyPercent }]} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={10} fill="#6366f1" />
                  </RadialBarChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{habitConsistencyPercent}%</span>
               </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Row 3: Goals & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={item} className="lg:col-span-5">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Today's Goals</h3>
              <button onClick={() => navigate('/goals')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <Plus size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-6">
              {goals.slice(0, 3).map((goal) => {
                const progress = goal.target_value > 0 ? Math.round((goal.current_value / goal.target_value) * 100) : 0;
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                        )} />
                        <span className="text-sm font-bold text-slate-700">{goal.title}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400 tabular-nums">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <p className="text-sm text-slate-400 italic py-4">No active focus vectors.</p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Tasks In Progress</h3>
            <button onClick={() => navigate('/tasks')} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {inProgressTasks.slice(0, 2).map((task) => (
              <GlassCard key={task.id} className="p-6 min-w-[280px] flex-1 group hover:border-slate-900/20 transition-all">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                      task.priority === 'high' ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-400 bg-slate-50 border-slate-100"
                    )}>
                      {task.priority || 'medium'}
                    </span>
                    <button 
                      onClick={() => toggleTaskComplete(task.id, false)}
                      className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-200 hover:text-emerald-500 hover:border-emerald-200 transition-all"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight line-clamp-2">{task.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'Pending'}
                  </div>
                </div>
              </GlassCard>
            ))}
            <button 
              onClick={() => navigate('/tasks')}
              className="min-w-[280px] flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-slate-900">
                <Plus size={20} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Add Objective</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Recent Activity */}
      <motion.div variants={item}>
        <GlassCard className="p-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8">Recent Activity</h3>
          <div className="space-y-1">
            {recentActivities.map((activity, i) => (
              <div 
                key={activity.id} 
                className={clsx(
                  "flex items-center justify-between py-4",
                  i !== recentActivities.length - 1 && "border-b border-slate-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx("p-2 rounded-xl bg-slate-50", activity.color)}>
                    <activity.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activity.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activity.type}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {activity.time ? format(new Date(activity.time), 'h:mm a') : '—'}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="py-10 text-center opacity-30">
                <Activity size={32} className="mx-auto mb-4" />
                <p className="text-[11px] font-black uppercase tracking-widest">Stationary Period Detected</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
