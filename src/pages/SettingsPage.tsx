import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/ui/GlassCard';
import { User, Shield, Bell, Monitor, Database, LogOut, Camera, Save, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { username }
    });
    setLoading(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
            System Control
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-5">Configuration & Identity • Active Session Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <nav className="flex flex-col gap-3 sticky top-10">
            {[
              { label: 'Intelligence Profile', icon: User, active: true },
              { label: 'Security Protocols', icon: Shield },
              { label: 'Alert Feedback', icon: Bell },
              { label: 'Visual Interface', icon: Monitor },
              { label: 'Data Warehouse', icon: Database }
            ].map((nav, i) => (
              <button 
                key={i}
                className={clsx(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] transition-all duration-500",
                  nav.active 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-2" 
                    : "text-slate-400 hover:bg-white hover:text-slate-900 shadow-sm"
                )}
              >
                <nav.icon size={16} />
                <span>{nav.label}</span>
              </button>
            ))}
            <div className="mt-8 border-t border-slate-100 pt-8">
               <button 
                onClick={signOut}
                className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all active:scale-95 border border-transparent hover:border-rose-100"
              >
                <LogOut size={16} />
                <span>Terminate Session</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-12">
          <GlassCard className="p-12 rounded-[3.5rem] border-white/80">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-12 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
              Cognitive Identity
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-10">
              <div className="flex items-center gap-10 bg-slate-50/50 p-8 rounded-[2.5rem] border border-white">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-[2.5rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 overflow-hidden shadow-inner group-hover:border-slate-400 transition-all duration-500">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : <User size={48} />}
                   </div>
                   <button type="button" className="absolute -bottom-2 -right-2 w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all border-4 border-white">
                      <Camera size={20} />
                   </button>
                </div>
                <div className="space-y-2">
                   <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">Avatar Decoupling</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs">Upload your biological identifier. JPG, max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Username Alias</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-8 py-5 bg-white/40 border border-white rounded-[1.75rem] focus:outline-none focus:bg-white focus:shadow-xl focus:shadow-indigo-50 focus:border-indigo-100 transition-all font-black text-slate-900 text-lg tracking-tight placeholder:text-slate-200"
                    placeholder="Enter Alias..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Neural Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.75rem] text-slate-400 font-black text-lg tracking-tight cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "px-10 py-5 rounded-2xl font-black uppercase tracking-[0.22em] text-[10px] transition-all duration-500 flex items-center gap-3 active:scale-95 shadow-2xl",
                    saved ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                  )}
                >
                  {loading ? <Save className="animate-spin" size={20} /> : saved ? <Check size={20} /> : <Save size={18} strokeWidth={3} />}
                  <span>{saved ? 'Matrix Updated' : 'Push Configuration'}</span>
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-12 rounded-[3.5rem] border-white/80 transition-all duration-700 hover:bg-white group">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10 flex items-center gap-3">
               <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
               Level Allocation
            </h3>
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-700">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 pointer-events-none" />
               <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
               
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <span className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase border border-white/10">Base Tier</span>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Ready</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-4xl font-black tracking-tighter leading-none">$0</span>
                     <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">Per Lunar Cycle</p>
                  </div>
               </div>

               <div className="space-y-6 mb-10 relative z-10">
                  <h4 className="text-2xl font-black tracking-tight tracking-tight">Biological Survival Unit</h4>
                  <p className="text-sm font-medium text-white/50 leading-relaxed max-w-sm">
                    You are utilizing the baseline architecture. Master your current capabilities before requesting neural expansion.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     {['Standard Tracking', 'Weekly Analytics', 'Limited Storage', 'Base Security'].map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                           <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400">
                             <Check size={12} />
                           </div>
                           <span className="text-[10px] font-black uppercase text-white/70 tracking-widest leading-none">{feat}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <button className="w-full py-6 bg-white text-slate-900 font-black rounded-[1.75rem] hover:bg-slate-50 transition-all uppercase tracking-[0.3em] text-[10px] relative z-10 shadow-2xl">
                  Neural Expansion (Upgrade)
               </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
