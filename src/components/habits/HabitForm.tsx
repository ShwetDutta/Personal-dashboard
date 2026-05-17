import React, { useState } from 'react';
import { X, Palette, Loader2 } from 'lucide-react';
import { Habit, HabitType } from '../../types';
import GlassCard from '../ui/GlassCard';

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Habit>) => Promise<void>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function HabitForm({ onClose, onSubmit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name,
        type,
        target_value: targetValue,
        unit: type === 'boolean' ? 'times' : unit,
        color,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start habit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg text-slate-400">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Habit</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Habit Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Read for 30 mins"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('boolean')}
                className={`py-2 px-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  type === 'boolean' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white/40 text-slate-500 hover:bg-white/60'
                }`}
              >
                Yes/No
              </button>
              <button
                type="button"
                onClick={() => setType('numeric')}
                className={`py-2 px-4 rounded-xl border-2 transition-all font-bold text-sm ${
                  type === 'numeric' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white/40 text-slate-500 hover:bg-white/60'
                }`}
              >
                Numeric
              </button>
            </div>
          </div>

          {type === 'numeric' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Daily Target</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="pages, glasses, mins"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Color Tag</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Start Habit</span>}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
