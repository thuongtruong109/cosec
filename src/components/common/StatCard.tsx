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
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/90 shadow-sm dark:shadow-lg relative overflow-hidden backdrop-blur-sm transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          {subtext && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{subtext}</p>
          )}
        </div>

        <div className={`p-2.5 rounded-xl border ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center space-x-1.5 text-[10px] font-mono">
          <span
            className={
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'
            }
          >
            {trend.value}
          </span>
          <span className="text-slate-400 dark:text-zinc-500">vs benchmark</span>
        </div>
      )}
    </motion.div>
  );
}
