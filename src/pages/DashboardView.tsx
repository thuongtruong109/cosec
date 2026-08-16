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
  Sparkles,
  Share2,
  Download,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult, CodeIssue } from '../types';
import StatCard from '../components/common/StatCard';
import ScoreRing from '../components/common/ScoreRing';
import Badge, { BadgeVariant } from '../components/common/Badge';
import PageHeader from '../components/common/PageHeader';
import ShareExportModal from '../components/ShareExportModal';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!analysis) {
    return (
      <div className="p-10 text-center text-zinc-400 font-mono text-xs">
        No review analysis available. Please upload a repository first.
      </div>
    );
  }

  const { scores, issueCounts, securitySummary, qualitySummary, issues } = analysis;

  const scoreCategories = [
    { label: 'Security', value: scores.security, icon: Lock, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Reliability', value: scores.reliability, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Performance', value: scores.performance, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Maintainability', value: scores.maintainability, icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Architecture', value: scores.architecture, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  const bugCount = issues.filter((i) => i.category === 'bug').length;
  const perfCount = issues.filter((i) => i.category === 'performance').length;
  const archCount = issues.filter((i) => i.category === 'architecture').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Codebase Architecture & Health Dashboard"
        subtitle={`Repository: ${analysis.projectName} • Analyzed on ${new Date(analysis.analyzedAt).toLocaleDateString()}`}
        icon={<LayoutDashboard size={22} />}
        actions={
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <Share2 size={15} className="text-indigo-400" />
              <span>Share & Export</span>
            </button>

            <button
              onClick={() => onNavigateExplorer()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
            >
              <FileCode size={15} />
              <span>Explore Codebase</span>
            </button>
          </div>
        }
      />

      {/* Top Grid: Health Score Ring + Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score Ring Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-xl backdrop-blur-sm"
        >
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
            <span className="font-bold text-zinc-400 uppercase tracking-wider">Overall Health</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Passed QA
            </span>
          </div>

          <ScoreRing
            score={scores.overall}
            size={160}
            strokeWidth={11}
            sublabel="Health Score"
          />

          <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full text-center text-xs text-zinc-400">
            {scores.overall >= 80 ? (
              <span className="text-emerald-400 font-medium">Production-Ready & High Integrity</span>
            ) : (
              <span className="text-amber-400 font-medium">Attention Recommended on Key Vulnerabilities</span>
            )}
          </div>
        </motion.div>

        {/* 5 Dimensional Category Subscores */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {scoreCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 font-mono">{cat.label}</span>
                  <div className={`p-2 rounded-xl border ${cat.bg} ${cat.color}`}>
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-extrabold text-white">{cat.value}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">/ 100</span>
                  </div>

                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + idx * 0.05 }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            onClick={onNavigateIssues}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/30 shadow-md flex flex-col justify-between cursor-pointer hover:border-indigo-400/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 font-mono">Total Issues</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <AlertTriangle size={16} />
              </div>
            </div>

            <div className="mt-2">
              <div className="text-2xl font-extrabold text-white">{issues.length} Findings</div>
              <div className="flex items-center space-x-2 mt-2 text-[11px] font-mono text-zinc-300">
                <span className="text-rose-400 font-bold">{issueCounts.critical} Critical</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{issueCounts.high} High</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Vulnerabilities"
          value={issueCounts.critical}
          subtext="Immediate Patch Required"
          icon={<ShieldAlert size={20} />}
          iconBg="bg-rose-500/10 border-rose-500/20"
          iconColor="text-rose-400"
          onClick={onNavigateIssues}
        />
        <StatCard
          title="Logic & Bug Findings"
          value={bugCount}
          subtext="Potential runtime hazards"
          icon={<Bug size={20} />}
          iconBg="bg-amber-500/10 border-amber-500/20"
          iconColor="text-amber-400"
          onClick={onNavigateIssues}
        />
        <StatCard
          title="Performance Bottlenecks"
          value={perfCount}
          subtext="Latency & memory leaks"
          icon={<Zap size={20} />}
          iconBg="bg-yellow-500/10 border-yellow-500/20"
          iconColor="text-yellow-400"
          onClick={onNavigateIssues}
        />
        <StatCard
          title="Architecture Violations"
          value={archCount}
          subtext="Coupling & layer leaks"
          icon={<Layers size={20} />}
          iconBg="bg-indigo-500/10 border-indigo-500/20"
          iconColor="text-indigo-400"
          onClick={onNavigateIssues}
        />
      </div>

      {/* Top Priority Issues Preview */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert size={18} className="text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Top Priority High-Risk Findings
            </h2>
          </div>

          <button
            onClick={onNavigateIssues}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>View all {issues.length} findings</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {issues.slice(0, 4).map((issue) => (
            <motion.div
              key={issue.id}
              whileHover={{ x: 3 }}
              onClick={() => onNavigateExplorer(issue.file, issue.line)}
              className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
            >
              <div className="flex items-start space-x-3">
                <Badge variant={issue.severity as BadgeVariant} icon size="xs" className="mt-0.5 shrink-0">
                  {issue.severity}
                </Badge>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{issue.title}</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {issue.file}:{issue.line} • <span className="capitalize">{issue.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 shrink-0 self-end sm:self-center">
                <span>Investigate</span>
                <ArrowRight size={13} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share & Export Modal */}
      <ShareExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        analysis={analysis}
      />
    </div>
  );
}
