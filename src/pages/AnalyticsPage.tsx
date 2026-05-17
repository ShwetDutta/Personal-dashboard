import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Target, Repeat, Zap, Award, Activity } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    focusByDate: Record<string, number>;
    tasksByDate: Record<string, number>;
    habitsByDate: Record<string, { completed: number; total: number }>;
    goals: any[];
  }>({
    focusByDate: {},
    tasksByDate: {},
    habitsByDate: {},
    goals: [],
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const thirtyDaysAgo = subDays(new Date(), 29).toISOString();
      const thirtyDaysAgoStr = format(subDays(new Date(), 29), 'yyyy-MM-dd');

      const [focus, tasks, habits, habitEntries, goals] = await Promise.all([
        supabase.from('focus_sessions').select('*').eq('user_id', user.id).gte('created_at', thirtyDaysAgo),
        supabase.from('tasks').select('*').eq('user_id', user.id).eq('completed', true).gte('completed_at', thirtyDaysAgo).not('completed_at', 'is', null),
        supabase.from('habits').select('id').eq('user_id', user.id),
        supabase.from('habit_entries').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
        supabase.from('goals').select('*').eq('user_id', user.id),
      ]);

      const focusByDate: Record<string, number> = {};
      focus.data?.forEach(s => {
        const d = format(new Date(s.created_at), 'yyyy-MM-dd');
        focusByDate[d] = (focusByDate[d] || 0) + (s.duration_minutes || 0);
      });

      const tasksByDate: Record<string, number> = {};
      tasks.data?.forEach(t => {
        const d = format(new Date(t.completed_at || ''), 'yyyy-MM-dd');
        tasksByDate[d] = (tasksByDate[d] || 0) + 1;
      });

      const totalHabits = habits.data?.length || 0;
      const habitsByDate: Record<string, { completed: number; total: number }> = {};
      habitEntries.data?.forEach(e => {
        if (!habitsByDate[e.date]) habitsByDate[e.date] = { completed: 0, total: totalHabits };
        if (e.completed) habitsByDate[e.date].completed += 1;
      });

      setData({
        focusByDate,
        tasksByDate,
        habitsByDate,
        goals: goals.data || [],
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getLast30Days = () => {
    return eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    }).map(d => format(d, 'yyyy-MM-dd'));
  };

  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');

  // Summary Calcs
  const focusEntries = Object.entries(data.focusByDate);
  const weekFocusMinutes = focusEntries
    .filter(([date]) => date >= sevenDaysAgo)
    .reduce((sum, [, mins]) => sum + (mins as number), 0);
  const weekFocusHours = Math.floor(weekFocusMinutes / 60);
  const weekFocusMins = weekFocusMinutes % 60;

  const habitEntriesList = Object.entries(data.habitsByDate);
  const weekHabitConsistency = habitEntriesList.length > 0
    ? Math.round(habitEntriesList.filter(([date]) => date >= sevenDaysAgo).reduce((sum, [, d]) => {
        const val = d as { completed: number; total: number };
        return sum + (val.total > 0 ? val.completed / val.total : 0);
      }, 0) / Math.max(1, habitEntriesList.filter(([date]) => date >= sevenDaysAgo).length) * 100)
    : 0;

  const taskEntries = Object.entries(data.tasksByDate);
  const weekTasksDone = taskEntries
    .filter(([date]) => date >= sevenDaysAgo)
    .reduce((sum, [, count]) => sum + (count as number), 0);

  const avgGoalProgress = data.goals.length > 0
    ? Math.round(data.goals.reduce((sum, g) => sum + (g.target_value > 0 ? (g.current_value / g.target_value) : 0), 0) / data.goals.length * 100)
    : 0;

  const safeVal = (v: number) => (!Number.isFinite(v) || Number.isNaN(v)) ? 0 : v;

  // Chart Data
  const last30Days = getLast30Days();
  
  const focusChartData = last30Days.map(date => ({
    date,
    label: format(new Date(date), 'MMM d'),
    hours: parseFloat(((data.focusByDate[date] || 0) / 60).toFixed(1))
  }));

  const taskChartData = last30Days.map(date => ({
    date,
    label: format(new Date(date), 'MMM d'),
    tasks: safeVal(data.tasksByDate[date] || 0)
  }));

  const habitChartData = last30Days.map(date => {
    const entry = data.habitsByDate[date];
    const rate = entry && entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
    return { 
      date, 
      label: format(new Date(date), 'MMM d'),
      rate: safeVal(rate)
    };
  });

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto p-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregating protocol data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
            Analytics
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Comprehensive overview • Based on last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'WEEKLY FOCUS', value: `${weekFocusHours}h ${weekFocusMins}m`, icon: Zap, color: 'indigo' },
          { label: 'HABIT CONSISTENCY', value: `${weekHabitConsistency}%`, icon: Repeat, color: 'emerald' },
          { label: 'TASKS DONE THIS WEEK', value: `${weekTasksDone}`, icon: Target, color: 'rose' },
          { label: 'GOAL PROGRESS', value: `${avgGoalProgress}%`, icon: Award, color: 'amber' }
        ].map((stat, i) => (
          <GlassCard key={i} className="p-8 rounded-[2rem] border-white/80 group hover:bg-white transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className={clsx(
                "p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm",
                stat.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                stat.color === 'rose' && "bg-rose-50 text-rose-600",
                stat.color === 'amber' && "bg-amber-50 text-amber-600"
              )}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h4 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter tabular-nums">{stat.value}</h4>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <GlassCard className="p-10 rounded-[3rem] border-white/80">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-12 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity size={20} />
            </div>
            Focus Time (Hours)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusChartData}>
                <defs>
                  <linearGradient id="anaFocusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} 
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)', backgroundColor: '#fff', color: '#1e293b'}}
                  itemStyle={{color: '#6366f1', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} fill="url(#anaFocusGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[3rem] border-white/80">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-12 flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Target size={20} />
            </div>
            Tasks Completed
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData}>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} 
                  dy={10} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)', color: '#1e293b'}} 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[3rem] border-white/80">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-12 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Repeat size={20} />
            </div>
            Habit Completion Rate
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={habitChartData}>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} 
                  dy={10} 
                />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)', color: '#1e293b'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{r: 6, fill: '#10b981', strokeWidth: 3, stroke: 'white'}} 
                  activeDot={{r: 8, strokeWidth: 0, fill: '#0f172a'}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[3rem] border-white/80">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award size={20} />
            </div>
            Goal Progress
          </h3>
          <div className="space-y-8 overflow-y-auto custom-scrollbar max-h-[300px] pr-4">
            {data.goals.length > 0 ? data.goals.map((goal, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700 tracking-tight truncate mr-4">{goal.title}</span>
                  <span className="text-sm font-black text-slate-900 tabular-nums">{goal.target_value > 0 ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0}%</span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2 p-0.5 border border-white">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.target_value > 0 ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: 'circOut' }}
                    className="h-full rounded-full bg-indigo-600 transition-all duration-1000 shadow-sm shadow-indigo-100" 
                  />
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                <Target size={40} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Set goals to track your long-term success.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
