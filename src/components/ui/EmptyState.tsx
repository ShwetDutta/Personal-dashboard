import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="p-4 bg-indigo-50/50 rounded-2xl text-indigo-300">
        {icon}
      </div>
      <div className="max-w-xs space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
