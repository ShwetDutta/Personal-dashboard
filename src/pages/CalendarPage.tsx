import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2, Calendar as CalendarIcon, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useCalendar } from '../hooks/useCalendar';
import CalendarForm from '../components/layout/CalendarForm';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { events, loading, addEvent, deleteEvent } = useCalendar();

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await deleteEvent(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateEvents = events.filter(e => isSameDay(new Date(e.start_time), selectedDate));

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-10 px-6">
      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col min-w-0 gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Temporal Mapping System • GMT-Sync</p>
          </div>
          <div className="flex items-center gap-3 bg-white/40 p-1.5 rounded-2xl border border-white">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-2 bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-xl shadow-sm border border-slate-100"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <GlassCard className="flex-1 p-3 rounded-[3rem] border-white/80 overflow-hidden flex flex-col shadow-2xl shadow-slate-200/50">
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDay = isToday(day);
              const currentMonth = isSameMonth(day, monthStart);

              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    "relative p-4 rounded-2xl transition-all cursor-pointer border group",
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl z-10" 
                      : currentMonth 
                        ? "bg-white/40 border-white/60 hover:bg-white hover:border-slate-200 text-slate-800" 
                        : "bg-slate-50/20 border-transparent text-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                      "text-sm font-black tracking-tighter",
                      isTodayDay && !isSelected && "text-indigo-600 underline underline-offset-4 decoration-2"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && !isSelected && (
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div 
                        key={idx} 
                        className={clsx(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-white/40" : "bg-slate-200 group-hover:bg-indigo-300"
                        )} 
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={clsx("text-[8px] font-black opacity-50", isSelected ? "text-white" : "text-slate-400")}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Side Panel: Selected Day Info */}
      <GlassCard className="w-full md:w-[400px] p-10 flex flex-col rounded-[3.5rem] border-white/80 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="mb-12 relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <CalendarIcon size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biological Calendar</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {format(selectedDate, 'EEEE')}
            <br />
            <span className="text-slate-400 font-medium text-2xl">{format(selectedDate, 'MMMM do')}</span>
          </h2>
        </div>

        <div className="flex-1 space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <Zap size={14} className="text-amber-500" />
                Active Allocations
              </h4>
              <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded-lg font-black">{selectedDateEvents.length} Tasks</span>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {selectedDateEvents.length > 0 ? selectedDateEvents.map((e) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={e.id} 
                    className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm space-y-4 group relative hover:border-indigo-100 transition-all border border-white"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-black text-slate-900 text-sm tracking-tight leading-snug">{e.title}</h5>
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className={clsx(
                          "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 text-[10px] font-black",
                          confirmDeleteId === e.id 
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-100" 
                            : "text-slate-200 hover:text-rose-500 hover:bg-rose-50"
                        )}
                      >
                        {confirmDeleteId === e.id ? 'X' : <Trash2 size={14} />}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <Clock size={12} className="text-indigo-400" />
                        {format(new Date(e.start_time), 'HH:mm')} — {format(new Date(e.end_time), 'HH:mm')}
                      </div>
                      {e.description && (
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <MapPin size={12} className="text-emerald-400" />
                          {e.description}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-20 flex flex-col items-center text-center px-4 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                      <CalendarIcon size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">No biological data points recorded for this date vector.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full mt-10 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.25em] text-[10px] rounded-[1.5rem] shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 active:scale-95 transition-all duration-500 hover:bg-slate-800"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Insert Record</span>
        </button>
      </GlassCard>

      {isFormOpen && (
        <CalendarForm 
          onClose={() => setIsFormOpen(false)}
          onSubmit={addEvent}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
