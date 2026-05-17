import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { CalendarEvent } from '../../types';
import GlassCard from '../ui/GlassCard';

interface CalendarFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<CalendarEvent>) => Promise<void>;
  initialDate?: Date;
}

export default function CalendarForm({ onClose, onSubmit, initialDate }: CalendarFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      
      await onSubmit({
        title,
        description,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
      onClose();
    } catch (error) {
      console.error(error);
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

        <h2 className="text-2xl font-bold text-slate-900 mb-6">New Calendar Event</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Event Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Team Sync"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description / Location</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Add details..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white/40 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Schedule Event</span>}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
