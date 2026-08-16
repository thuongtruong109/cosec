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
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture', icon: GitFork },
    { id: 'dependencies', label: 'Dependencies', icon: Package },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'refactor', label: 'Refactor', icon: Zap },
    { id: 'tests', label: 'Test Gen', icon: TestTube },
    { id: 'report', label: 'Executive Report', icon: FileText },
  ];

  return (
    <aside className={`bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between select-none shrink-0 transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      <div className="p-2.5 space-y-3 overflow-y-auto">
        {/* Toggle & Active Project Box */}
        <div className="relative">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                  Active Project
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              <div className="font-semibold text-zinc-100 text-xs truncate">
                {project ? project.name : 'No project'}
              </div>
              <div className="flex items-center space-x-1.5 mt-1.5 text-[10px] text-zinc-400 font-mono">
                <span>{project ? `${project.files.length} Files` : '0 Files'}</span>
                <span>•</span>
                <span>{project ? `${project.totalLines.toLocaleString()} Lines` : '0 Lines'}</span>
              </div>

              {project && project.languages.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center space-x-1">
                  {project.languages.map((lang) => (
                    <div
                      key={lang.name}
                      className="h-1 rounded-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
              <div
                className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center cursor-pointer"
                title={project ? project.name : 'Active Project'}
              >
                <FolderGit2 size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Navigation
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
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-1.5'} rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon size={16} className={isActive ? 'text-indigo-400 shrink-0' : 'text-zinc-500 shrink-0'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Upload & Settings Quick Nav */}
      <div className="p-2.5 border-t border-zinc-800/80 space-y-1.5">
        <button
          onClick={() => onNavigate('upload')}
          title={isCollapsed ? 'Import Codebase' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-start space-x-2 py-1.5 px-2.5'} rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors`}
        >
          <Upload size={14} className="text-indigo-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Import Code</span>}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-start space-x-2 py-1.5 px-2.5'} rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors`}
        >
          <Settings size={14} className="text-zinc-500 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}

