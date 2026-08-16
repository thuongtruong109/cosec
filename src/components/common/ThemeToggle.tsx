import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  showDropdown?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ showDropdown = false, className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showDropdown) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
        className={`
          relative p-2 rounded-xl transition-all duration-200 cursor-pointer select-none
          bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200
          dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-white
          shadow-sm hover:shadow active:scale-95
          ${className}
        `}
      >
        <div className="relative w-4.5 h-4.5 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={16} className="text-indigo-400" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={16} className="text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    );
  }

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={14} className="text-amber-500" /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={14} className="text-indigo-400" /> },
    { value: 'system', label: 'System', icon: <Monitor size={14} className="text-slate-400 dark:text-zinc-400" /> },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer shadow-sm"
      >
        {theme === 'light' && <Sun size={14} className="text-amber-500 shrink-0" />}
        {theme === 'dark' && <Moon size={14} className="text-indigo-400 shrink-0" />}
        {theme === 'system' && <Monitor size={14} className="text-slate-500 dark:text-zinc-400 shrink-0" />}
        <span className="capitalize font-mono">{theme}</span>
        <ChevronDown size={13} className={`text-slate-400 dark:text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl p-1.5 z-50 text-xs font-mono"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                  theme === opt.value
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
