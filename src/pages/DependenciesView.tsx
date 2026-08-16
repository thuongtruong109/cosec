import React from 'react';
import { Package, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';

interface DependenciesViewProps {
  analysis: AnalysisResult | null;
}

export default function DependenciesView({ analysis }: DependenciesViewProps) {
  if (!analysis) {
    return (
      <div className="p-12 text-center text-zinc-400">
        No dependency analysis data available. Please upload a repository first.
      </div>
    );
  }

  const { dependencies } = analysis;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Package size={24} className="text-indigo-400" />
            <span>Dependency Risk & Supply Chain Scanner</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manifest security audit for <span className="font-mono text-indigo-400">package.json</span> in repository <span className="font-mono text-zinc-200">{analysis.projectName}</span>
          </p>
        </div>

        <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300">
          Total Packages: <span className="font-bold text-white">{dependencies.length}</span>
        </div>
      </div>

      {/* Dependency Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Package Name</th>
                <th className="px-6 py-3.5">Installed Version</th>
                <th className="px-6 py-3.5">Latest Version</th>
                <th className="px-6 py-3.5">Risk Status</th>
                <th className="px-6 py-3.5">Vulnerability / CVE</th>
                <th className="px-6 py-3.5">License</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {dependencies.map((dep) => (
                <tr key={dep.name} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-100">{dep.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{dep.version}</td>
                  <td className="px-6 py-4 text-emerald-400 font-semibold">{dep.latestVersion || 'Up to date'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskBadge(dep.riskLevel)}`}>
                      {dep.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {dep.vulnerability ? (
                      <span className="text-rose-400 font-semibold">{dep.vulnerability} ({dep.cve || 'Known Risk'})</span>
                    ) : (
                      <span className="text-zinc-500">No known vulnerabilities</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{dep.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
