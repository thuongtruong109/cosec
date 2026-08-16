import React from 'react';
import { Package, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../types';
import PageHeader from '../components/common/PageHeader';
import Badge, { BadgeVariant } from '../components/common/Badge';

interface DependenciesViewProps {
  analysis: AnalysisResult | null;
}

export default function DependenciesView({ analysis }: DependenciesViewProps) {
  if (!analysis) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs">
        No dependency analysis data available. Please upload a repository first.
      </div>
    );
  }

  const { dependencies } = analysis;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Dependency Risk & Supply Chain Scanner"
        subtitle={`Manifest security audit for package manifests in repository ${analysis.projectName}`}
        icon={<Package size={22} />}
        actions={
          <div className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300">
            Total Packages: <span className="font-bold text-white">{dependencies.length}</span>
          </div>
        }
      />

      {/* Dependency Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase font-mono border-b border-zinc-800">
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
                    <Badge variant={dep.riskLevel as BadgeVariant} size="xs">
                      {dep.riskLevel}
                    </Badge>
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
      </motion.div>
    </div>
  );
}
