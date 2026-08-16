import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  EyeOff, 
  FileCode, 
  ArrowRight,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, CodeIssue } from '../types';
import DiffViewer from '../components/DiffViewer';
import CustomSelect, { SelectOption } from '../components/common/CustomSelect';
import Badge, { BadgeVariant } from '../components/common/Badge';
import PageHeader from '../components/common/PageHeader';

interface IssuesViewProps {
  analysis: AnalysisResult | null;
  onNavigateExplorer: (filePath: string, line: number) => void;
}

export default function IssuesView({ analysis, onNavigateExplorer }: IssuesViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupBy, setGroupBy] = useState<'severity' | 'file'>('severity');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs">
        No analysis data available. Please upload a repository first.
      </div>
    );
  }

  // Filter issues
  const filteredIssues = analysis.issues.filter((issue) => {
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
    if (
      searchQuery.trim() &&
      !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !issue.file.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const severityOptions: SelectOption[] = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical', badge: 'High Risk', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    { value: 'high', label: 'High', badge: 'Action Required', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { value: 'medium', label: 'Medium', badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    { value: 'low', label: 'Low' },
    { value: 'info', label: 'Info' },
  ];

  const categoryOptions: SelectOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'security', label: 'Security (OWASP)' },
    { value: 'bug', label: 'Logic & Bugs' },
    { value: 'performance', label: 'Performance' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'maintainability', label: 'Maintainability' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open Findings', badge: 'Active', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    { value: 'fixed', label: 'Resolved / Patched', badge: 'Fixed', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { value: 'ignored', label: 'Dismissed / Ignored' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Issue Explorer & Triage"
        subtitle={`Showing ${filteredIssues.length} of ${analysis.issues.length} detected findings across codebase`}
        icon={<AlertTriangle size={22} />}
        actions={
          <div className="flex items-center space-x-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setGroupBy('severity')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                groupBy === 'severity'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Severity View
            </button>
            <button
              onClick={() => setGroupBy('file')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                groupBy === 'file'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              File Tree View
            </button>
          </div>
        }
      />

      {/* Advanced Filter Toolbar with CustomSelect */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800/90 text-xs shadow-lg backdrop-blur-sm"
      >
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter title, description, or file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono transition-all"
          />
        </div>

        {/* Custom Severity Filter */}
        <CustomSelect
          options={severityOptions}
          value={selectedSeverity}
          onChange={setSelectedSeverity}
          placeholder="Filter Severity"
        />

        {/* Custom Category Filter */}
        <CustomSelect
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Filter Category"
        />

        {/* Custom Status Filter */}
        <CustomSelect
          options={statusOptions}
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="Filter Status"
        />
      </motion.div>

      {/* Issues List */}
      <div className="space-y-3.5">
        <AnimatePresence>
          {filteredIssues.map((issue, idx) => {
            const isExpanded = expandedIssueId === issue.id;

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 hover:border-zinc-700/80"
              >
                {/* Row Summary Header */}
                <div
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  className="p-4 sm:p-5 hover:bg-zinc-800/30 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <Badge variant={issue.severity as BadgeVariant} icon size="sm" className="mt-0.5 shrink-0">
                      {issue.severity}
                    </Badge>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-zinc-100 text-sm truncate">{issue.title}</h3>
                        {issue.status === 'fixed' && (
                          <Badge variant="fixed" size="xs">
                            Resolved
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2.5 mt-1.5 text-xs text-zinc-400 font-mono flex-wrap gap-y-1">
                        <span className="text-indigo-400 font-semibold">{issue.file}:{issue.line}</span>
                        <span>•</span>
                        <span className="capitalize">{issue.category}</span>
                        <span>•</span>
                        <span>Confidence: {Math.round(issue.confidence * 100)}%</span>
                        {issue.cwe && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/90">{issue.cwe}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateExplorer(issue.file, issue.line);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors cursor-pointer border border-zinc-700/80 shadow-sm"
                    >
                      <FileCode size={14} className="text-indigo-400" />
                      <span>Jump to Editor</span>
                    </button>

                    <div className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 space-y-5"
                    >
                      {/* Description & Impact */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                          Description & Architectural Impact
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {issue.description}
                        </p>
                      </div>

                      {/* Remediation Suggestion */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                          <Sparkles size={13} />
                          <span>Recommended AI Remediation</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed font-sans">
                          {issue.suggestedFix}
                        </div>
                      </div>

                      {/* Code Snippet / Diff comparison */}
                      {issue.codeSnippet && (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                            Vulnerable Code Context vs. Proposed Solution
                          </div>
                          <DiffViewer
                            originalCode={issue.codeSnippet}
                            suggestedCode={issue.fixedCode || issue.suggestedFix}
                            filename={issue.file}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredIssues.length === 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-zinc-200">No issues match current filters</div>
            <div className="text-xs text-zinc-400 font-mono">
              Try adjusting your search query, severity, or category filter above.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
