import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarEvent } from '../types';
import { useAuth } from './useAuth';

export const useCalendar = () => {
  const { user, ensureProfile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) console.error('Error calendar:', error.message);
      else setEvents(data || []);
    } catch (err) {
      console.error('Network Error calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const addEvent = async (event: Partial<CalendarEvent>) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ 
          title: event.title || 'Untitled Event',
          description: event.description || '',
          start_time: event.start_time,
          end_time: event.end_time,
          user_id: user.id 
        }])
        .select();
      if (error) {
        console.error('Supabase error adding calendar event:', error);
        throw error;
      }
      if (data && data.length > 0) {
        setEvents(prev => [...prev, data[0]]);
        return data[0];
      }
    } catch (err) {
      console.error('Failed to add calendar event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    const previousEvents = [...events];
    setEvents(prev => prev.filter(e => e.id !== id));
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete event:', errorMessage);
      alert(`Failed to delete event: ${errorMessage}`);
      setEvents(previousEvents);
    }
  };

  return { events, loading, addEvent, deleteEvent, refetch: fetchEvents };
};
