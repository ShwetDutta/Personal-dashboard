import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, User, Mail, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { username },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        // Profile creation is handled by ensureProfile in useAuth hook on next mount
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f0f0f8] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(150,150,240,0.4)_0%,transparent_70%)] blur-[60px]" />
      <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(180,180,255,0.3)_0%,transparent_70%)] blur-[50px]" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(200,210,255,0.2)_0%,transparent_70%)] blur-[40px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'circOut' }}
        className="w-full max-w-[420px] p-10 bg-white/72 backdrop-blur-[24px] border border-white/90 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] relative z-10"
      >
        <div className="flex flex-col items-center mb-7">
          <div className="w-[52px] h-[52px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.3)] mb-5">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-[22px] font-black text-slate-900 text-center mb-1 leading-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-[13px] text-slate-400 text-center font-medium">
            {isLogin ? 'Sign in to your dashboard' : 'Start tracking your day'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.06em] block ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/80 border-[1.5px] border-slate-200/60 rounded-xl text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                    placeholder="Enter username"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.06em] block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-white/80 border-[1.5px] border-slate-200/60 rounded-xl text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-[0.06em] block ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-white/80 border-[1.5px] border-slate-200/60 rounded-xl text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[13px] text-rose-600 font-medium"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 mt-2 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] active:translate-y-0",
              loading && "opacity-80"
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <span>{isLogin ? 'Sign In →' : 'Create Account →'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[13px] text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-bold hover:underline ml-1"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
