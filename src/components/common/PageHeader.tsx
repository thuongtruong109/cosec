import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800/80 ${className}`}
    >
      <div className="flex items-start sm:items-center space-x-3.5">
        {icon && (
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">{subtitle}</p>}
        </div>
      </div>

      {actions && (
        <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
