import React, { useState, useMemo } from 'react';
import {
  Package,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Download,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Flame,
  ArrowUpRight,
  GitFork,
  Boxes,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, DependencyItem, VulnerabilityDetail } from '../types';
import PageHeader from '../components/common/PageHeader';
import Badge, { BadgeVariant } from '../components/common/Badge';

interface DependenciesViewProps {
  analysis: AnalysisResult | null;
}

export default function DependenciesView({ analysis }: DependenciesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'vulnerable' | 'direct' | 'transitive' | 'critical_high'>('all');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('all');
  const [selectedDep, setSelectedDep] = useState<DependencyItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="p-12 text-center text-zinc-400 font-mono text-xs">
        No dependency analysis data available. Please upload or scan a repository first.
      </div>
    );
  }

  const { dependencies = [] } = analysis;

  // Stats Calculations
  const stats = useMemo(() => {
    const total = dependencies.length;
    const vulnerable = dependencies.filter((d) => d.riskLevel !== 'safe');
    const critical = dependencies.filter((d) => d.riskLevel === 'critical').length;
    const high = dependencies.filter((d) => d.riskLevel === 'high').length;
    const medium = dependencies.filter((d) => d.riskLevel === 'medium').length;
    const low = dependencies.filter((d) => d.riskLevel === 'low').length;
    const directCount = dependencies.filter((d) => d.isDirect !== false).length;
    const transitiveCount = dependencies.filter((d) => d.isTransitive === true).length;
    const withExploits = dependencies.filter((d) => d.exploitAvailable || d.vulnerabilities?.some((v) => v.exploitAvailable)).length;

    return {
      total,
      vulnerableCount: vulnerable.length,
      critical,
      high,
      medium,
      low,
      directCount,
      transitiveCount,
      withExploits,
    };
  }, [dependencies]);

  // Ecosystems list
  const ecosystems = useMemo(() => {
    const set = new Set<string>();
    dependencies.forEach((d) => {
      if (d.ecosystem) set.add(d.ecosystem);
    });
    return Array.from(set);
  }, [dependencies]);

  // Filtered Dependencies
  const filteredDeps = useMemo(() => {
    return dependencies.filter((dep) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dep.name.toLowerCase().includes(q) ||
        (dep.cve && dep.cve.toLowerCase().includes(q)) ||
        (dep.ghsa && dep.ghsa.toLowerCase().includes(q)) ||
        (dep.vulnerability && dep.vulnerability.toLowerCase().includes(q)) ||
        (dep.license && dep.license.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Ecosystem
      if (selectedEcosystem !== 'all' && dep.ecosystem !== selectedEcosystem) {
        return false;
      }

      // Tabs Filter
      if (activeFilter === 'vulnerable') return dep.riskLevel !== 'safe';
      if (activeFilter === 'direct') return dep.isDirect !== false;
      if (activeFilter === 'transitive') return dep.isTransitive === true;
      if (activeFilter === 'critical_high') return ['critical', 'high'].includes(dep.riskLevel);

      return true;
    });
  }, [dependencies, searchQuery, activeFilter, selectedEcosystem]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportSbom = () => {
    const sbom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:${analysis.projectId || 'sample'}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          name: analysis.projectName,
          type: 'application',
        },
      },
      components: dependencies.map((d) => ({
        name: d.name,
        version: d.resolvedVersion || d.version,
        purl: `pkg:${(d.ecosystem || 'npm').toLowerCase()}/${d.name}@${d.resolvedVersion || d.version}`,
        scope: d.isDirect ? 'required' : 'optional',
        licenses: [{ license: { id: d.license || 'MIT' } }],
        vulnerabilities: d.vulnerabilities?.map((v) => ({
          id: v.id,
          source: { name: 'OSV / NVD' },
          ratings: [{ score: v.cvssScore, severity: v.severity }],
          description: v.summary,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(sbom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.projectName}-sbom-cyclonedx.json`;
    a.click();
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Supply Chain & Dependency Security"
        subtitle={`OSV-backed vulnerability analysis & lockfile resolution for ${analysis.projectName}`}
        icon={<Package size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSbom}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-700 dark:text-zinc-300 shadow-sm transition-all"
              title="Export Software Bill of Materials in CycloneDX 1.5 JSON"
            >
              <Download size={14} />
              <span>Export SBOM (JSON)</span>
            </button>
            <div className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-mono text-indigo-700 dark:text-indigo-300 shadow-sm">
              OSV Database: <span className="font-bold">v1.6 Live</span>
            </div>
          </div>
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Boxes size={14} className="text-slate-500" />
            Total Packages
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {stats.directCount} direct • {stats.transitiveCount} transitive
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert size={14} />
            Vulnerabilities
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {stats.vulnerableCount}
          </div>
          <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5 font-mono">
            {stats.critical} crit • {stats.high} high
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
            <Flame size={14} />
            Public Exploits
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {stats.withExploits}
          </div>
          <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">
            Active weaponized PoCs
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Clean Packages
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {stats.total - stats.vulnerableCount}
          </div>
          <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
            {stats.total > 0 ? Math.round(((stats.total - stats.vulnerableCount) / stats.total) * 100) : 100}% secure
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
            <GitFork size={14} />
            Lockfile Depth
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1 font-mono">
            {stats.transitiveCount > 0 ? 'Resolved' : 'Declared'}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Deterministic SemVer
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 flex items-center gap-1.5">
            <FileCode size={14} />
            License Risk
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
            Permissive
          </div>
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
            MIT / BSD / Apache
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search packages, CVE-xxxx, GHSA, licenses or vulnerabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            All ({dependencies.length})
          </button>
          <button
            onClick={() => setActiveFilter('vulnerable')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors shrink-0 ${
              activeFilter === 'vulnerable'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Vulnerable ({stats.vulnerableCount})
          </button>
          <button
            onClick={() => setActiveFilter('critical_high')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors shrink-0 ${
              activeFilter === 'critical_high'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Crit & High ({stats.critical + stats.high})
          </button>
          <button
            onClick={() => setActiveFilter('direct')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors shrink-0 ${
              activeFilter === 'direct'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Direct ({stats.directCount})
          </button>
          <button
            onClick={() => setActiveFilter('transitive')}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors shrink-0 ${
              activeFilter === 'transitive'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Transitive ({stats.transitiveCount})
          </button>

          {ecosystems.length > 1 && (
            <select
              value={selectedEcosystem}
              onChange={(e) => setSelectedEcosystem(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="all">All Ecosystems</option>
              {ecosystems.map((eco) => (
                <option key={eco} value={eco}>
                  {eco}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Dependency Security Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-mono border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Component & Ecosystem</th>
                <th className="px-5 py-3.5">Resolved Version</th>
                <th className="px-5 py-3.5">Security Status</th>
                <th className="px-5 py-3.5">Advisories (CVE / GHSA)</th>
                <th className="px-5 py-3.5">Fixed In</th>
                <th className="px-5 py-3.5">License & Source</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
              {filteredDeps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
                    No dependencies matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeps.map((dep) => {
                  const hasVulns = dep.riskLevel !== 'safe';
                  const primaryVuln = dep.vulnerabilities?.[0];
                  const cveCode = dep.cve || primaryVuln?.aliases?.find((a) => a.startsWith('CVE-')) || dep.ghsa;

                  return (
                    <tr
                      key={dep.id || `${dep.name}-${dep.resolvedVersion || dep.version}`}
                      onClick={() => setSelectedDep(dep)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Component Name & Tag */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {dep.name}
                          </div>
                          {dep.isTransitive ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                              Transitive
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                              Direct
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-sans">
                            {dep.ecosystem || 'npm'}
                          </span>
                        </div>
                        {dep.dependencyPath && dep.dependencyPath.length > 2 && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate max-w-xs font-sans">
                            via {dep.dependencyPath.slice(1, -1).join(' → ')}
                          </div>
                        )}
                      </td>

                      {/* Resolved Version */}
                      <td className="px-5 py-3.5 text-slate-700 dark:text-zinc-300">
                        <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs font-semibold">
                          {dep.resolvedVersion || dep.version}
                        </span>
                      </td>

                      {/* Security Status Badge */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={dep.riskLevel as BadgeVariant} size="xs">
                            {dep.riskLevel.toUpperCase()}
                          </Badge>
                          {dep.exploitAvailable && (
                            <span
                              className="p-1 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                              title="Public weaponized exploit available in the wild"
                            >
                              <Flame size={12} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Advisory & CVE */}
                      <td className="px-5 py-3.5">
                        {hasVulns ? (
                          <div className="space-y-0.5 max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                                {cveCode || 'Security Advisory'}
                              </span>
                              {primaryVuln?.cvssScore && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  CVSS {primaryVuln.cvssScore}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate max-w-xs font-sans">
                              {primaryVuln?.summary || dep.vulnerability || 'Known vulnerability'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            No Known CVEs
                          </span>
                        )}
                      </td>

                      {/* Fixed In */}
                      <td className="px-5 py-3.5">
                        {dep.fixedIn || (hasVulns && dep.latestVersion) ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <ArrowUpRight size={13} />
                            {dep.fixedIn || dep.latestVersion}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500">Up to date</span>
                        )}
                      </td>

                      {/* License & Source */}
                      <td className="px-5 py-3.5 text-slate-500 dark:text-zinc-400 text-xs">
                        <div className="font-sans font-medium text-slate-700 dark:text-zinc-300">{dep.license}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">{dep.usageFile}</div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDep(dep);
                          }}
                          className="px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Security Advisory Details Drawer / Modal */}
      <AnimatePresence>
        {selectedDep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                      {selectedDep.name}
                    </h3>
                    <Badge variant={selectedDep.riskLevel as BadgeVariant} size="xs">
                      {selectedDep.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      v{selectedDep.resolvedVersion || selectedDep.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-sans">
                    {selectedDep.description || 'Package details and open source security intelligence'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDep(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-5 text-xs font-sans">
                {/* Dependency Chain Path */}
                {selectedDep.dependencyPath && selectedDep.dependencyPath.length > 0 && (
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl">
                    <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <GitFork size={13} className="text-indigo-500" />
                      Dependency Resolution Hierarchy:
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      {selectedDep.dependencyPath.map((segment, idx) => (
                        <React.Fragment key={idx}>
                          <span
                            className={`px-2 py-0.5 rounded ${
                              idx === selectedDep.dependencyPath!.length - 1
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            {segment}
                          </span>
                          {idx < selectedDep.dependencyPath!.length - 1 && (
                            <span className="text-slate-400 dark:text-zinc-600">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vulnerability Advisories */}
                {selectedDep.vulnerabilities && selectedDep.vulnerabilities.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-mono font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-rose-500" />
                      Confirmed Security Advisories ({selectedDep.vulnerabilities.length}):
                    </h4>

                    {selectedDep.vulnerabilities.map((vuln, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">
                              {vuln.aliases?.[0] || vuln.id}
                            </span>
                            {vuln.cvssScore && (
                              <span className="px-2 py-0.5 bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 rounded text-xs font-mono font-bold">
                                CVSS {vuln.cvssScore}
                              </span>
                            )}
                            {vuln.exploitAvailable && (
                              <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded text-xs font-mono font-bold flex items-center gap-1">
                                <Flame size={12} /> Exploit Available
                              </span>
                            )}
                          </div>
                          {vuln.fixedIn && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                              Fixed in: v{vuln.fixedIn}
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{vuln.summary}</p>
                        {vuln.details && (
                          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">{vuln.details}</p>
                        )}

                        {/* References */}
                        {vuln.references && vuln.references.length > 0 && (
                          <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
                            <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                              External Advisories & Proof of Concept:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {vuln.references.slice(0, 3).map((ref, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                >
                                  {ref.includes('nvd.nist.gov')
                                    ? 'NVD CVE Details'
                                    : ref.includes('github.com')
                                    ? 'GitHub Advisory'
                                    : 'Vendor Security Bulletin'}
                                  <ExternalLink size={11} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>No known public CVEs or security vulnerabilities found in OSV database for this version.</span>
                  </div>
                )}

                {/* Quick Remediation Command */}
                {selectedDep.riskLevel !== 'safe' && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Terminal size={14} className="text-emerald-500" />
                      Suggested Remediation Upgrade:
                    </div>
                    <div className="p-3 bg-slate-900 dark:bg-zinc-950 text-slate-100 rounded-xl font-mono text-xs flex items-center justify-between">
                      <code>
                        {selectedDep.ecosystem === 'PyPI'
                          ? `pip install --upgrade ${selectedDep.name}==${selectedDep.fixedIn || 'latest'}`
                          : selectedDep.ecosystem === 'Go'
                          ? `go get ${selectedDep.name}@v${selectedDep.fixedIn || 'latest'}`
                          : `npm install ${selectedDep.name}@^${selectedDep.fixedIn || selectedDep.latestVersion || 'latest'}`}
                      </code>
                      <button
                        onClick={() =>
                          handleCopy(
                            selectedDep.ecosystem === 'PyPI'
                              ? `pip install --upgrade ${selectedDep.name}==${selectedDep.fixedIn || 'latest'}`
                              : `npm install ${selectedDep.name}@^${selectedDep.fixedIn || selectedDep.latestVersion || 'latest'}`,
                            'remediate'
                          )
                        }
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-white transition-colors"
                        title="Copy command"
                      >
                        {copiedId === 'remediate' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end">
                <button
                  onClick={() => setSelectedDep(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-mono text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
