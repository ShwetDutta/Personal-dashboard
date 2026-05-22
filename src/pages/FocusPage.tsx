import React from 'react';
import PomodoroWidget from '../components/dashboard/PomodoroWidget';
import GlassCard from '../components/ui/GlassCard';
import { useFocus } from '../hooks/useFocus';
import { Calendar, History, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function FocusPage() {
  const { user } = useAuth();
  const { sessions, loading, refetchFocus } = useFocus();
  
  // Stats and state for the current day
  const [focusedToday, setFocusedToday] = React.useState(0);
  const [sessionsToday, setSessionsToday] = React.useState(0);

  // States for the interactive Date Checker feature
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDateFocused, setSelectedDateFocused] = React.useState<number>(0);
  const [selectedDateSessions, setSelectedDateSessions] = React.useState<number>(0);
  const [selectedDateLoading, setSelectedDateLoading] = React.useState<boolean>(false);
  const [selectedSessionsDetail, setSelectedSessionsDetail] = React.useState<any[]>([]);

  // Main active loading function for Today's Stats
  const fetchTodayStats = async () => {
    if (!user) return;

    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    if (error) {
      console.error('Failed to fetch daily focus stats:', error);
      return;
    }

    const totalMinutes = data?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;
    const sessionCount = data?.length ?? 0;

    setFocusedToday(totalMinutes);
    setSessionsToday(sessionCount);
  };

  // Main checker query for any custom selected Day
  const fetchStatsForSelectedDate = async (dateStr: string) => {
    if (!user) return;
    setSelectedDateLoading(true);
    try {
      const parsedDate = new Date(dateStr);
      const start = startOfDay(parsedDate).toISOString();
      const end = endOfDay(parsedDate).toISOString();

      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to query focus sessions for selected date:', error);
        return;
      }

      const totalMinutes = data?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;
      const sessionCount = data?.length ?? 0;

      setSelectedDateFocused(totalMinutes);
      setSelectedDateSessions(sessionCount);
      setSelectedSessionsDetail(data || []);
    } catch (e) {
      console.error('Error fetching date checker stats:', e);
    } finally {
      setSelectedDateLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchTodayStats();
    }
  }, [user]);

  React.useEffect(() => {
    if (user && selectedDate) {
      fetchStatsForSelectedDate(selectedDate);
    }
  }, [user, selectedDate]);

  const handleSessionComplete = (newSessionMinutes: number) => {
    // 1. Optimistic UI Updates (+30 mins, +1 session)
    setFocusedToday(prev => prev + newSessionMinutes);
    setSessionsToday(prev => prev + 1);

    // If selected date is today, also optimistically update checker state
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate === todayStr) {
      setSelectedDateFocused(prev => prev + newSessionMinutes);
      setSelectedDateSessions(prev => prev + 1);
      setSelectedSessionsDetail(prev => [
        {
          id: Math.random().toString(),
          title: 'Focus Session',
          duration_minutes: newSessionMinutes,
          created_at: new Date().toISOString(),
          started_at: new Date(Date.now() - newSessionMinutes * 60 * 1000).toISOString()
        },
        ...prev
      ]);
    }

    // 2. Refetch full background schema verification and stats
    setTimeout(() => {
      fetchTodayStats();
      if (selectedDate) {
        fetchStatsForSelectedDate(selectedDate);
      }
      refetchFocus();
    }, 1000);
  };

  const formatDuration = (mins: number) => {
    if (mins === 0) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 px-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full animate-pulse" />
            Focus Page
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">
            Your single-destination Pomodoro Workspace
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Hand: App Timer and Today Stats */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard className="p-8 rounded-[2rem] border-white/80 transition-all hover:bg-white group text-center flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100/30 blur-2xl rounded-full" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Focused Today</p>
                <h4 className="text-4xl font-black text-indigo-600 tracking-tight leading-none mt-1">
                  {formatDuration(focusedToday)}
                </h4>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-4 font-black">
                Goal: 120 mins
              </p>
            </GlassCard>

            <GlassCard className="p-8 rounded-[2rem] border-white/80 transition-all hover:bg-white group text-center flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100/30 blur-2xl rounded-full" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sessions Today</p>
                <h4 className="text-4xl font-black text-slate-800 tracking-tight leading-none mt-1">
                  {sessionsToday}
                </h4>
              </div>
              <p className="text-[9px] text-emerald-600 uppercase tracking-wider mt-4 font-black">
                +1 session per tick
              </p>
            </GlassCard>
          </div>

          <PomodoroWidget onSessionComplete={handleSessionComplete} />
        </div>

        {/* Right Hand: Interactive Date Query Feature */}
        <div>
          <GlassCard className="p-10 rounded-[3rem] border-white/80 shadow-md h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-100/40 blur-3xl rounded-full -mr-12 -mt-12" />
            
            <div className="relative z-10 w-full space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Focus History Lookup</h3>
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-500 mt-0.5">Query any date instantly</p>
                  </div>
                </div>
              </div>

              {/* Date selection field */}
              <div className="space-y-2 mt-4 text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left">
                  Choose a Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="history-date-checker"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-5 py-4 bg-slate-50/50 hover:bg-slate-50 text-slate-850 font-black border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-505 transition-all text-center tracking-wider shadow-inner text-sm"
                  />
                </div>
              </div>

              {/* Display panel */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {selectedDateLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center space-y-3"
                    >
                      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching records...</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Grid results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50/40 rounded-2xl border border-slate-100 text-center shadow-sm relative group hover:bg-white transition-all">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Minutes</span>
                          <h4 className="text-3xl font-black text-indigo-600 tracking-tight leading-none mt-2">
                            {selectedDateFocused}m
                          </h4>
                          <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase tracking-wide">
                            {formatDuration(selectedDateFocused)}
                          </span>
                        </div>

                        <div className="p-6 bg-slate-50/40 rounded-2xl border border-slate-100 text-center shadow-sm relative group hover:bg-white transition-all">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sessions</span>
                          <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-2">
                            {selectedDateSessions}
                          </h4>
                          <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase tracking-wide">
                            Completed
                          </span>
                        </div>
                      </div>

                      {/* Timeline Detail list */}
                      <div className="border-t border-slate-100/80 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <History size={13} />
                            Daily Session Log
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                            {selectedSessionsDetail.length} Logged
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedSessionsDetail.length > 0 ? (
                            selectedSessionsDetail.map((session, index) => (
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={session.id || index}
                                className="flex justify-between items-center bg-white/60 hover:bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <Sparkles size={11} className="text-emerald-500 animate-pulse" />
                                    {session.title || 'Focus Session'}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                                    <Clock size={10} />
                                    {format(new Date(session.completed_at || session.created_at), 'hh:mm a')}
                                  </p>
                                </div>
                                <span className="px-2.5 py-1 bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-wider">
                                  +30 min credit
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <div className="py-8 text-center bg-slate-50/30 border border-dashed border-slate-200/50 rounded-2xl">
                              <History size={24} className="mx-auto text-slate-300 mb-2" />
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                No records for this date
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
