import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  FileCode, 
  Lock, 
  Cpu, 
  Layers, 
  Activity, 
  LayoutDashboard,
  Bug,
  Share2,
  FileText,
  X,
  ExternalLink,
  Code,
  Info,
  CheckCircle,
  TrendingUp,
  GitBranch,
  Search,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, CodeIssue, ArchitecturalSmell } from '../types';
import StatCard from '../components/common/StatCard';
import ScoreRing from '../components/common/ScoreRing';
import Badge, { BadgeVariant } from '../components/common/Badge';
import PageHeader from '../components/common/PageHeader';
import ShareExportModal from '../components/ShareExportModal';

interface DashboardViewProps {
  analysis: AnalysisResult | null;
  onNavigateExplorer: (filePath?: string, line?: number) => void;
  onNavigateIssues: () => void;
  onNavigate?: (view: string) => void;
}

type ModalType = 
  | 'overall' 
  | 'security' 
  | 'reliability' 
  | 'performance' 
  | 'maintainability' 
  | 'architecture' 
  | 'critical' 
  | 'bugs' 
  | 'perf_issues' 
  | 'arch_issues' 
  | null;

export default function DashboardView({
  analysis,
  onNavigateExplorer,
  onNavigateIssues,
  onNavigate,
}: DashboardViewProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  if (!analysis) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 font-mono text-xs">
        No review analysis available. Please upload a repository first.
      </div>
    );
  }

  const { scores, issueCounts, securitySummary, qualitySummary, issues, executiveSummary, architectureNodes, architecturalSmells, dependencies } = analysis;

  const scoreCategories = [
    { id: 'security', label: 'Security', value: scores.security, icon: Lock, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', desc: 'Vulnerability scans, secret exposure, & taint analysis' },
    { id: 'reliability', label: 'Reliability', value: scores.reliability, icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', desc: 'Error handling, async rejections, & exception paths' },
    { id: 'performance', label: 'Performance', value: scores.performance, icon: Zap, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', desc: 'N+1 queries, memory leaks, & processing bottlenecks' },
    { id: 'maintainability', label: 'Maintainability', value: scores.maintainability, icon: Cpu, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', desc: 'Cyclomatic complexity, long functions, & dead code' },
    { id: 'architecture', label: 'Architecture', value: scores.architecture, icon: Layers, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', desc: 'Layer isolation, cyclic imports, & modular structure' },
  ];

  const bugIssues = issues.filter((i) => i.category === 'bug');
  const perfIssues = issues.filter((i) => i.category === 'performance');
  const archIssues = issues.filter((i) => i.category === 'architecture');
  const securityIssues = issues.filter((i) => i.category === 'security' || i.category === 'dependency');
  const criticalIssues = issues.filter((i) => i.severity === 'critical');

  const verdict = executiveSummary?.verdict || (scores.overall >= 85 ? 'Excellent' : scores.overall >= 70 ? 'Good' : 'Needs Attention');

  const verdictBadgeColor = 
    verdict === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
    verdict === 'Good' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
    verdict === 'Needs Attention' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Codebase Overview & Health"
        subtitle={`${analysis.projectName} • Analyzed ${new Date(analysis.analyzedAt).toLocaleDateString()} • ${analysis.totalFiles} files (${analysis.totalLines.toLocaleString()} LOC)`}
        icon={<LayoutDashboard size={20} />}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate?.('report')}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText size={13} className="text-slate-500 dark:text-zinc-400" />
              <span>Full Report</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Share2 size={13} className="text-slate-500 dark:text-zinc-400" />
              <span>Share & Export</span>
            </button>

            <button
              onClick={() => onNavigateExplorer()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FileCode size={14} />
              <span>Explore Code</span>
            </button>
          </div>
        }
      />

      {/* Top Grid: Health Score Ring + Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Score Ring Card */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          onClick={() => setActiveModal('overall')}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-between relative shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-zinc-700 transition-all group"
        >
          <div className="w-full flex items-center justify-between mb-2 text-xs font-mono">
            <span className="font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Overall Health</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
              <span>Inspect Math</span>
              <ArrowRight size={11} />
            </span>
          </div>

          <div className="my-2">
            <ScoreRing
              score={scores.overall}
              size={140}
              strokeWidth={10}
              sublabel="Health Score"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 w-full text-center text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Info size={12} className="text-slate-400 dark:text-zinc-500" />
            <span>Click to view weighted scoring calculation & deductions</span>
          </div>
        </motion.div>

        {/* 5 Dimensional Category Subscores */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scoreCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveModal(cat.id as ModalType)}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">{cat.label}</span>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[130px]">{cat.desc}</p>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${cat.bg} ${cat.color}`}>
                    <Icon size={14} />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{cat.value}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono group-hover:underline flex items-center gap-0.5">
                      <span>Details</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.value}%` }}
                      className={`h-full rounded-full ${
                        cat.value >= 80 ? 'bg-emerald-500' : cat.value >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Quick Issue Stats Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onNavigateIssues}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-indigo-400 dark:hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">Total Issues</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle size={14} />
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{issues.length} Findings</div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                <span className="text-rose-600 dark:text-rose-400 font-bold">{issueCounts.critical} Crit • {issueCounts.high} High</span>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                  <span>View</span>
                  <ArrowRight size={10} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metric Cards Row - ALL CLICKABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Critical Vulnerabilities"
          value={issueCounts.critical}
          subtext="Immediate Patch Required"
          icon={<ShieldAlert size={18} />}
          iconBg="bg-rose-500/10 border-rose-500/20"
          iconColor="text-rose-500 dark:text-rose-400"
          onClick={() => setActiveModal('critical')}
        />
        <StatCard
          title="Logic & Bug Findings"
          value={bugIssues.length}
          subtext="Unhandled Rejections & Crashes"
          icon={<Bug size={18} />}
          iconBg="bg-amber-500/10 border-amber-500/20"
          iconColor="text-amber-500 dark:text-amber-400"
          onClick={() => setActiveModal('bugs')}
        />
        <StatCard
          title="Performance Bottlenecks"
          value={perfIssues.length}
          subtext="N+1 Queries & Latency Hotspots"
          icon={<Zap size={18} />}
          iconBg="bg-yellow-500/10 border-yellow-500/20"
          iconColor="text-yellow-600 dark:text-yellow-400"
          onClick={() => setActiveModal('perf_issues')}
        />
        <StatCard
          title="Architecture Violations"
          value={archIssues.length + (architecturalSmells?.length || 0)}
          subtext="Layer Leaks & Cyclic Smells"
          icon={<Layers size={18} />}
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          iconColor="text-cyan-600 dark:text-cyan-400"
          onClick={() => setActiveModal('arch_issues')}
        />
      </div>

      {/* EXECUTIVE SUMMARY & DIAGNOSTIC SYNTHESIS SECTION - Placed right above Top Priority Findings */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              <Activity size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Executive Code Review &amp; Diagnostic Synthesis
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Domain security analysis, data-flow taint tracing, and architectural risk assessment
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${verdictBadgeColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Verdict: {verdict}
            </span>
          </div>
        </div>

        {/* Executive Headline & Commentary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">
            {executiveSummary?.headline || 'Critical security issues and unvalidated taint flows require immediate remediation before release.'}
          </h3>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
            {executiveSummary?.summary || `Security audit reveals high-priority vulnerabilities in Authentication and Data Access layers, specifically raw SQL string interpolations and unencrypted credential storage. Taint flow tracking detected untrusted user input paths propagating into backend execution sinks without parameterization.`}
          </div>
        </div>

        {/* Domain Topics Breakdown Matrix */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Domain Security &amp; Functional Topics
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(executiveSummary?.domainTopics && executiveSummary.domainTopics.length > 0 
              ? executiveSummary.domainTopics
              : [
                {
                  topic: 'Auth & Secrets Management',
                  status: (securitySummary.hardcodedSecrets > 0 || securitySummary.insecureAuth > 0 ? 'critical' : 'safe') as 'critical' | 'warning' | 'safe',
                  details: securitySummary.hardcodedSecrets > 0 ? 'Exposed credentials or token secrets in source code.' : 'Secure token handling and session storage.'
                },
                {
                  topic: 'Data Access & Query Security',
                  status: (securitySummary.sqlInjection > 0 ? 'critical' : 'safe') as 'critical' | 'warning' | 'safe',
                  details: securitySummary.sqlInjection > 0 ? 'Raw SQL concatenation lacks parameterized bindings (CWE-89).' : 'Clean parameterized queries and ORM mappings.'
                },
                {
                  topic: 'API Perimeter & Input Validation',
                  status: (securitySummary.ssrf > 0 || securitySummary.xss > 0 ? 'warning' : 'safe') as 'critical' | 'warning' | 'safe',
                  details: securitySummary.ssrf > 0 ? 'Outbound request destinations require whitelist validation.' : 'Incoming request boundary schema checks active.'
                },
                {
                  topic: 'Error Boundaries & Async Resilience',
                  status: (qualitySummary.errorHandlingGaps > 0 ? 'warning' : 'safe') as 'critical' | 'warning' | 'safe',
                  details: qualitySummary.errorHandlingGaps > 0 ? `${qualitySummary.errorHandlingGaps} unhandled async exception boundaries.` : 'Robust error catching and fallback states.'
                },
                {
                  topic: 'Supply Chain & Dependency Audit',
                  status: (dependencies.some(d => d.riskLevel === 'critical') ? 'critical' : 'safe') as 'critical' | 'warning' | 'safe',
                  details: dependencies.some(d => d.riskLevel === 'critical') ? 'Known CVE vulnerabilities present in package manifests.' : 'Third-party packages match clean vulnerability benchmarks.'
                }
              ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/50 border border-slate-200/80 dark:border-zinc-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 font-mono">
                    {item.topic}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'critical' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Strengths vs Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Key Strengths */}
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              <CheckCircle size={14} />
              <span>Architectural Strengths</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
              {(executiveSummary?.keyStrengths || [
                `Modular architecture with ${architectureNodes.length} component sub-systems.`,
                'Clean separation of concerns between layers.',
                'Valid type annotations across primary modules.'
              ]).map((item, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Risks & Action Items */}
          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 font-mono">
              <AlertTriangle size={14} />
              <span>Key Risk Factors & Action Items</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
              {(executiveSummary?.urgentActionItems && executiveSummary.urgentActionItems.length > 0 
                ? executiveSummary.urgentActionItems 
                : executiveSummary?.keyRisks || [
                  `${issueCounts.critical} Critical security vulnerabilities detected.`,
                  'Unhandled promise rejections and potential error boundary gaps.'
                ]
              ).map((item, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Top Priority Issues Preview */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={16} className="text-rose-500 dark:text-rose-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Top Priority Findings (Immediate Attention)
            </h2>
          </div>

          <button
            onClick={onNavigateIssues}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View all {issues.length} findings</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="space-y-2">
          {issues.slice(0, 4).map((issue) => (
            <div
              key={issue.id}
              onClick={() => onNavigateExplorer(issue.file, issue.line)}
              className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition-colors group"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <Badge variant={issue.severity as BadgeVariant} icon size="xs" className="mt-0.5 shrink-0">
                  {issue.severity}
                </Badge>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {issue.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                    {issue.file}:{issue.line} • <span className="capitalize">{issue.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono text-indigo-600 dark:text-indigo-400 shrink-0 self-end sm:self-center">
                <span>Inspect in Code</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED INSPECTION MODAL */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                    {activeModal === 'overall' && <ScoreRing score={scores.overall} size={28} strokeWidth={4} />}
                    {activeModal === 'security' && <Lock size={16} className="text-rose-500" />}
                    {activeModal === 'reliability' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {activeModal === 'performance' && <Zap size={16} className="text-amber-500" />}
                    {activeModal === 'maintainability' && <Cpu size={16} className="text-indigo-500" />}
                    {activeModal === 'architecture' && <Layers size={16} className="text-cyan-500" />}
                    {activeModal === 'critical' && <ShieldAlert size={16} className="text-rose-500" />}
                    {activeModal === 'bugs' && <Bug size={16} className="text-amber-500" />}
                    {activeModal === 'perf_issues' && <Zap size={16} className="text-yellow-500" />}
                    {activeModal === 'arch_issues' && <Layers size={16} className="text-cyan-500" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {activeModal === 'overall' && 'Overall Health Score Calculation'}
                      {activeModal === 'security' && `Security Score Breakdown (${scores.security}/100)`}
                      {activeModal === 'reliability' && `Reliability Score Breakdown (${scores.reliability}/100)`}
                      {activeModal === 'performance' && `Performance Score Breakdown (${scores.performance}/100)`}
                      {activeModal === 'maintainability' && `Maintainability Score Breakdown (${scores.maintainability}/100)`}
                      {activeModal === 'architecture' && `Architecture Health Breakdown (${scores.architecture}/100)`}
                      {activeModal === 'critical' && `Critical Severity Findings (${criticalIssues.length})`}
                      {activeModal === 'bugs' && `Bug & Reliability Findings (${bugIssues.length})`}
                      {activeModal === 'perf_issues' && `Performance Hotspots (${perfIssues.length})`}
                      {activeModal === 'arch_issues' && `Architecture Violations & Smells (${archIssues.length + (architecturalSmells?.length || 0)})`}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Detailed diagnostic basis and contributing issues
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[60vh]">
                {/* Overall Score Math Breakdown */}
                {activeModal === 'overall' && (
                  <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
                    <p className="leading-relaxed">
                      The overall health score of <strong className="text-slate-900 dark:text-white font-mono">{scores.overall}/100</strong> is an automated weighted aggregate of 5 key engineering dimensions:
                    </p>

                    <div className="space-y-2 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-slate-50 dark:bg-zinc-950/50">
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-zinc-800">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">Security (Weight: 35%)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{scores.security}/100</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-zinc-800">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">Reliability (Weight: 20%)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{scores.reliability}/100</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-zinc-800">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">Performance (Weight: 15%)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{scores.performance}/100</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-zinc-800">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">Maintainability (Weight: 15%)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{scores.maintainability}/100</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">Architecture (Weight: 15%)</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{scores.architecture}/100</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-300 text-[11px] leading-relaxed">
                      <strong>Score Deductions:</strong> Critical vulnerabilities deduct 15 pts each from Security. High-severity issues deduct 7 pts. Architectural smells deduct 8 pts each.
                    </div>
                  </div>
                )}

                {/* Security Breakdown */}
                {activeModal === 'security' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">SQL Injections</div>
                        <div className="text-base font-bold text-rose-600 dark:text-rose-400">{securitySummary.sqlInjection}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Exposed Secrets</div>
                        <div className="text-base font-bold text-rose-600 dark:text-rose-400">{securitySummary.hardcodedSecrets}</div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono pt-1">
                      Security & Supply Chain Issues ({securityIssues.length}):
                    </div>

                    <div className="space-y-2">
                      {securityIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setActiveModal(null);
                            onNavigateExplorer(issue.file, issue.line);
                          }}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{issue.title}</div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{issue.file}:{issue.line}</div>
                          </div>
                          <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reliability Breakdown */}
                {activeModal === 'reliability' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-zinc-400">Error Handling Gaps</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{qualitySummary.errorHandlingGaps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-zinc-400">Bug & Crash Vulnerabilities</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{bugIssues.length}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {bugIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setActiveModal(null);
                            onNavigateExplorer(issue.file, issue.line);
                          }}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{issue.title}</div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{issue.file}:{issue.line}</div>
                          </div>
                          <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Breakdown */}
                {activeModal === 'performance' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                      Evaluates database query loops (N+1 queries), memory leak patterns, and execution bottlenecks.
                    </div>
                    <div className="space-y-2">
                      {perfIssues.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
                          No performance bottlenecks detected.
                        </div>
                      ) : (
                        perfIssues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => {
                              setActiveModal(null);
                              onNavigateExplorer(issue.file, issue.line);
                            }}
                            className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{issue.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{issue.file}:{issue.line}</div>
                            </div>
                            <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Maintainability Breakdown */}
                {activeModal === 'maintainability' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Cyclomatic Complexity</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{qualitySummary.cyclomaticComplexity}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Long Functions (&gt;60 LOC)</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{qualitySummary.longFunctionsCount}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Dead Code Locations</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{qualitySummary.deadCodeLocations}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Naming Discrepancies</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{qualitySummary.namingIssues}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Architecture Breakdown */}
                {activeModal === 'architecture' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                      Discovered {architectureNodes.length} architectural system nodes and {architecturalSmells?.length || 0} anti-pattern smells.
                    </div>

                    <div className="space-y-2">
                      {(architecturalSmells || []).map((smell) => (
                        <div key={smell.id} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{smell.title}</span>
                            <Badge variant={smell.severity as BadgeVariant} size="xs">{smell.severity}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{smell.description}</p>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                            Fix: {smell.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Issues Breakdown */}
                {activeModal === 'critical' && (
                  <div className="space-y-2 text-xs">
                    {criticalIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => {
                          setActiveModal(null);
                          onNavigateExplorer(issue.file, issue.line);
                        }}
                        className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-rose-700 dark:text-rose-400">{issue.title}</div>
                          <div className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono mt-0.5">
                            {issue.file}:{issue.line} • <span className="capitalize">{issue.category}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold shrink-0">
                          Inspect &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bugs Breakdown */}
                {activeModal === 'bugs' && (
                  <div className="space-y-2 text-xs">
                    {bugIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => {
                          setActiveModal(null);
                          onNavigateExplorer(issue.file, issue.line);
                        }}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{issue.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{issue.file}:{issue.line}</div>
                        </div>
                        <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Perf Issues Breakdown */}
                {activeModal === 'perf_issues' && (
                  <div className="space-y-2 text-xs">
                    {perfIssues.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 dark:text-zinc-500 font-mono">
                        No performance bottlenecks detected.
                      </div>
                    ) : (
                      perfIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setActiveModal(null);
                            onNavigateExplorer(issue.file, issue.line);
                          }}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200">{issue.title}</div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{issue.file}:{issue.line}</div>
                          </div>
                          <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Architecture Issues Breakdown */}
                {activeModal === 'arch_issues' && (
                  <div className="space-y-2 text-xs">
                    {archIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => {
                          setActiveModal(null);
                          onNavigateExplorer(issue.file, issue.line);
                        }}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{issue.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{issue.file}:{issue.line}</div>
                        </div>
                        <Badge variant={issue.severity as BadgeVariant} size="xs">{issue.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Click any issue to jump straight to source code
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const m = activeModal;
                      setActiveModal(null);
                      if (m === 'security') onNavigate?.('security');
                      else if (m === 'architecture' || m === 'arch_issues') onNavigate?.('architecture');
                      else onNavigateIssues();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Dedicated View</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share & Export Modal */}
      <ShareExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        analysis={analysis}
      />
    </div>
  );
}
