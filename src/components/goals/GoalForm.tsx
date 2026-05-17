import React, { useState } from 'react';
import { X, Target, Calendar, BarChart, Plus, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Goal, GoalCategory } from '../../types';
import GlassCard from '../ui/GlassCard';

interface GoalFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Goal>) => Promise<void>;
}

const CATEGORIES: { value: GoalCategory; icon: string; color: string }[] = [
  { value: 'personal', icon: '👤', color: 'bg-blue-50 text-blue-600' },
  { value: 'fitness', icon: '💪', color: 'bg-rose-50 text-rose-600' },
  { value: 'career', icon: '💼', color: 'bg-indigo-50 text-indigo-600' },
  { value: 'learning', icon: '📚', color: 'bg-emerald-50 text-emerald-600' },
  { value: 'finance', icon: '💰', color: 'bg-amber-50 text-amber-600' },
  { value: 'health', icon: '🥗', color: 'bg-purple-50 text-purple-600' },
];

export default function GoalForm({ onClose, onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('personal');
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('%');
  const [deadline, setDeadline] = useState('');
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
        category,
        target_value: targetValue,
        current_value: 0,
        unit,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to set ambition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Goal</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Goal Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Save for a new laptop"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={clsx(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all border-2",
                    category === cat.value 
                      ? "border-indigo-600 bg-indigo-50" 
                      : "border-transparent bg-white/40 hover:bg-white/60"
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">{cat.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-20"
              placeholder="Why is this important?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                required
                className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="$, kg, %, books"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Ambition Set</span>}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
