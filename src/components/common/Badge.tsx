import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Bug,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export type BadgeVariant = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'info' 
  | 'success' 
  | 'open' 
  | 'fixed' 
  | 'ignored' 
  | 'indigo' 
  | 'purple'
  | 'zinc';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: boolean | React.ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'zinc',
  size = 'sm',
  icon = false,
  className = '',
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; defaultIcon?: React.ReactNode }> = {
    critical: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      defaultIcon: <ShieldAlert size={12} className="shrink-0 text-rose-400" />,
    },
    high: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      defaultIcon: <AlertTriangle size={12} className="shrink-0 text-amber-400" />,
    },
    medium: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      defaultIcon: <AlertTriangle size={12} className="shrink-0 text-yellow-400" />,
    },
    low: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      defaultIcon: <Info size={12} className="shrink-0 text-blue-400" />,
    },
    info: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      defaultIcon: <Info size={12} className="shrink-0 text-sky-400" />,
    },
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      defaultIcon: <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />,
    },
    open: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      defaultIcon: <AlertTriangle size={12} className="shrink-0 text-rose-400" />,
    },
    fixed: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      defaultIcon: <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />,
    },
    ignored: {
      bg: 'bg-zinc-800/80',
      text: 'text-zinc-400',
      border: 'border-zinc-700/60',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      defaultIcon: <Sparkles size={12} className="shrink-0 text-indigo-400" />,
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    zinc: {
      bg: 'bg-zinc-800/60',
      text: 'text-zinc-300',
      border: 'border-zinc-700/60',
    },
  };

  const current = variantStyles[variant] || variantStyles.zinc;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }[size];

  const renderIcon = () => {
    if (typeof icon === 'boolean') {
      return icon ? current.defaultIcon : null;
    }
    return icon;
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-md font-mono font-semibold uppercase tracking-wider border shadow-sm ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
}
