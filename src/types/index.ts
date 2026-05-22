export type Priority = 'low' | 'medium' | 'high';
export type HabitType = 'boolean' | 'numeric' | 'duration';
export type GoalCategory = 'fitness' | 'learning' | 'career' | 'personal' | 'finance' | 'health';
export type PomodoroStatus = 'active' | 'paused' | 'completed';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  event_type: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  target_value: number;
  unit?: string;
  color: string;
  created_at: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  completed: boolean;
  numeric_value?: number;
  duration_value?: number;
  entry_date: string;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  title?: string;
  duration_minutes: number;
  productivity_score?: number;
  distractions?: number;
  created_at: string;
  ended_at?: string;
  completed?: boolean;
  session_type?: string;
  started_at?: string;
  completed_at?: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  status: PomodoroStatus;
  work_minutes: number;
  break_minutes: number;
  cycles_completed: number;
  created_at: string;
  paused_at?: string;
  ended_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  pinned: boolean;
  mood?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  color?: string;
  created_at: string;
}

// Analytics View Types
export interface DailyHabitSummary {
  user_id: string;
  date: string;
  habits_completed: number;
  total_habits: number;
  completion_rate: number;
}

export interface TaskCompletionSummary {
  user_id: string;
  date: string;
  tasks_completed: number;
  tasks_created: number;
}

export interface FocusSummary {
  user_id: string;
  date: string;
  total_minutes: number;
  session_count: number;
}

export interface GoalProgressSummary {
  user_id: string;
  goal_id: string;
  title: string;
  progress_percentage: number;
}
