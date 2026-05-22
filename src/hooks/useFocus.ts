import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FocusSession, PomodoroSession } from '../types';
import { useAuth } from './useAuth';

export const useFocus = () => {
  const { user, ensureProfile } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [activePomodoro, setActivePomodoro] = useState<PomodoroSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFocusSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) console.error('Error focus sessions:', error.message);
      else setSessions(data || []);
    } catch (err) {
      console.error('Network Error focus sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePomodoro = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error active pomodoro:', error.message);
      } else {
        setActivePomodoro(data);
      }
    } catch (err) {
      console.error('Network Error active pomodoro:', err);
    }
  };

  useEffect(() => {
    fetchFocusSessions();
    fetchActivePomodoro();
  }, [user]);

  const startFocusSession = async (session: Partial<FocusSession>) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert([{ 
          title: session.title || 'Focus Session',
          duration_minutes: session.duration_minutes || 25,
          user_id: user.id 
        }])
        .select();
      if (error) {
        console.error('Supabase error starting focus session:', error);
        throw error;
      }
      if (data && data.length > 0) {
        setSessions(prev => [data[0], ...prev]);
        return data[0];
      }
    } catch (err) {
      console.error('Failed to start focus session:', err);
      throw err;
    }
  };

  const endFocusSession = async (id: string, updates: Partial<FocusSession>) => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({ ...updates, ended_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    setSessions(prev => prev.map(s => s.id === id ? data[0] : s));
  };

  const startPomodoro = async (task_id?: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert([{
        user_id: user.id,
        task_id,
        status: 'active',
        work_minutes: 25,
        break_minutes: 5,
        cycles_completed: 0
      }])
      .select();
    if (error) throw error;
    setActivePomodoro(data[0]);
  };

  return { sessions, activePomodoro, loading, startFocusSession, endFocusSession, startPomodoro, refetchFocus: fetchFocusSessions };
};
