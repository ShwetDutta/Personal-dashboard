import React, { useState, useEffect } from 'react';
import { useJournal } from '../hooks/useJournal';
import GlassCard from '../components/ui/GlassCard';
import { BookOpen, Search, Plus, Pin, Trash2, Calendar, ChevronRight, Hash, Edit3, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function JournalPage() {
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Local state for editing
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const selectedEntry = entries.find(e => e.id === selectedId);

  useEffect(() => {
    if (entries.length > 0 && !selectedId) {
       setSelectedId(entries[0].id);
    }
  }, [entries]);

  useEffect(() => {
    if (selectedEntry && isEditing) {
      setEditTitle(selectedEntry.title);
      setEditContent(selectedEntry.content);
    }
  }, [selectedId, isEditing]);

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = async () => {
    const newEntry = await addEntry({ title: 'New Reflection', content: '' });
    if (newEntry) {
      setSelectedId(newEntry.id);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (selectedId) {
      await updateEntry(selectedId, { title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      if (confirmDeleteId === selectedId) {
        await deleteEntry(selectedId);
        setSelectedId(null);
        setIsEditing(false);
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(selectedId);
        setTimeout(() => setConfirmDeleteId(null), 3000);
      }
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-12rem)] flex gap-10 px-6">
      {/* Sidebar: Entry List */}
      <div className="w-96 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
            Archive
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Temporal Logs • {entries.length} reflections</p>
        </div>

        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patterns..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/40 border border-white/80 rounded-2xl text-sm font-bold tracking-tight focus:outline-none focus:bg-white transition-all shadow-sm"
          />
        </div>

        <GlassCard className="flex-1 overflow-hidden flex flex-col p-3 rounded-[2.5rem] border-white/80">
          <div className="overflow-auto flex-1 space-y-2 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => (
                <motion.button
                  layout
                  key={entry.id}
                  onClick={() => { setSelectedId(entry.id); setIsEditing(false); }}
                  className={clsx(
                    "w-full text-left p-5 rounded-2xl transition-all relative group overflow-hidden border",
                    selectedId === entry.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                      : "hover:bg-white border-transparent hover:border-slate-100"
                  )}
                >
                  {selectedId === entry.id && (
                     <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" 
                     />
                  )}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <h3 className={clsx("font-black tracking-tight text-sm flex-1 truncate", selectedId === entry.id ? "text-white" : "text-slate-800")}>
                      {entry.title || 'Recursive Thought'}
                    </h3>
                    {entry.pinned && <Pin size={12} className={clsx(selectedId === entry.id ? "text-white" : "text-indigo-400")} fill="currentColor" />}
                  </div>
                  <p className={clsx("text-xs line-clamp-1 opacity-70 relative z-10 leading-relaxed font-medium", selectedId === entry.id ? "text-slate-300" : "text-slate-500")}>
                    {entry.content || 'Awaiting synchronization...'}
                  </p>
                  <div className="flex items-center justify-between mt-4 relative z-10">
                    <span className={clsx("text-[9px] font-black uppercase tracking-[0.2em]", selectedId === entry.id ? "text-slate-400" : "text-slate-400")}>
                      {format(new Date(entry.created_at), 'MMMM d, yyyy')}
                    </span>
                    <ChevronRight size={14} className={clsx("transition-transform group-hover:translate-x-1", selectedId === entry.id ? "text-white" : "text-slate-200")} />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleCreateNew}
            className="mt-4 w-full flex items-center justify-center gap-3 py-5 bg-slate-50 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-500 active:scale-95 shadow-sm"
          >
            <Plus size={18} strokeWidth={3} />
            <span>New Record</span>
          </button>
        </GlassCard>
      </div>

      {/* Main Panel: Editor */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden relative rounded-[3rem] border-white/80 shadow-2xl shadow-slate-200/50">
        {selectedEntry ? (
          <>
            <div className="px-12 py-10 border-b border-white flex items-center justify-between bg-white/40">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                       TS-{format(new Date(selectedEntry.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <button 
                    onClick={() => updateEntry(selectedEntry.id, { pinned: !selectedEntry.pinned })}
                    className={clsx("transition-all active:scale-90 p-2 rounded-xl border border-white", selectedEntry.pinned ? "text-indigo-600 bg-indigo-50 border-indigo-100" : "text-slate-300 hover:text-slate-400 hover:bg-white")}
                  >
                    <Pin size={18} fill={selectedEntry.pinned ? "currentColor" : "none"} />
                  </button>
                </div>
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-4xl font-black text-slate-900 bg-transparent border-none focus:outline-none w-full tracking-tight placeholder:text-slate-200"
                    placeholder="Vector Identifier..."
                    autoFocus
                  />
                ) : (
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedEntry.title}</h2>
                )}
              </div>

              <div className="flex items-center gap-3 ml-8">
                <button 
                   onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                   className={clsx(
                     "px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl active:scale-95",
                     isEditing 
                      ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" 
                      : "bg-white text-slate-900 border border-slate-100 hover:bg-slate-50"
                   )}
                >
                   {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Modify Record</>}
                </button>
                <button 
                  onClick={handleDelete}
                  className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-xl active:scale-95 group",
                    confirmDeleteId === selectedId 
                      ? "bg-rose-600 text-white shadow-rose-200" 
                      : "bg-white text-slate-300 hover:text-rose-600 border border-slate-100 hover:bg-rose-50"
                  )}
                >
                  {confirmDeleteId === selectedId ? <span className="text-[10px] font-black">X</span> : <Trash2 size={20} />}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-16 custom-scrollbar relative">
               <div className="max-w-4xl mx-auto h-full">
                  {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full bg-transparent border-none focus:outline-none text-slate-800 leading-relaxed text-xl resize-none placeholder:text-slate-200 font-medium font-serif"
                        placeholder="Neural dump starting... Record the session state."
                      />
                  ) : (
                      <div className="prose prose-slate max-w-none prose-lg">
                        <p className="text-xl text-slate-700 leading-[1.8] whitespace-pre-wrap font-serif">
                            {selectedEntry.content || (
                              <span className="text-slate-200 italic font-sans font-black uppercase tracking-[0.2em] text-sm">Synthetic background noise detected. No data payload found.</span>
                            )}
                        </p>
                      </div>
                  )}
               </div>
            </div>

            <div className="px-12 py-10 border-t border-white flex items-center gap-8 bg-white/10">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <Hash size={16} className="text-slate-400" />
                  </div>
                  <div className="flex gap-2">
                     {selectedEntry.tags?.map((t, i) => (
                       <span key={i} className="px-5 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {t}
                       </span>
                     ))}
                     <button className="px-5 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 hover:border-slate-400 transition-all">+ Associate Tag</button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] mb-8 flex items-center justify-center text-slate-200 shadow-inner">
                <BookOpen size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Library of Babel</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 mb-10 max-w-xs leading-loose">Choose a reflection to analyze your behavioral evolution.</p>
              <button
                onClick={handleCreateNew}
                className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95"
              >
                Start New Record
              </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
