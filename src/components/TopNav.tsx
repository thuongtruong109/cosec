import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { Project, AnalysisResult } from '../types';

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

  // Filter issues and files based on search input
  const searchFileResults = project?.files.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  const searchIssueResults = analysis?.issues.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.file.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) || [];

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Project Selector */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-all shadow-sm">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight font-sans">
                CodeLens
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono">
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
          >
            <FolderGit2 size={14} className="text-indigo-400" />
            <span className="max-w-[140px] truncate font-mono">
              {project ? project.name : 'No project loaded'}
            </span>
            <ChevronDown size={14} className="text-zinc-500" />
          </button>

          {showProjectDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-zinc-300 divide-y divide-zinc-800">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Current Project
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProjectDropdown(false);
                    onNavigate('upload');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-between"
                >
                  <span>+ Upload New Project</span>
                  <FolderGit2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative hidden md:block w-80">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search files, issues, or functions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.trim().length > 0);
            }}
            onFocus={() => setShowSearchDropdown(searchQuery.trim().length > 0)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Global Search Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {searchIssueResults.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Matched Issues
                </div>
                {searchIssueResults.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => {
                      if (onSearchSelectFile) onSearchSelectFile(iss.file, iss.line);
                      onNavigate('explorer');
                      setShowSearchDropdown(false);
                    }}
                    className="p-2.5 hover:bg-zinc-800/60 cursor-pointer border-b border-zinc-800/50 flex items-start space-x-2"
                  >
                    <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-zinc-200 font-medium">{iss.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {iss.file}:{iss.line}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchFileResults.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Matched Code Files
                </div>
                {searchFileResults.map((f) => (
                  <div
                    key={f.path}
                    onClick={() => {
                      if (onSearchSelectFile) onSearchSelectFile(f.path);
                      onNavigate('explorer');
                      setShowSearchDropdown(false);
                    }}
                    className="p-2.5 hover:bg-zinc-800/60 cursor-pointer border-b border-zinc-800/50 flex items-center space-x-2"
                  >
                    <FileCode size={14} className="text-indigo-400 shrink-0" />
                    <div className="text-xs text-zinc-300 font-mono truncate">{f.path}</div>
                  </div>
                ))}
              </div>
            )}

            {searchFileResults.length === 0 && searchIssueResults.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500">
                No matching files or issues found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-3">
        {/* API Key Connected Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini AI Connected</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors relative"
          >
            <Bell size={16} />
            {analysis && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-zinc-950" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Analysis Notifications
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Live Engine</span>
              </div>
              {analysis ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start space-x-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-zinc-200">
                        Scan Completed ({project?.name})
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Identified {analysis.issues.length} potential findings. Health score: {analysis.scores.overall}/100.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 py-4 text-center">
                  No notifications. Upload a project to begin analysis.
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Settings"
        >
          <Sliders size={16} />
        </button>

        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-indigo-400/30">
          DEV
        </div>
      </div>
    </header>
  );
}
