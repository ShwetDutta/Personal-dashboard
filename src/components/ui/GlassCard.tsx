import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  key?: React.Key;
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        'glass rounded-3xl transition-all duration-300',
        onClick && 'cursor-pointer hover:bg-white/60 active:scale-[0.99] hover:shadow-2xl hover:shadow-slate-300/50',
        className
      )}
    >
      {children}
    </div>
  );
}
