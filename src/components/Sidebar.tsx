import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileCode, 
  AlertTriangle, 
  ShieldCheck, 
  GitFork, 
  Package, 
  MessageSquare, 
  Zap, 
  TestTube, 
  FileText,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderGit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, AnalysisResult } from '../types';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  project: Project | null;
  analysis: AnalysisResult | null;
}

export default function Sidebar({
  activeView,
  onNavigate,
  project,
  analysis,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'explorer', label: 'Code Explorer', icon: FileCode },
    { 
      id: 'issues', 
      label: 'Issues', 
      icon: AlertTriangle, 
      badge: analysis ? analysis.issues.length : null,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    { id: 'security', label: 'Security & OWASP', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture', icon: GitFork },
    { id: 'dependencies', label: 'Dependencies', icon: Package },
    { id: 'chat', label: 'AI Chat Advisor', icon: MessageSquare },
    { id: 'refactor', label: 'Refactor', icon: Zap },
    { id: 'tests', label: 'Test Gen', icon: TestTube },
    { id: 'report', label: 'Executive Report', icon: FileText },
  ];

  return (
    <aside
      className={`sticky top-14 h-[calc(100vh-3.5rem)] bg-white/95 dark:bg-zinc-950 border-r border-slate-200/90 dark:border-zinc-800/80 flex flex-col justify-between select-none shrink-0 z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {/* Active Project Box */}
        <div className="relative">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 shadow-sm relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Active Project
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              <div className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate font-sans">
                {project ? project.name : 'No project loaded'}
              </div>
              <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                <span>{project ? `${project.files.length} Files` : '0 Files'}</span>
                <span>•</span>
                <span>{project ? `${project.totalLines.toLocaleString()} Lines` : '0 Lines'}</span>
              </div>

              {project && project.languages && project.languages.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 gap-0.5">
                    {project.languages.map((lang) => (
                      <div
                        key={lang.name}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                        title={`${lang.name}: ${lang.percentage}%`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 transition-all cursor-pointer shadow-sm"
                title="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
              <div
                onClick={() => onNavigate('dashboard')}
                className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-600/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-600/25 transition-all shadow-sm"
                title={project ? `${project.name} (${project.files.length} files)` : 'Active Project'}
              >
                <FolderGit2 size={18} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider font-mono">
              Workspace
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                } rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer relative group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Upload & Settings Quick Nav */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 space-y-1.5 bg-slate-50/50 dark:bg-zinc-950/80 backdrop-blur-sm">
        <button
          onClick={() => onNavigate('upload')}
          title={isCollapsed ? 'Import Codebase' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-start space-x-2.5 py-2 px-3'
          } rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm`}
        >
          <Upload size={15} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Import Repo / Zip</span>}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-start space-x-2.5 py-2 px-3'
          } rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/60 text-xs font-medium transition-colors cursor-pointer`}
        >
          <Settings size={15} className="text-slate-400 dark:text-zinc-400 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
