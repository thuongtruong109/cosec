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
  Layers
} from 'lucide-react';
import { AnalysisResult, CodeIssue, Severity, IssueCategory, IssueStatus } from '../types';
import DiffViewer from '../components/DiffViewer';

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
      <div className="p-12 text-center text-zinc-400">
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

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Issue Explorer & Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing {filteredIssues.length} of {analysis.issues.length} total findings across repository
          </p>
        </div>

        {/* Group By Toggle */}
        <div className="flex items-center space-x-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setGroupBy('severity')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              groupBy === 'severity' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Group Severity
          </button>
          <button
            onClick={() => setGroupBy('file')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              groupBy === 'file' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Group File
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search title or file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="security">Security</option>
          <option value="bug">Bug</option>
          <option value="performance">Performance</option>
          <option value="architecture">Architecture</option>
          <option value="maintainability">Maintainability</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="fixed">Fixed</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isExpanded = expandedIssueId === issue.id;

          return (
            <div
              key={issue.id}
              className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              {/* Row Summary Header */}
              <div
                onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                className="p-5 hover:bg-zinc-800/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono border mt-0.5 shrink-0 ${getSeverityBadge(
                      issue.severity
                    )}`}
                  >
                    {issue.severity}
                  </span>

                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm">{issue.title}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-zinc-400 font-mono">
                      <span className="text-indigo-400 font-bold">{issue.file}:{issue.line}</span>
                      <span>•</span>
                      <span className="capitalize">{issue.category}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(issue.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateExplorer(issue.file, issue.line);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <FileCode size={14} className="text-indigo-400" />
                    <span>Open in Editor</span>
                  </button>
                </div>
              </div>

              {/* Expanded Detail Accordion */}
              {isExpanded && (
                <div className="p-6 border-t border-zinc-800 bg-zinc-950 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono">
                        Description & Why It Matters
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{issue.description}</p>
                      <p className="text-zinc-400 leading-relaxed mt-2">{issue.whyItMatters}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-rose-400 uppercase font-mono">
                        Potential Impact
                      </div>
                      <p className="text-rose-200 leading-relaxed bg-rose-950/20 p-3 rounded-xl border border-rose-500/20">
                        {issue.potentialImpact}
                      </p>
                    </div>
                  </div>

                  {/* Diff Viewer */}
                  <div>
                    <div className="text-[10px] font-bold text-indigo-400 uppercase font-mono mb-2">
                      Secure Code Remediation
                    </div>
                    <DiffViewer originalCode={issue.originalCode} suggestedCode={issue.suggestedFix} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono bg-zinc-900/40 rounded-2xl border border-zinc-800">
            No issues match the selected search filters.
          </div>
        )}
      </div>
    </div>
  );
}
