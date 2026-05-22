import React, { useRef, useEffect } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfYear } from 'date-fns';
import GlassCard from '../ui/GlassCard';
import { motion } from 'motion/react';

interface HabitHeatmapProps {
  data: Record<string, number>;
}

export default function HabitHeatmap({ data }: HabitHeatmapProps) {
  const today = new Date();
  
  // Start of calendar grid: Sunday of the week containing January 1st of the current year.
  const yearStart = startOfYear(today);
  const startDate = startOfWeek(yearStart, { weekStartsOn: 0 }); // Align to Sunday
  
  // End of calendar grid: Saturday of the week containing today.
  const endDate = endOfWeek(today, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalWeeks = Math.ceil(days.length / 7);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Direct instant scroll to the far right to focus on the latest days
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [days.length]);

  const getCellColor = (score: number): string => {
    if (score === 0) return '#f3f4f6';        // empty — light grey
    if (score <= 25) return '#c7d2fe';       // 1-25% — lightest indigo
    if (score <= 50) return '#818cf8';       // 26-50% — light indigo
    if (score <= 75) return '#6366f1';       // 51-75% — indigo
    return '#4338ca';                        // 76-100% — darkest indigo
  };

  return (
    <GlassCard className="p-10 rounded-[3rem] border-white/80 transition-all hover:bg-white group">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             Habit Consistency
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1 ml-5">Your progress this year</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest animate-fade-in-down">
          <span>Incomplete</span>
          <div className="flex gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-[#f3f4f6] border border-slate-100" />
            <div className="w-3.5 h-3.5 rounded-md bg-[#c7d2fe]" />
            <div className="w-3.5 h-3.5 rounded-md bg-[#818cf8]" />
            <div className="w-3.5 h-3.5 rounded-md bg-[#6366f1]" />
            <div className="w-3.5 h-3.5 rounded-md bg-[#4338ca]" />
          </div>
          <span>100% Correct</span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200"
      >
        <div className="flex gap-2 min-w-max">
          {/* We group days into weeks for the grid */}
          {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = days[weekIndex * 7 + dayIndex];
                if (!day || day > today) return <div key={dayIndex} className="w-4 h-4" />;
                
                const dateStr = format(day, 'yyyy-MM-dd');
                const score = data[dateStr] || 0;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.4, zIndex: 10 }}
                    transition={{ duration: 0.5, delay: (weekIndex * 0.005) }}
                    key={dayIndex}
                    title={`${format(day, 'd MMMM yyyy')} — ${Math.round(score)}% consistency`}
                    style={{ backgroundColor: getCellColor(score) }}
                    className="w-4 h-4 rounded-md transition-colors cursor-help border border-white/40 shadow-sm"
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 min-w-max mt-8 relative select-none h-4">
          {Array.from({ length: totalWeeks }).map((_, weekIndex) => {
            const firstDayOfWeek = days[weekIndex * 7];
            if (!firstDayOfWeek) return <div key={weekIndex} className="w-4" />;
            
            // Determine month label by checking the mid-week day (index 4)
            const midDayOfWeek = days[weekIndex * 7 + 4] || firstDayOfWeek;
            const currentMonth = format(midDayOfWeek, 'MMM');
            
            let showLabel = false;
            if (weekIndex === 0) {
              showLabel = true;
            } else {
              const prevMidDay = days[(weekIndex - 1) * 7 + 4] || days[(weekIndex - 1) * 7];
              if (prevMidDay && format(prevMidDay, 'MMM') !== currentMonth) {
                showLabel = true;
              }
            }
            
            return (
              <div key={weekIndex} className="w-4 relative text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {showLabel && (
                  <span className="absolute left-0 top-0 whitespace-nowrap">
                    {currentMonth}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
