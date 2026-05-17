import React from 'react';
import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  key?: React.Key;
}

export default function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={clsx('animate-pulse bg-slate-200/50 rounded-xl', className)} />
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <LoadingSkeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
