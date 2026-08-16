import React, { useState } from 'react';
import { Zap, Sparkles, Check, FileCode, ArrowRight } from 'lucide-react';
import { Project, RefactorResult } from '../types';
import { requestRefactor } from '../services/aiService';
import DiffViewer from '../components/DiffViewer';

interface RefactorViewProps {
  project: Project | null;
  onApplyRefactoredCode?: (filePath: string, newContent: string) => void;
}

export default function RefactorView({ project, onApplyRefactoredCode }: RefactorViewProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    project?.files[0]?.path || 'src/controllers/auth.ts'
  );
  const [targetGoal, setTargetGoal] = useState<string>('security');
  const [loading, setLoading] = useState<boolean>(false);
  const [refactorOutput, setRefactorOutput] = useState<RefactorResult | null>(null);

  const activeFile = project?.files.find((f) => f.path === selectedFilePath) || project?.files[0];

  const handleRunRefactor = async () => {
    if (!activeFile) return;
    setLoading(true);

    try {
      const result = await requestRefactor({
        codeSnippet: activeFile.content,
        goal: targetGoal as any,
        filePath: activeFile.path,
      });
      setRefactorOutput(result);
    } catch (err) {
      console.error('Refactor error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Zap size={24} className="text-indigo-400" />
            <span>AI Automated Code Refactoring Assistant</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Optimize readability, security, cyclomatic complexity, and design patterns across repository source files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6 shadow-xl h-fit">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">Select Target File</label>
            <select
              value={selectedFilePath}
              onChange={(e) => {
                setSelectedFilePath(e.target.value);
                setRefactorOutput(null);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
            >
              {project?.files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path} ({f.lines} lines)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">Refactoring Objective</label>
            <div className="space-y-2 text-xs font-mono">
              {[
                { id: 'security', label: 'Security & Vulnerability Patching' },
                { id: 'performance', label: 'Performance & Memory Optimization' },
                { id: 'readability', label: 'Clean Code & Readability' },
                { id: 'complexity', label: 'Reduce Cyclomatic Complexity' },
                { id: 'patterns', label: 'Modern Design Patterns' },
                { id: 'types', label: 'Strict Type Safety' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setTargetGoal(opt.id)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    targetGoal === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="goal"
                    checked={targetGoal === opt.id}
                    onChange={() => setTargetGoal(opt.id)}
                    className="accent-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunRefactor}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <Sparkles size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            <span>{loading ? 'Refactoring with Gemini AI...' : 'Generate Refactored Version'}</span>
          </button>
        </div>

        {/* Refactored Diff & Explanation Column */}
        <div className="md:col-span-2 space-y-6">
          {refactorOutput ? (
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Refactored Code Comparison</h3>
                </div>

                {onApplyRefactoredCode && (
                  <button
                    onClick={() => onApplyRefactoredCode(selectedFilePath, refactorOutput.refactoredCode)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-md"
                  >
                    <Check size={14} />
                    <span>Apply Refactor to Project</span>
                  </button>
                )}
              </div>

              {/* Summary / Explanation */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <div className="font-bold text-indigo-400 uppercase font-mono">Summary of Key Improvements</div>
                <p className="text-zinc-300 leading-relaxed font-sans">{refactorOutput.explanation}</p>
              </div>

              {/* Diff Viewer */}
              <DiffViewer
                originalCode={refactorOutput.originalCode}
                suggestedCode={refactorOutput.refactoredCode}
              />
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 font-mono text-xs space-y-2">
              <Zap size={32} className="mx-auto text-zinc-600 mb-2" />
              <div>Select a file and target objective, then click "Generate Refactored Version".</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
