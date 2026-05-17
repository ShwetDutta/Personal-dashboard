import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Priority } from '../types';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user, ensureProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching tasks details:', error);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error('Network Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    
    // Ensure profile exists before adding task to satisfy FK constraint
    try {
      await ensureProfile(user);
    } catch (e) {
      console.warn('Fail-safe profile sync failed:', e);
    }

    const newTaskPayload = {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date,
      user_id: user.id,
      completed: false,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    const tempId = Math.random().toString();
    setTasks(prev => [...prev, { ...newTaskPayload, id: tempId } as Task]);

    try {
      const { data, error } = await supabase.from('tasks').insert([newTaskPayload]).select();

      if (error) {
        console.error('Error adding task:', error.message);
        setTasks(prev => prev.filter(t => t.id !== tempId));
        
        // If it's a FK error, maybe the profile is missing? (though useAuth should handle it)
        if (error.message.includes('violates foreign key constraint')) {
          console.warn('Possible missing profile. Attempting to ensure profile exists...');
          // we could call a profile sync here if needed, but it's risky in a hook
        }
        throw error;
      } else if (data) {
        setTasks(prev => prev.map(t => (t.id === tempId ? data[0] : t)));
        return data[0];
      }
    } catch (err) {
      console.error('Failed to add task:', err);
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    const { error } = await supabase.from('tasks').update(updates).eq('id', id);

    if (error) {
      console.error('Error updating task:', error.message);
      // Revert if error (simplified, ideally we'd fetch again)
      fetchTasks();
      throw error;
    }
  };

  const toggleTaskComplete = async (id: string, currentlyCompleted: boolean) => {
    const nextCompleted = !currentlyCompleted;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    await updateTask(id, { completed: nextCompleted, completed_at: completedAt as any });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete task:', errorMessage);
      alert(`Failed to delete task: ${errorMessage}`);
      setTasks(previousTasks);
      throw err;
    }
  };

  return { tasks, loading, addTask, updateTask, toggleTaskComplete, deleteTask, refetch: fetchTasks };
};
