import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  Timer, 
  Target, 
  CalendarDays, 
  BookOpen, 
  BarChart2, 
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { clsx } from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Repeat, label: 'Habits', path: '/habits' },
  { icon: Timer, label: 'Focus', path: '/focus' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
];

function FocusBanner() {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const saved = localStorage.getItem('focus_timer');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          const remaining = Math.max(0, state.workSeconds - elapsed);
          
          if (remaining > 0) {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
          } else {
            setTimeLeft(null);
          }
        } catch (e) {
          setTimeLeft(null);
        }
      } else {
        setTimeLeft(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="mx-4 mb-8">
      <div className="bg-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-100 flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
          <Zap size={14} fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-1">Focus Active</p>
          <p className="text-sm font-black text-white tabular-nums tracking-tight">{timeLeft} remaining</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { signOut } = useAuth();
  const { user, displayName } = useProfile();

  return (
    <aside className="w-[280px] p-6 hidden md:flex flex-col h-screen sticky top-0 z-40">
      <div className="glass h-full rounded-[2.5rem] flex flex-col overflow-hidden">
        <div className="p-8">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Sparkles size={20} />
          </div>
        </div>

        <FocusBanner />

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-xl"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="glass bg-white/40 border-white/40 p-4 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm text-indigo-700 font-bold uppercase overflow-hidden shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate mb-1">
                  {user?.email}
                </p>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-all"
                >
                   <LogOut size={10} />
                   ← SIGN OUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
