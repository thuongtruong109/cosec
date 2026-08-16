import React, { useState } from 'react';
import { Zap, Sparkles, Check, FileCode, ArrowRight, RefreshCw, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, RefactorResult } from '../types';
import { requestRefactor } from '../services/aiService';
import DiffViewer from '../components/DiffViewer';
import CustomSelect, { SelectOption } from '../components/common/CustomSelect';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';

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

  const fileOptions: SelectOption[] = (project?.files || []).map((f) => ({
    value: f.path,
    label: f.name,
    sublabel: f.path,
    badge: `${f.lines} lines`,
  }));

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

  const goals = [
    { id: 'security', label: 'Security & Vulnerability Patching', desc: 'Isolate parameters, prevent SQLi/XSS/RCE' },
    { id: 'performance', label: 'Performance & Memory Optimization', desc: 'Reduce async overhead, cache iterations' },
    { id: 'readability', label: 'Clean Code & Readability', desc: 'Descriptive naming, modular functions' },
    { id: 'complexity', label: 'Reduce Cyclomatic Complexity', desc: 'Decompose nested branches and loops' },
    { id: 'patterns', label: 'Modern Design Patterns', desc: 'Factory, strategy, repository abstraction' },
    { id: 'types', label: 'Strict Type Safety', desc: 'Eliminate any types, exhaustive enums' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="AI Code Refactoring"
        subtitle="Automated readability, security, and architectural optimization with Gemini"
        icon={<Zap size={22} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-6 shadow-sm dark:shadow-xl h-fit backdrop-blur-sm"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase font-mono">
              Target Source File
            </label>
            <CustomSelect
              options={fileOptions}
              value={selectedFilePath}
              onChange={(val) => {
                setSelectedFilePath(val);
                setRefactorOutput(null);
              }}
              searchable
              placeholder="Select source file"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-zinc-300 uppercase font-mono">
              Refactoring Objective
            </label>
            <div className="space-y-2 text-xs">
              {goals.map((opt) => {
                const isSelected = targetGoal === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTargetGoal(opt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-600/20 dark:border-indigo-500/50 dark:text-indigo-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{opt.label}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500' : 'border-slate-300 dark:border-zinc-700'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunRefactor}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <RefreshCw size={15} className="animate-spin text-white" />
            ) : (
              <Sparkles size={15} />
            )}
            <span>{loading ? 'Refactoring with Gemini AI...' : 'Generate Refactored Code'}</span>
          </button>
        </motion.div>

        {/* Refactored Diff & Explanation Column */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-2 space-y-6"
        >
          {refactorOutput ? (
            <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-5 shadow-sm dark:shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Refactored Code Comparison</h3>
                </div>

                {onApplyRefactoredCode && (
                  <button
                    onClick={() => onApplyRefactoredCode(selectedFilePath, refactorOutput.refactoredCode)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Apply Refactor to Project</span>
                  </button>
                )}
              </div>

              {/* Summary / Explanation */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 rounded-xl border border-slate-200 dark:border-zinc-800/90 space-y-1.5 text-xs">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Key Architectural Improvements
                </div>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">{refactorOutput.explanation}</p>
              </div>

              {/* Diff Viewer */}
              <DiffViewer
                originalCode={refactorOutput.originalCode}
                suggestedCode={refactorOutput.refactoredCode}
                filename={selectedFilePath}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-14 text-center text-slate-500 dark:text-zinc-400 font-mono text-xs space-y-3">
              <Zap size={36} className="mx-auto text-slate-400 dark:text-zinc-600 mb-2" />
              <div className="text-sm font-semibold text-slate-800 dark:text-zinc-300">Ready to Refactor</div>
              <p className="text-slate-500 dark:text-zinc-500 max-w-sm mx-auto font-sans">
                Select any source file and an optimization objective on the left, then click "Generate Refactored Code".
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
