import { Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '../../hooks/useProfile';

export default function TopNav() {
  const { user, displayName } = useProfile();
  const today = format(new Date(), 'MMMM do, yyyy').toUpperCase();

  return (
    <header className="h-40 px-10 flex items-center justify-between z-10">
      <div>
        <h2 className="text-[28px] font-black text-slate-900 tracking-tighter">Hi, {displayName}!</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{today}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search objectives..." 
            className="w-[320px] glass pl-12 pr-6 py-4 bg-white/40 border-white/60 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-white/50 transition-all placeholder:text-slate-400"
          />
        </div>
        
        <button className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3">
          <Plus size={18} />
          <span className="hidden sm:inline">Create New</span>
        </button>
        
        <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 ring-4 ring-white/60 overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase() || 'U'
          )}
        </div>
      </div>
    </header>
  );
}
