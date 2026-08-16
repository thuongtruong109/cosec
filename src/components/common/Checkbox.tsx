import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type CheckboxVariant = 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple';
export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  className?: string;
  error?: string;
  required?: boolean;
}

const variantStyles: Record<CheckboxVariant, { checked: string; borderFocus: string; ring: string }> = {
  indigo: {
    checked: 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/25',
    borderFocus: 'focus-visible:ring-indigo-500/30',
    ring: 'peer-focus-visible:ring-indigo-500/40',
  },
  emerald: {
    checked: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/25',
    borderFocus: 'focus-visible:ring-emerald-500/30',
    ring: 'peer-focus-visible:ring-emerald-500/40',
  },
  rose: {
    checked: 'bg-rose-600 border-rose-600 text-white shadow-rose-600/25',
    borderFocus: 'focus-visible:ring-rose-500/30',
    ring: 'peer-focus-visible:ring-rose-500/40',
  },
  amber: {
    checked: 'bg-amber-600 border-amber-600 text-white shadow-amber-600/25',
    borderFocus: 'focus-visible:ring-amber-500/30',
    ring: 'peer-focus-visible:ring-amber-500/40',
  },
  purple: {
    checked: 'bg-purple-600 border-purple-600 text-white shadow-purple-600/25',
    borderFocus: 'focus-visible:ring-purple-500/30',
    ring: 'peer-focus-visible:ring-purple-500/40',
  },
};

const sizeStyles: Record<CheckboxSize, { box: string; icon: number; text: string; subtext: string; padding: string }> = {
  sm: {
    box: 'w-4 h-4 rounded-md',
    icon: 11,
    text: 'text-xs',
    subtext: 'text-[10px]',
    padding: 'pt-0.5',
  },
  md: {
    box: 'w-5 h-5 rounded-lg',
    icon: 13,
    text: 'text-sm',
    subtext: 'text-xs',
    padding: 'pt-0.5',
  },
  lg: {
    box: 'w-6 h-6 rounded-lg',
    icon: 16,
    text: 'text-base',
    subtext: 'text-xs',
    padding: 'pt-1',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      name,
      checked = false,
      indeterminate = false,
      disabled = false,
      onChange,
      label,
      description,
      badge,
      variant = 'indigo',
      size = 'md',
      className = '',
      error,
      required = false,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const inputId = id || (name ? `checkbox-${name}` : undefined);
    const sizeConfig = sizeStyles[size];
    const variantConfig = variantStyles[variant];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (onChange) {
        onChange(e.target.checked, e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (onChange) {
          onChange(!checked, e as any);
        }
      }
    };

    const isCheckedOrIndeterminate = checked || indeterminate;

    return (
      <div className={`relative inline-flex flex-col ${className}`}>
        <label
          htmlFor={inputId}
          className={`group flex items-start space-x-3 select-none ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {/* Hidden Native Input */}
          <input
            ref={internalRef}
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            className="sr-only peer"
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-invalid={Boolean(error)}
          />

          {/* Custom Styled Box */}
          <div
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
            className={`
              relative shrink-0 flex items-center justify-center transition-all duration-200
              ${sizeConfig.box}
              border
              peer-focus-visible:ring-2 ${variantConfig.ring} peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-zinc-950 peer-focus-visible:ring-offset-white
              ${
                isCheckedOrIndeterminate
                  ? `${variantConfig.checked} shadow-sm`
                  : 'bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700/80 group-hover:border-slate-400 dark:group-hover:border-zinc-500 shadow-inner'
              }
              ${error ? 'border-rose-500 dark:border-rose-500 ring-rose-500/20' : ''}
            `}
          >
            <AnimatePresence mode="wait">
              {indeterminate ? (
                <motion.div
                  key="indeterminate"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center"
                >
                  <Minus size={sizeConfig.icon} strokeWidth={3.5} />
                </motion.div>
              ) : checked ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex items-center justify-center"
                >
                  <Check size={sizeConfig.icon} strokeWidth={3.2} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Label, Badge & Subtext */}
          {(label || description || badge) && (
            <div className={`flex-1 min-w-0 ${sizeConfig.padding}`}>
              <div className="flex items-center space-x-2">
                {label && (
                  <span
                    className={`font-medium ${sizeConfig.text} text-slate-800 dark:text-zinc-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors`}
                  >
                    {label}
                  </span>
                )}
                {badge && <div>{badge}</div>}
              </div>
              {description && (
                <p className={`${sizeConfig.subtext} text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5`}>
                  {description}
                </p>
              )}
            </div>
          )}
        </label>

        {/* Validation Error Message */}
        {error && (
          <p className="mt-1 text-[11px] text-rose-500 dark:text-rose-400 font-mono pl-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
