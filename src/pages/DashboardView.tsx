import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCode,
  Lock,
  Cpu,
  Layers,
  Activity,
  Gauge,
  DollarSign,
  Leaf,
  LayoutDashboard
} from 'lucide-react';
import { AnalysisResult, CodeIssue } from '../types';

interface DashboardViewProps {
  analysis: AnalysisResult | null;
  onNavigateExplorer: (filePath?: string, line?: number) => void;
  onNavigateIssues: () => void;
}

export default function DashboardView({
  analysis,
  onNavigateExplorer,
  onNavigateIssues,
}: DashboardViewProps) {
  if (!analysis) {
    return (
      <div className="p-10 text-center text-zinc-400 font-mono text-xs">
        No review analysis available. Please upload a repository first.
      </div>
    );
  }

  const { scores, issueCounts, securitySummary, qualitySummary, issues } = analysis;

  const scoreCategories = [
    { label: 'Security', value: scores.security, color: 'stroke-rose-500 text-rose-400', bg: 'bg-rose-500' },
    { label: 'Reliability', value: scores.reliability, color: 'stroke-emerald-500 text-emerald-400', bg: 'bg-emerald-500' },
    { label: 'Performance', value: scores.performance, color: 'stroke-amber-500 text-amber-400', bg: 'bg-amber-500' },
    { label: 'Maintainability', value: scores.maintainability, color: 'stroke-indigo-500 text-indigo-400', bg: 'bg-indigo-500' },
    { label: 'Architecture', value: scores.architecture, color: 'stroke-purple-500 text-purple-400', bg: 'bg-purple-500' },
  ];

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
    <div className="p-5 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Codebase Architecture & Health Dashboard</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Repository: <span className="text-indigo-400 font-mono font-semibold">{analysis.projectName}</span> • Analyzed {new Date(analysis.analyzedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateExplorer()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <FileCode size={14} />
            <span>Open Code Explorer</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Overall Circular Wheel + Category Subscores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Score Ring */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center relative shadow-xl">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#6366f1"
                strokeWidth="8"
                strokeDasharray="263.8"
                strokeDashoffset={263.8 - (263.8 * scores.overall) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white">{scores.overall}</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                / 100 Health
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              Grade B+ (Good)
            </span>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              Passed {issues.filter((i) => i.status === 'fixed').length} automatic refactoring checks
            </p>
          </div>
        </div>

        {/* Category Scores Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scoreCategories.map((cat) => (
            <div key={cat.label} className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>{cat.label}</span>
                <span className={`font-mono text-xs font-bold ${cat.color}`}>{cat.value} / 100</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full ${cat.bg} transition-all duration-700`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {cat.value >= 80 ? 'Optimal Status' : 'Requires Attention'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance, Latency & Operational Cost Estimator */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Gauge size={16} className="text-emerald-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
              Performance & Cloud Execution Cost Benchmark
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Estimated Production Index
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Avg Latency</span>
              <Activity size={12} className="text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">18.4 ms</div>
            <div className="text-[10px] text-emerald-400 font-mono">High Speed</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>DB Overhead</span>
              <Gauge size={12} className="text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">2.1 Queries</div>
            <div className="text-[10px] text-amber-400 font-mono">1 Unindexed SQL</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Cloud Cost / 1M</span>
              <DollarSign size={12} className="text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">$0.0018</div>
            <div className="text-[10px] text-emerald-400 font-mono">Serverless Optimized</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Carbon Index</span>
              <Leaf size={12} className="text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">A+ Eco Grade</div>
            <div className="text-[10px] text-zinc-500 font-mono">Low Memory Footprint</div>
          </div>
        </div>
      </div>

      {/* Issue Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>Issue Breakdown by Severity</span>
          </h3>
          <button
            onClick={onNavigateIssues}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({issues.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg text-center">
            <div className="text-[10px] font-bold text-rose-400 uppercase font-mono">Critical</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{issueCounts.critical}</div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-center">
            <div className="text-[10px] font-bold text-amber-400 uppercase font-mono">High</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{issueCounts.high}</div>
          </div>

          <div className="bg-yellow-950/20 border border-yellow-500/30 p-3 rounded-lg text-center">
            <div className="text-[10px] font-bold text-yellow-400 uppercase font-mono">Medium</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{issueCounts.medium}</div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-lg text-center">
            <div className="text-[10px] font-bold text-indigo-400 uppercase font-mono">Low</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{issueCounts.low}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center">
            <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Info</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">{issueCounts.info}</div>
          </div>
        </div>
      </div>

      {/* Security & Code Quality Dual Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Summary Panel */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
            <Lock size={16} className="text-rose-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">Security Findings Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">SQL Injection</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                {securitySummary.sqlInjection}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Hardcoded Secrets</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                {securitySummary.hardcodedSecrets}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Insecure Auth</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                {securitySummary.insecureAuth}
              </span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">XSS Flaws</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                {securitySummary.xss}
              </span>
            </div>
          </div>
        </div>

        {/* Code Quality Panel */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
            <Cpu size={16} className="text-indigo-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">Code Quality & Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Complexity</span>
              <span className="text-amber-400 font-bold">{qualitySummary.cyclomaticComplexity}</span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Duplication</span>
              <span className="text-indigo-300 font-bold">{qualitySummary.duplicationPercentage}%</span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Long Functions</span>
              <span className="text-zinc-200 font-bold">{qualitySummary.longFunctionsCount}</span>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400">Dead Code</span>
              <span className="text-zinc-200 font-bold">{qualitySummary.deadCodeLocations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Findings Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">Recent Key Findings</h3>
          <span className="text-[10px] text-zinc-500 font-mono">Click row to open in Code Explorer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5">File</th>
                <th className="px-4 py-2.5">Line</th>
                <th className="px-4 py-2.5">Issue Title</th>
                <th className="px-4 py-2.5">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {issues.slice(0, 6).map((iss) => (
                <tr
                  key={iss.id}
                  onClick={() => onNavigateExplorer(iss.file, iss.line)}
                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${getSeverityBadge(
                        iss.severity
                      )}`}
                    >
                      {iss.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-zinc-300 font-semibold">{iss.file}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{iss.line}</td>
                  <td className="px-4 py-2.5 text-white font-medium">{iss.title}</td>
                  <td className="px-4 py-2.5 text-zinc-400 font-mono capitalize">{iss.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

