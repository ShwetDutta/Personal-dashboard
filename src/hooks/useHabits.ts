import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, HabitEntry } from '../types';
import { useAuth } from './useAuth';
import { startOfDay, endOfDay, format } from 'date-fns';

export const useHabits = (initialDate = format(new Date(), 'yyyy-MM-dd')) => {
  const { user, ensureProfile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const fetchData = async (date = selectedDate) => {
    if (!user) return;
    setLoading(true);

    try {
      const [habitsRes, entriesRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('habit_entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_date', date)
      ]);

      if (habitsRes.error) console.error('[useHabits] habitsRes error:', habitsRes.error.message);
      if (entriesRes.error) console.error('[useHabits] entriesRes error:', entriesRes.error.message);

      setHabits(habitsRes.data || []);
      setEntries(entriesRes.data || []);
    } catch (err) {
      console.error('[useHabits] fetchData catch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [user?.id, selectedDate]);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      const { data, error } = await supabase.from('habits').insert([{ 
        name: habit.name || 'New Habit',
        type: habit.type || 'boolean',
        target_value: habit.target_value || 1,
        unit: habit.unit || '',
        color: habit.color || '#6366f1',
        user_id: user.id 
      }]).select();
      
      if (error) throw error;
      if (data && data.length > 0) {
        setHabits(prev => [...prev, data[0]]);
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
      throw err;
    }
  };

  const logHabit = async (habitId: string, value: Partial<HabitEntry>, logDate = selectedDate) => {
    if (!user) return;
    
    const oldEntries = [...entries];
    
    // 1. Optimistic UI update
    setEntries(prev => {
      const existing = prev.find(e => e.habit_id === habitId);
      if (existing) {
        return prev.map(e => e.id === existing.id ? { ...e, ...value } : e);
      } else {
        const tempId = `temp-${Date.now()}`;
        return [...prev, { 
          id: tempId, 
          habit_id: habitId, 
          user_id: user.id, 
          entry_date: logDate,
          completed: false,
          numeric_value: 0,
          duration_value: 0,
          ...value, 
          created_at: new Date().toISOString() 
        } as HabitEntry];
      }
    });

    try {
      await ensureProfile(user);
      console.log('[Habit] Logging entry:', { habitId, date: logDate, value });

      const payload: any = {
        habit_id: habitId,
        user_id: user.id,
        entry_date: logDate,
        ...value
      };
      
      const { data, error } = await supabase
        .from('habit_entries')
        .upsert(payload, { onConflict: 'habit_id,entry_date' })
        .select();
      
      console.log('[Habit] Upsert result:', data, error);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setEntries(prev => {
          const others = prev.filter(e => e.habit_id !== habitId);
          return [...others, data[0]];
        });
      }
    } catch (err) {
      console.error('[logHabit] Error:', err);
      setEntries(oldEntries);
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    const previousHabits = [...habits];
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete habit:', err);
      setHabits(previousHabits);
    }
  };

  return { habits, entries, loading, addHabit, logHabit, deleteHabit, selectedDate, setSelectedDate, refetch: fetchData };
};
