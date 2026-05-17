import React, { useState } from 'react';
import { X, Calendar, Flag, Repeat, Trash2, Loader2 } from 'lucide-react';
import { Task, Priority } from '../../types';
import GlassCard from '../ui/GlassCard';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
}

export default function TaskForm({ task, onClose, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">{task ? 'Edit Task' : 'New Task'}</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Task Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Complete project proposal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-24"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>{task ? 'Update' : 'Create'} Task</span>}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
