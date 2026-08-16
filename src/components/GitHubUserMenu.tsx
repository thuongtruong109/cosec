import React, { useState, useRef, useEffect } from 'react';
import { Github, ChevronDown, ExternalLink, LogOut, FolderGit2, Sparkles, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGitHub } from '../context/GitHubContext';
import GitHubAuthModal from './GitHubAuthModal';

interface GitHubUserMenuProps {
  onOpenRepoSelect?: () => void;
  compact?: boolean;
}

export default function GitHubUserMenu({ onOpenRepoSelect, compact = false }: GitHubUserMenuProps) {
  const { user, isAuthenticated, logout, isLoading } = useGitHub();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {isAuthenticated && user ? (
        <>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-all cursor-pointer shadow-sm hover:shadow group"
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-5 h-5 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
            />
            {!compact && (
              <span className="font-mono text-xs font-semibold truncate max-w-[100px] sm:max-w-[120px]">
                @{user.login}
              </span>
            )}
            <ChevronDown
              size={12}
              className={`text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 text-xs text-slate-700 dark:text-zinc-300 divide-y divide-slate-100 dark:divide-zinc-800"
              >
                <div className="pb-2.5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-9 h-9 rounded-xl ring-2 ring-indigo-500/20 object-cover"
                    />
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {user.name || user.login}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                        @{user.login}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  {onOpenRepoSelect && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenRepoSelect();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <FolderGit2 size={14} className="text-indigo-500" />
                      <span>Browse Repositories</span>
                    </button>
                  )}

                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>View GitHub Profile</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Disconnect Account</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="group relative inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-950 text-xs font-semibold tracking-tight transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer border border-transparent dark:border-zinc-200/20"
        >
          <Github size={14} className="transition-transform group-hover:scale-110" />
          <span>Connect GitHub</span>
        </button>
      )}

      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          if (onOpenRepoSelect) onOpenRepoSelect();
        }}
      />
    </div>
  );
}
