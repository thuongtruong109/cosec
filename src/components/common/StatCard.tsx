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
      className={`p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-lg relative overflow-hidden backdrop-blur-sm transition-colors ${
        onClick ? 'cursor-pointer hover:border-zinc-700' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {value}
          </div>
          {subtext && (
            <p className="text-[11px] text-zinc-400 font-medium">{subtext}</p>
          )}
        </div>

        <div className={`p-2.5 rounded-xl border ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center space-x-1.5 text-[10px] font-mono">
          <span
            className={
              trend.isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
            }
          >
            {trend.value}
          </span>
          <span className="text-zinc-500">vs benchmark</span>
        </div>
      )}
    </motion.div>
  );
}
