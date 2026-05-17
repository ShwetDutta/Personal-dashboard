import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { CheckCircle2, Repeat, Timer, Zap, Trophy, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { useTasks } from '../../hooks/useTasks';
import { useHabits } from '../../hooks/useHabits';
import { useFocus } from '../../hooks/useFocus';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
  onClick?: () => void;
  data?: any[];
}

const StatCard = ({ icon: Icon, label, value, trend, color, onClick, data }: StatCardProps) => (
  <GlassCard 
    className="p-6 h-full flex flex-col group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden relative"
    onClick={onClick}
  >
    <div className="flex items-start justify-between relative z-10">
      <div className={clsx(
        "p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100",
        `text-${color}-600`
      )}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <div className={clsx(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
          trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        )}>
          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    
    <div className="mt-4 relative z-10">
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>

    {data && (
      <div className="absolute inset-x-0 bottom-0 h-12 opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : '#f59e0b'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${color})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </GlassCard>
);

export default function StatsCards() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { habits, entries, loading: habitsLoading } = useHabits();
  const { sessions, loading: focusLoading } = useFocus();
  const { dailyHabits, focusSummary, taskSummary, loading: analyticsLoading } = useAnalytics();
  const navigate = useNavigate();

  if (tasksLoading || habitsLoading || focusLoading || analyticsLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} className="h-40" />)}
      </div>
    );
  }

  const todayDate = new Date().toISOString().split('T')[0];
  const tasksCompletedToday = tasks.filter(t => t.completed && t.completed_at?.startsWith(todayDate)).length;
  const totalTasksToday = tasks.filter(t => t.due_date?.startsWith(todayDate)).length;
  
  const habitsDoneCount = entries.filter(e => e.completed).length;
  const totalHabitsCount = habits.length;

  const totalFocusMinutes = sessions
    .filter(s => s.created_at.startsWith(todayDate))
    .reduce((acc, s) => acc + s.duration_minutes, 0);
  
  const avgIntensity = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.productivity_score || 0), 0) / sessions.length) 
    : 0;

  // Derive trends and data from analytics summaries
  const focusChartData = focusSummary.slice(-7).map(s => ({ value: s.total_minutes }));
  const taskChartData = taskSummary.slice(-7).map(s => ({ value: s.tasks_completed }));
  const habitChartData = dailyHabits.slice(-7).map(s => ({ value: s.completion_rate * 100 }));

  const averageHabitCompletion = dailyHabits.length > 0 
    ? Math.round((dailyHabits.reduce((acc, curr) => acc + (curr.completion_rate || 0), 0) / dailyHabits.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard 
        icon={CheckCircle2} 
        label="Tasks Done" 
        value={`${tasksCompletedToday}/${totalTasksToday || tasks.filter(t => !t.completed).length}`} 
        color="indigo"
        onClick={() => navigate('/tasks')}
        data={taskChartData.length > 0 ? taskChartData : [{value: 0}, {value: 5}]}
      />
      <StatCard 
        icon={Repeat} 
        label="Habit Today" 
        value={`${habitsDoneCount}/${totalHabitsCount}`} 
        color="emerald"
        onClick={() => navigate('/habits')}
        data={habitChartData.length > 0 ? habitChartData : [{value: 0}, {value: 5}]}
      />
      <StatCard 
        icon={Timer} 
        label="Focus Time" 
        value={`${(totalFocusMinutes / 60).toFixed(1)}h`} 
        color="purple"
        onClick={() => navigate('/focus')}
        data={focusChartData.length > 0 ? focusChartData : [{value: 0}, {value: 5}]}
      />
      <StatCard 
        icon={Zap} 
        label="Efficiency" 
        value={`${avgIntensity}%`} 
        color="amber"
        onClick={() => navigate('/analytics')}
        data={focusChartData}
      />
      <StatCard 
        icon={Trophy} 
        label="Habit Mastery" 
        value={`${averageHabitCompletion}%`} 
        color="rose"
        onClick={() => navigate('/habits')}
        data={habitChartData}
      />
      <StatCard 
        icon={BarChart3} 
        label="Task Rate" 
        value={`${Math.round((tasksCompletedToday / (totalTasksToday || 1)) * 100)}%`} 
        color="blue"
        onClick={() => navigate('/analytics')}
        data={taskChartData}
      />
    </div>
  );
}
