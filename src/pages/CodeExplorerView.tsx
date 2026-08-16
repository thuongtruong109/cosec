import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Copy, 
  EyeOff, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Project, AnalysisResult, CodeIssue, FileItem } from '../types';
import DiffViewer from '../components/DiffViewer';

interface CodeExplorerViewProps {
  project: Project | null;
  analysis: AnalysisResult | null;
  initialFile?: string;
  initialLine?: number;
  onApplyFixToFile?: (filePath: string, newContent: string, issueId: string) => void;
}

export default function CodeExplorerView({
  project,
  analysis,
  initialFile,
  initialLine,
  onApplyFixToFile,
}: CodeExplorerViewProps) {
  const defaultFile = project?.files[0]?.path || 'src/controllers/auth.ts';
  const [selectedFilePath, setSelectedFilePath] = useState<string>(initialFile || defaultFile);
  const [highlightedLine, setHighlightedLine] = useState<number | undefined>(initialLine);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialFile) {
      setSelectedFilePath(initialFile);
      setHighlightedLine(initialLine);
    }
  }, [initialFile, initialLine]);

  if (!project) {
    return (
      <div className="p-12 text-center text-zinc-400">
        No project loaded. Please upload a repository first.
      </div>
    );
  }

  const selectedFileItem: FileItem = project.files.find((f) => f.path === selectedFilePath) || project.files[0];

  // Get issues for selected file
  const fileIssues: CodeIssue[] = analysis?.issues.filter((i) => i.file === selectedFilePath) || [];

  // Selected issue or primary issue for file
  const selectedIssue = fileIssues.find((i) => i.line === highlightedLine) || fileIssues[0];

  const lines = selectedFileItem ? selectedFileItem.content.split('\n') : [];

  const handleApplyFix = (issue: CodeIssue) => {
    if (!onApplyFixToFile) return;
    const newContent = selectedFileItem.content.replace(issue.originalCode, issue.suggestedFix);
    onApplyFixToFile(selectedFilePath, newContent, issue.id);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-200 select-none overflow-hidden font-sans">
      {/* LEFT: Repository File Tree */}
      <div className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center justify-between">
          <span>Repository Explorer</span>
          <span className="text-slate-400 dark:text-zinc-600">{project.files.length} files</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
          {project.files.map((file) => {
            const isSelected = file.path === selectedFilePath;
            const issuesCount = analysis?.issues.filter((i) => i.file === file.path && i.status === 'open').length || 0;

            return (
              <button
                key={file.path}
                onClick={() => {
                  setSelectedFilePath(file.path);
                  setHighlightedLine(undefined);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode size={14} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'} />
                  <span className="truncate">{file.path}</span>
                </div>

                {issuesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 shrink-0">
                    {issuesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Syntax Highlighted Code Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/70 dark:bg-zinc-900/60">
        <div className="h-10 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs text-slate-800 dark:text-zinc-300">
            <FileCode size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">{selectedFilePath}</span>
            <span className="text-slate-400 dark:text-zinc-600">({selectedFileItem?.lines} lines)</span>
          </div>

          {fileIssues.length > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold">
              <AlertTriangle size={12} />
              <span>{fileIssues.length} Finding(s) Detected</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-white dark:bg-zinc-950">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const lineIssue = fileIssues.find((i) => i.line === lineNum);
            const isHighlighted = highlightedLine === lineNum || (lineIssue && selectedIssue?.id === lineIssue.id);

            return (
              <div
                key={idx}
                onClick={() => lineIssue && setHighlightedLine(lineNum)}
                className={`flex items-start group rounded ${
                  lineIssue
                    ? isHighlighted
                      ? 'bg-rose-50 dark:bg-rose-500/20 border-l-2 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold'
                      : 'bg-rose-50/60 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/15 cursor-pointer text-rose-900 dark:text-rose-300'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-zinc-200'
                }`}
              >
                <span className="w-12 text-right pr-4 text-slate-400 dark:text-zinc-600 select-none shrink-0">
                  {lineNum}
                </span>

                <pre className="flex-1 whitespace-pre-wrap break-all">{lineText}</pre>

                {lineIssue && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded shrink-0">
                    {lineIssue.severity.toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: AI Review Panel */}
      <div className="w-96 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 overflow-y-auto shrink-0 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Code Review Panel</h3>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">Confidence: 98%</span>
        </div>

        {selectedIssue ? (
          <div className="space-y-5 text-xs">
            {/* Severity Header */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 uppercase font-mono">
                  {selectedIssue.severity}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  Line {selectedIssue.line}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedIssue.title}</h4>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase font-mono">Description</div>
              <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{selectedIssue.description}</p>
            </div>

            {/* Impact & Exploitation */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">Potential Impact</div>
              <p className="text-rose-900 dark:text-rose-200/90 leading-relaxed bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
                {selectedIssue.potentialImpact}
              </p>
            </div>

            {selectedIssue.exploitationScenario && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">Exploitation Scenario</div>
                <p className="text-amber-900 dark:text-amber-200/90 leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  {selectedIssue.exploitationScenario}
                </p>
              </div>
            )}

            {/* Side-by-Side Diff Preview */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                Suggested Code Fix
              </div>

              <DiffViewer
                originalCode={selectedIssue.originalCode}
                suggestedCode={selectedIssue.suggestedFix}
                onApplyFix={() => handleApplyFix(selectedIssue)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleApplyFix(selectedIssue)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Check size={14} />
                <span>Apply Fix to Codebase</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(selectedIssue.suggestedFix)}
                  className="flex-1 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center justify-center space-x-1.5 text-[11px] transition-colors shadow-sm"
                >
                  <Copy size={12} />
                  <span>Copy Fix</span>
                </button>

                <button
                  onClick={() => (selectedIssue.status = 'ignored')}
                  className="flex-1 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center justify-center space-x-1.5 text-[11px] transition-colors shadow-sm"
                >
                  <EyeOff size={12} />
                  <span>Ignore Issue</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
            No critical issues identified in this file.
          </div>
        )}
      </div>
    </div>
  );
}
