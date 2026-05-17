import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  DailyHabitSummary, 
  TaskCompletionSummary, 
  FocusSummary, 
  GoalProgressSummary 
} from '../types';
import { useAuth } from './useAuth';
import { subDays, format } from 'date-fns';

export const useAnalytics = () => {
  const { user } = useAuth();
  const [dailyHabits, setDailyHabits] = useState<DailyHabitSummary[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskCompletionSummary[]>([]);
  const [focusSummary, setFocusSummary] = useState<FocusSummary[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);

    const oneYearAgo = format(subDays(new Date(), 364), 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    try {
      const [habitsRes, tasksRes, focusRes, goalsRes] = await Promise.all([
        supabase.from('daily_habit_summary').select('*').eq('user_id', user.id).gte('date', oneYearAgo).order('date'),
        supabase.from('task_completion_summary').select('*').eq('user_id', user.id).gte('date', sevenDaysAgo).order('date'),
        supabase.from('focus_summary').select('*').eq('user_id', user.id).gte('date', sevenDaysAgo).order('date'),
        supabase.from('goal_progress_summary').select('*').eq('user_id', user.id).limit(4)
      ]);

      setDailyHabits(habitsRes.data || []);
      setTaskSummary(tasksRes.data || []);
      setFocusSummary(focusRes.data || []);
      setGoalProgress(goalsRes.data || []);
    } catch (err) {
      console.error('Network Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return { dailyHabits, taskSummary, focusSummary, goalProgress, loading, refetch: fetchAnalytics };
};
