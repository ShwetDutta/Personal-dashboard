import React from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { DailyHabitSummary } from '../../types';
import GlassCard from '../ui/GlassCard';
import { motion } from 'motion/react';

interface HabitHeatmapProps {
  data: DailyHabitSummary[];
}

export default function HabitHeatmap({ data }: HabitHeatmapProps) {
  const today = new Date();
  const startDate = subDays(today, 364); // Last year
  const days = eachDayOfInterval({ start: startDate, end: today });

  // Map dates to completion data
  const dataMap = new Map(data.map(d => [d.date, d.completion_rate]));

  const getIntensity = (rate: number | undefined) => {
    if (rate === undefined || rate === 0) return 'bg-slate-50';
    if (rate < 0.25) return 'bg-indigo-100';
    if (rate < 0.5) return 'bg-indigo-300';
    if (rate < 0.75) return 'bg-indigo-500 shadow-sm shadow-indigo-100';
    return 'bg-indigo-700 shadow-md shadow-indigo-200';
  };

  return (
    <GlassCard className="p-10 overflow-x-auto rounded-[3rem] border-white/80 transition-all hover:bg-white group">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             Habit Consistency
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1 ml-5">Your progress over the last year</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <span>Incomplete</span>
          <div className="flex gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-100" />
            <div className="w-3.5 h-3.5 rounded-md bg-indigo-100" />
            <div className="w-3.5 h-3.5 rounded-md bg-indigo-300" />
            <div className="w-3.5 h-3.5 rounded-md bg-indigo-500" />
            <div className="w-3.5 h-3.5 rounded-md bg-indigo-700" />
          </div>
          <span>100% Correct</span>
        </div>
      </div>

      <div className="flex gap-2 min-w-max">
        {/* We group days into weeks for the grid */}
        {Array.from({ length: 53 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const day = days[weekIndex * 7 + dayIndex];
              if (!day || day > today) return <div key={dayIndex} className="w-4 h-4" />;
              
              const dateStr = format(day, 'yyyy-MM-dd');
              const rate = dataMap.get(dateStr) || 0;
              
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.4, zIndex: 10 }}
                  transition={{ duration: 0.5, delay: (weekIndex * 0.01) }}
                  key={dayIndex}
                  title={`${format(day, 'd MMMM yyyy')} — ${Math.round(rate * 100)}% habits completed`}
                  className={`w-4 h-4 rounded-md ${getIntensity(rate)} transition-colors cursor-help border border-white/40 shadow-sm`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] px-2 opacity-50">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </GlassCard>
  );
}
