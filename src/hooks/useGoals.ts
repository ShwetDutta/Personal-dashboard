import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Goal, GoalMilestone } from '../types';
import { useAuth } from './useAuth';

export const useGoals = () => {
  const { user, ensureProfile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*, goal_milestones(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error.message);
      } else {
        setGoals(data || []);
        // Extract milestones from goals for local state compatibility if needed
        const allMilestones: GoalMilestone[] = [];
        data?.forEach((goal: any) => {
          if (goal.goal_milestones) {
            allMilestones.push(...goal.goal_milestones);
          }
        });
        setMilestones(allMilestones);
      }
    } catch (err) {
      console.error('Network Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const addGoal = async (goal: Partial<Goal>) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      const { data, error } = await supabase.from('goals').insert([{ 
        title: goal.title || 'New Goal',
        description: goal.description || '',
        category: goal.category || 'personal',
        target_value: goal.target_value || 100,
        current_value: goal.current_value || 0,
        unit: goal.unit || '',
        deadline: goal.deadline,
        user_id: user.id 
      }]).select();
      
      if (error) {
        console.error('Supabase error adding goal:', error);
        throw error;
      }
      if (data && data.length > 0) {
        setGoals(prev => [data[0], ...prev]);
      } else {
        console.warn('No data returned from goal insertion');
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
      throw err;
    }
  };

  const addMilestone = async (goalId: string, title: string) => {
    if (!user) return;
    try {
      await ensureProfile(user);
      
      const payload: any = {
        goal_id: goalId,
        user_id: user.id,
        title: title || 'New Milestone',
        completed: false
      };

      console.log('Attempting to insert milestone with user_id:', payload);
      let result = await supabase
        .from('goal_milestones')
        .insert([payload])
        .select();

      // If database throws a 'column does not exist' or schema-related error for user_id, 
      // retry the insert without the user_id column.
      if (result.error && (result.error.code === '42703' || result.error.message?.includes('user_id') || result.error.message?.includes('column'))) {
        console.warn('Insertion with user_id failed (column probably doesn\'t exist). Retrying without user_id:', result.error);
        const { user_id, ...payloadWithoutUserId } = payload;
        result = await supabase
          .from('goal_milestones')
          .insert([payloadWithoutUserId])
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Database error inserting milestone:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        setMilestones(prev => [...prev, data[0]]);
        // Also update goals list
        setGoals(prev => prev.map(goal => {
          if (goal.id === goalId) {
            return {
              ...goal,
              goal_milestones: [...(goal.goal_milestones || []), data[0]]
            };
          }
          return goal;
        }));
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
      throw err;
    }
  };

  const toggleMilestone = async (id: string, currentCompleted: boolean) => {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({ completed: !currentCompleted, completed_at: !currentCompleted ? new Date().toISOString() : null })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    setMilestones(prev => prev.map(m => m.id === id ? data[0] : m));
    // Also update goals list if they contain milestones
    setGoals(prev => prev.map(goal => ({
      ...goal,
      goal_milestones: goal.goal_milestones?.map((m: any) => m.id === id ? data[0] : m)
    })));
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    const previousGoals = [...goals];
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

    try {
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update goal:', err);
      setGoals(previousGoals);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    const previousGoals = [...goals];
    setGoals(prev => prev.filter(g => g.id !== id));

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete goal:', errorMessage);
      alert(`Failed to delete goal: ${errorMessage}`);
      setGoals(previousGoals);
    }
  };

  return { goals, milestones, loading, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone, refetch: fetchGoals };
};
