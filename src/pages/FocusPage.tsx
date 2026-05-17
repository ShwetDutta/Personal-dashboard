import React from 'react';
import PomodoroWidget from '../components/dashboard/PomodoroWidget';
import GlassCard from '../components/ui/GlassCard';
import { useFocus } from '../hooks/useFocus';
import { History, TrendingUp, Zap, Clock, Settings, Activity } from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function FocusPage() {
  const { user } = useAuth();
  const { sessions, loading, refetchFocus } = useFocus();
  const [focusedToday, setFocusedToday] = React.useState(0);
  const [sessionsToday, setSessionsToday] = React.useState(0);
  const [avgSession, setAvgSession] = React.useState(0);
  const [trendsData, setTrendsData] = React.useState<any[]>([]);

  const fetchTodayStats = async () => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: sessions = [], error } = await supabase
      .from('focus_sessions')
      .select('id, duration_minutes, started_at, ended_at')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());

    if (error) {
      console.error('Failed to fetch focus stats:', error);
      return;
    }

    const totalMinutes = (sessions as any[])?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;
    const sessionCount = (sessions as any[])?.length ?? 0;
    const avgMinutes = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;

    setFocusedToday(totalMinutes);
    setSessionsToday(sessionCount);
    setAvgSession(avgMinutes);
  };

  const fetchTrends = async () => {
    if (!user) return;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: sessions = [] } = await supabase
      .from('focus_sessions')
      .select('duration_minutes, created_at')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const byDate: Record<string, number> = {};
    (sessions as any[])?.forEach(s => {
      const date = s.created_at.split('T')[0];
      byDate[date] = (byDate[date] ?? 0) + s.duration_minutes;
    });

    // Build last 7 days array (fill missing dates with 0)
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayLabel,
        minutes: byDate[dateStr] ?? 0,
        hours: parseFloat(((byDate[dateStr] ?? 0) / 60).toFixed(1)),
      };
    });

    setTrendsData(chartData);
  };

  React.useEffect(() => {
    if (user) {
      fetchTodayStats();
      fetchTrends();
    }
  }, [user]);

  const formatDuration = (mins: number) => {
    if (mins === 0) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
            Focus
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Track your focus sessions • {sessions.length} total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 xl:col-span-4 h-fit lg:sticky lg:top-10">
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-6 rounded-2xl border-white/80 transition-all hover:bg-white group text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Focused Today</p>
                  <h4 className="text-2xl font-black text-slate-900">{formatDuration(focusedToday)}</h4>
               </GlassCard>
               <GlassCard className="p-6 rounded-2xl border-white/80 transition-all hover:bg-white group text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Sessions Today</p>
                  <h4 className="text-2xl font-black text-slate-900">{sessionsToday}</h4>
               </GlassCard>
               <GlassCard className="p-6 rounded-2xl border-white/80 transition-all hover:bg-white group text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Avg Session</p>
                  <h4 className="text-2xl font-black text-slate-900">{avgSession > 0 ? `${avgSession}m` : "—"}</h4>
               </GlassCard>
            </div>
          </div>
          <PomodoroWidget />
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-12">
          <GlassCard className="p-10 rounded-[3rem] border-white/80">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                Trends
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minutes Focused</span>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData}>
                  <defs>
                    <linearGradient id="focusGradDesign" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}}
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                    }}
                    labelStyle={{fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px'}}
                    itemStyle={{color: '#6366f1', fontWeight: 'bold', fontSize: '13px'}}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} fill="url(#focusGradDesign)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden rounded-[3rem] border-white/80">
            <div className="p-10 border-b border-white flex items-center justify-between bg-white/20">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <History size={20} className="text-slate-400" />
                Session History
              </h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Duration</th>
                    <th className="px-10 py-6">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="text-sm font-black text-slate-800 tracking-tight">
                          {isSameDay(new Date(session.created_at), new Date()) ? 'Today' : format(new Date(session.created_at), 'd MMM, yyyy')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{format(new Date(session.created_at), 'hh:mm a')}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                          {formatDuration(session.duration_minutes)}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm text-slate-600 font-bold tracking-tight">{session.title || 'Focus session'}</span>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center opacity-30">
                           <History size={40} className="mb-4" />
                           <p className="text-sm font-black uppercase tracking-[0.3em]">No sessions logged yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
