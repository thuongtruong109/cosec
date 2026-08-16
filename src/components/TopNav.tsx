import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  ChevronDown, 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  Sliders,
  X,
  Upload,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, AnalysisResult } from '../types';
import ThemeToggle from './common/ThemeToggle';

interface TopNavProps {
  project: Project | null;
  analysis: AnalysisResult | null;
  onSelectProject: (p: Project) => void;
  onNavigate: (view: string) => void;
  onSearchSelectFile?: (filePath: string, line?: number) => void;
}

export default function TopNav({
  project,
  analysis,
  onSelectProject,
  onNavigate,
  onSearchSelectFile,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (projRef.current && !projRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filter issues and files based on search input
  const searchFileResults = project?.files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  const searchIssueResults = analysis?.issues.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.file.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  return (
    <header className="h-14 border-b border-slate-200/90 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none transition-colors duration-150">
      {/* Brand & Project Selector */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 group-hover:scale-105 transition-all shadow-md shadow-indigo-600/10">
            <Shield className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight font-sans">
                Colens
              </span>
              <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-indigo-500/30 font-mono">
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Project Selector Dropdown */}
        <div className="relative" ref={projRef}>
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 transition-all cursor-pointer shadow-sm"
          >
            <FolderGit2 size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="max-w-[150px] sm:max-w-[200px] truncate font-mono">
              {project ? project.name : 'No project loaded'}
            </span>
            <ChevronDown
              size={13}
              className={`text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${
                showProjectDropdown ? 'rotate-180 text-indigo-500 dark:text-indigo-400' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showProjectDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs text-slate-700 dark:text-zinc-300 divide-y divide-slate-100 dark:divide-zinc-800/80"
              >
                <div className="pb-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-mono mb-1">
                    Current Active Project
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {project ? project.name : 'None selected'}
                    </div>
                    {project && (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                        {project.files.length} files • {project.totalLines.toLocaleString()} lines
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowProjectDropdown(false);
                      onNavigate('upload');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-between transition-colors shadow-md cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus size={14} />
                      <span>Import New Codebase</span>
                    </span>
                    <Upload size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative hidden md:block w-80 lg:w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files, issues, or functions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchDropdown(searchQuery.trim().length > 0)}
            className="w-full bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Global Search Dropdown */}
        <AnimatePresence>
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800"
            >
              {searchIssueResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/80 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    Matched Issues ({searchIssueResults.length})
                  </div>
                  {searchIssueResults.map((iss) => (
                    <div
                      key={iss.id}
                      onClick={() => {
                        if (onSearchSelectFile) onSearchSelectFile(iss.file, iss.line);
                        onNavigate('explorer');
                        setShowSearchDropdown(false);
                      }}
                      className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800/70 cursor-pointer border-b border-slate-100 dark:border-zinc-800/40 flex items-start space-x-2.5 transition-colors"
                    >
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-slate-800 dark:text-zinc-200 font-semibold truncate">{iss.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                          {iss.file}:{iss.line}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchFileResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/80 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    Matched Code Files ({searchFileResults.length})
                  </div>
                  {searchFileResults.map((f) => (
                    <div
                      key={f.path}
                      onClick={() => {
                        if (onSearchSelectFile) onSearchSelectFile(f.path);
                        onNavigate('explorer');
                        setShowSearchDropdown(false);
                      }}
                      className="p-3 hover:bg-slate-100 dark:hover:bg-zinc-800/70 cursor-pointer border-b border-slate-100 dark:border-zinc-800/40 flex items-center space-x-2.5 transition-colors"
                    >
                      <FileCode size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <div className="text-xs text-slate-700 dark:text-zinc-300 font-mono truncate">{f.path}</div>
                    </div>
                  ))}
                </div>
              )}

              {searchFileResults.length === 0 && searchIssueResults.length === 0 && (
                <div className="p-5 text-center text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  No matching files or issues found.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* API Key Connected Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium font-mono shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>Gemini AI</span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {analysis && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-700/80 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-zinc-100"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Live Engine Events
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>
                {analysis ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-start space-x-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-zinc-200">
                          Scan Completed ({project?.name})
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Identified {analysis.issues.length} findings. Repository health score: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{analysis.scores.overall}/100</span>.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center font-mono">
                    No notifications. Upload a project to begin analysis.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Settings"
          aria-label="Settings"
        >
          <Sliders size={16} />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-indigo-400/40 shadow-sm cursor-pointer">
          AI
        </div>
      </div>
    </header>
  );
}

