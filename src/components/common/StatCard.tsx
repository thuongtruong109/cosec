import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  iconBg = 'bg-indigo-500/10 border-indigo-500/20',
  iconColor = 'text-indigo-400',
  trend,
  onClick,
  className = '',
}: StatCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/90 shadow-sm relative overflow-hidden backdrop-blur-sm transition-all group ${
        onClick ? 'cursor-pointer hover:border-indigo-400/60 dark:hover:border-indigo-500/50 hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {value}
          </div>
          {subtext && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">{subtext}</p>
          )}
        </div>

        <div className={`p-2 rounded-lg border ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
        {trend ? (
          <div className="flex items-center space-x-1">
            <span
              className={
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'
              }
            >
              {trend.value}
            </span>
            <span className="text-slate-400 dark:text-zinc-500">vs benchmark</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-zinc-500">Metric breakdown</span>
        )}

        {onClick && (
          <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
            Details &rarr;
          </span>
        )}
      </div>
    </motion.div>
  );
}
