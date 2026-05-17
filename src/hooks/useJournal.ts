import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { JournalEntry } from '../types';
import { useAuth } from './useAuth';

export const useJournal = () => {
  const { user, ensureProfile } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) console.error('Error journal:', error.message);
      else setEntries(data || []);
    } catch (err) {
      console.error('Network Error journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const addEntry = async (entry: Partial<JournalEntry>) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ 
          title: entry.title || 'Untitled Enlightenment', 
          content: entry.content || '',
          user_id: user.id, 
          pinned: false 
        }])
        .select();
      if (error) {
        console.error('Supabase error adding journal entry:', error);
        throw error;
      }
      if (data && data.length > 0) {
        setEntries(prev => [data[0], ...prev]);
        return data[0];
      }
    } catch (err) {
      console.error('Failed to add journal entry:', err);
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setEntries(prev => prev.map(e => e.id === id ? data[0] : e));
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    const previousEntries = [...entries];
    setEntries(prev => prev.filter(e => e.id !== id));
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete journal entry:', errorMessage);
      alert(`Failed to delete journal entry: ${errorMessage}`);
      setEntries(previousEntries);
    }
  };

  return { entries, loading, addEntry, updateEntry, deleteEntry, refetch: fetchEntries };
};
