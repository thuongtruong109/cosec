import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  searchable = false,
  disabled = false,
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable && search.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  const sizeClasses = {
    sm: 'py-1.5 px-2.5 text-xs',
    md: 'py-2 px-3.5 text-xs',
    lg: 'py-2.5 px-4 text-sm',
  }[size];

  return (
    <div className={`relative select-none ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl bg-zinc-950/90 border transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
            : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses}`}
      >
        <div className="flex items-center space-x-2 truncate pr-2">
          {selectedOption?.icon && (
            <span className="shrink-0 text-zinc-400">{selectedOption.icon}</span>
          )}
          <span className={`truncate font-medium ${selectedOption ? 'text-zinc-200' : 'text-zinc-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                selectedOption.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 mt-1.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 flex flex-col divide-y divide-zinc-800/80"
          >
            {searchable && (
              <div className="p-2 bg-zinc-950/70">
                <div className="relative flex items-center">
                  <Search size={12} className="absolute left-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search options..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto p-1 space-y-0.5 max-h-56">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="truncate text-left">
                          <div className="truncate">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-[10px] text-zinc-500 font-mono truncate">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        {opt.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                              opt.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-indigo-400" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-zinc-500 font-mono">
                  No matching options
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
