import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Server,
  Globe,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Network,
  Cpu,
  Boxes,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  FileCode,
  Zap,
  Radio,
  ExternalLink,
  Code2,
  CornerDownRight,
  Activity,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, ArchitectureNode, ArchitectureEdge, ArchitecturalSmell } from '../types';
import PageHeader from '../components/common/PageHeader';
import Badge, { BadgeVariant } from '../components/common/Badge';

interface ArchitectureViewProps {
  analysis: AnalysisResult | null;
  onAskAIAboutArchitecture: () => void;
}

export default function ArchitectureView({
  analysis,
  onAskAIAboutArchitecture,
}: ArchitectureViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topology' | 'traces' | 'coupling' | 'smells'>('topology');
  const [layerFilter, setLayerFilter] = useState<'all' | '0' | '1' | '2' | '3' | '4'>('all');
  const [selectedTraceId, setSelectedTraceId] = useState<string>('trace-payment');

  if (!analysis) {
    return (
      <div className="p-10 text-center text-zinc-400 font-mono text-xs">
        No architecture data available. Please upload or select a project first.
      </div>
    );
  }

  const { architectureNodes = [], architectureEdges = [], architecturalSmells = [] } = analysis;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return Globe;
      case 'api':
        return Server;
      case 'auth':
        return Lock;
      case 'services':
        return Cpu;
      case 'database':
        return Database;
      case 'queue':
        return Activity;
      case 'external':
        return Radio;
      default:
        return Layers;
    }
  };

  const getLayerName = (layer?: number) => {
    switch (layer) {
      case 0:
        return 'Layer 0: Presentation & Web Client';
      case 1:
        return 'Layer 1: Ingress Gateway & Routes';
      case 2:
        return 'Layer 2: Domain Services & Controllers';
      case 3:
        return 'Layer 3: Persistence & Async Queues';
      case 4:
        return 'Layer 4: External Egress & Cloud APIs';
      default:
        return 'Application Layer';
    }
  };

  const getStatusBorder = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30';
    }
    switch (status) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 hover:border-rose-500';
      case 'warning':
        return 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:border-amber-500';
      default:
        return 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700';
    }
  };

  // Group nodes by layer
  const nodesByLayer = useMemo(() => {
    const map: Record<number, ArchitectureNode[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    architectureNodes.forEach((node) => {
      const layer = node.layer !== undefined ? node.layer : (node.type === 'frontend' ? 0 : node.type === 'api' ? 1 : node.type === 'database' ? 3 : node.type === 'external' ? 4 : 2);
      if (!map[layer]) map[layer] = [];
      map[layer].push(node);
    });
    return map;
  }, [architectureNodes]);

  // Currently selected node object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return architectureNodes[0] || null;
    return architectureNodes.find((n) => n.id === selectedNodeId) || null;
  }, [architectureNodes, selectedNodeId]);

  // Associated edges for selected node
  const relatedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return architectureEdges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
  }, [architectureEdges, selectedNode]);

  // Pre-configured deep Execution Traces
  const executionTraces = useMemo(() => {
    return [
      {
        id: 'trace-payment',
        name: 'End-to-End Payment & Settlement Flow',
        description: 'Client checkout request dispatching to Stripe API, updating database ledger, and scheduling async batch reconciliation',
        hops: [
          { node: 'Client / React SPA', action: 'User initiates checkout with card token', type: 'frontend' },
          { node: 'API Gateway', action: 'POST /payment/charge (CORS & Route Dispatch)', type: 'api' },
          { node: 'Payment & Billing Controller', action: 'processPayment() orchestrates charge & ledger write', type: 'services' },
          { node: 'Stripe API Gateway', action: 'POST https://api.stripe.com/v1/charges', type: 'external' },
          { node: 'PostgreSQL Relational DB', action: 'UPDATE user_accounts balance & INSERT audit_logs', type: 'database' },
          { node: 'Python Reconciliation Worker', action: 'Queue event triggers daily ledger audit & S3 cloud archive', type: 'queue' },
        ],
        risk: 'high',
        riskSummary: 'N+1 query iteration inside payment transaction + shared PostgreSQL connection pool between microservices.',
      },
      {
        id: 'trace-auth',
        name: 'User Authentication & JWT Issuance Trace',
        description: 'Login form credential verification and stateless token generation',
        hops: [
          { node: 'Client / React SPA', action: 'LoginForm submits username and password payload', type: 'frontend' },
          { node: 'API Gateway', action: 'POST /auth/login (Unvalidated JSON body)', type: 'api' },
          { node: 'Auth & JWT Service', action: 'loginUser() executes raw SQL query & jwt.sign()', type: 'auth' },
          { node: 'PostgreSQL Relational DB', action: 'SELECT * FROM users WHERE username = \'$1\' (Direct SQL Concatenation)', type: 'database' },
        ],
        risk: 'critical',
        riskSummary: 'Direct SQL string concatenation in loginUser leading to full authentication bypass (CWE-89) and hardcoded secret key.',
      },
      {
        id: 'trace-reconciliation',
        name: 'Batch Transaction Reconciliation & Cloud Export',
        description: 'Nightly asynchronous financial audit and cloud backup pipeline',
        hops: [
          { node: 'Payment & Billing Controller', action: 'Export daily transaction batch dump', type: 'services' },
          { node: 'Python Reconciliation Worker', action: 'reconcile_daily_transactions() consumes pickle payload', type: 'queue' },
          { node: 'PostgreSQL Relational DB', action: 'SELECT audit verification queries on database pool', type: 'database' },
          { node: 'AWS Cloud Services (S3/IAM)', action: 'boto3.client("s3").put_object() with hardcoded credentials', type: 'external' },
        ],
        risk: 'critical',
        riskSummary: 'Insecure Python pickle deserialization (RCE vulnerability) and hardcoded AWS IAM secret access keys in worker script.',
      },
    ];
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Multi-Tier Architecture & Module Coupling"
        subtitle={`Repository call graph, inter-module dependencies & architectural smells for ${analysis.projectName}`}
        icon={<GitFork size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onAskAIAboutArchitecture}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Consult AI Architect</span>
            </button>
          </div>
        }
      />

      {/* Navigation View Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-zinc-900 p-2 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'topology'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Boxes size={14} />
            <span>Full System Topology ({architectureNodes.length} Nodes)</span>
          </button>

          <button
            onClick={() => setActiveTab('traces')}
            className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'traces'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Zap size={14} />
            <span>End-to-End Traces ({executionTraces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupling')}
            className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'coupling'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Network size={14} />
            <span>Inter-Module Edges ({architectureEdges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('smells')}
            className={`px-3.5 py-2 text-xs font-mono rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'smells'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Architectural Smells ({architecturalSmells.length})</span>
          </button>
        </div>

        {activeTab === 'topology' && (
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Layer:</span>
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value as any)}
              className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Layers (0 - 4)</option>
              <option value="0">Layer 0: Frontend / Client</option>
              <option value="1">Layer 1: Gateway & Routes</option>
              <option value="2">Layer 2: Services & Logic</option>
              <option value="3">Layer 3: DB & Queues</option>
              <option value="4">Layer 4: External Egress</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: SYSTEM TOPOLOGY (Multi-Tier Interactive Canvas) */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Multi-Layer Graph Column (2 spans) */}
          <div className="lg:col-span-2 space-y-6">
            {[0, 1, 2, 3, 4].map((layerIdx) => {
              if (layerFilter !== 'all' && layerFilter !== String(layerIdx)) return null;
              const nodesInLayer = nodesByLayer[layerIdx] || [];
              if (nodesInLayer.length === 0) return null;

              return (
                <div
                  key={layerIdx}
                  className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <div className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      {getLayerName(layerIdx)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      {nodesInLayer.length} component(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {nodesInLayer.map((node) => {
                      const Icon = getNodeIcon(node.type);
                      const isSelected = selectedNode?.id === node.id;

                      return (
                        <motion.div
                          key={node.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${getStatusBorder(
                            node.status,
                            isSelected
                          )}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Icon size={16} />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                                  {node.label}
                                </h4>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-sans">
                                  {node.type}
                                </span>
                              </div>
                            </div>

                            {node.issuesCount > 0 ? (
                              <Badge variant={node.status as BadgeVariant} size="xs">
                                {node.issuesCount} Alert(s)
                              </Badge>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                                <CheckCircle2 size={12} /> Clean
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2.5 leading-relaxed font-sans line-clamp-2">
                            {node.details}
                          </p>

                          {/* Tech Stack Chips */}
                          {node.technologies && node.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/60">
                              {node.technologies.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Connections summary */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-2">
                            <span>Outbound: {node.connections.length} target(s)</span>
                            {node.files && (
                              <span>{node.files.length} file(s)</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Component Inspector Panel (1 span) */}
          <div className="space-y-5 sticky top-6">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedNode.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                      Component Inspector
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {selectedNode.label}
                    </h3>
                  </div>
                  <Badge variant={selectedNode.status as BadgeVariant} size="xs">
                    {selectedNode.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Details Description */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mb-1">Architecture Role:</div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {selectedNode.details}
                  </p>
                </div>

                {/* Source Files Implementing Node */}
                {selectedNode.files && selectedNode.files.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                      <FileCode size={13} className="text-indigo-500" />
                      Implementing Source Files ({selectedNode.files.length}):
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      {selectedNode.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 truncate"
                        >
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Symbols Extracted */}
                {selectedNode.symbols && selectedNode.symbols.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                      <Code2 size={13} className="text-emerald-500" />
                      Exported Symbols & Handlers:
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {selectedNode.symbols.map((sym, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                        >
                          {sym}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Call Edges */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                    <Network size={13} className="text-purple-500" />
                    Inter-Component Call Edges ({relatedEdges.length}):
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {relatedEdges.length === 0 ? (
                      <div className="text-slate-400 dark:text-zinc-500 text-[10px] italic">
                        No direct edge connections mapped.
                      </div>
                    ) : (
                      relatedEdges.map((edge) => {
                        const isOutgoing = edge.source === selectedNode.id;
                        return (
                          <div
                            key={edge.id}
                            className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-700 dark:text-zinc-300">
                                {isOutgoing ? `→ Outbound to ${edge.targetLabel || edge.target}` : `← Inbound from ${edge.sourceLabel || edge.source}`}
                              </span>
                              <Badge
                                variant={edge.risk === 'critical' ? 'critical' : edge.risk === 'high' ? 'high' : edge.risk === 'medium' ? 'warning' : 'safe'}
                                size="xs"
                              >
                                {edge.risk.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                              {edge.label}
                            </div>
                            {edge.riskDetails && (
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                                {edge.riskDetails}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
                Select any architecture node on the canvas to inspect its source files, symbols, and connections.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: END-TO-END EXECUTION TRACES */}
      {activeTab === 'traces' && (
        <div className="space-y-6">
          {/* Trace Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {executionTraces.map((trace) => {
              const isSelected = selectedTraceId === trace.id;
              return (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {trace.name}
                    </span>
                    <Badge variant={trace.risk as BadgeVariant} size="xs">
                      {trace.risk.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans leading-relaxed line-clamp-2">
                    {trace.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Trace Stepper Canvas */}
          {(() => {
            const activeTrace = executionTraces.find((t) => t.id === selectedTraceId) || executionTraces[0];
            return (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                      Multi-Hop Execution Path:
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {activeTrace.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-sans">
                      {activeTrace.description}
                    </p>
                  </div>
                  <Badge variant={activeTrace.risk as BadgeVariant} size="xs">
                    {activeTrace.risk.toUpperCase()} ARCHITECTURAL RISK
                  </Badge>
                </div>

                {/* Visual Flow Hops */}
                <div className="space-y-4 font-mono">
                  {activeTrace.hops.map((hop, idx) => {
                    const HopIcon = getNodeIcon(hop.type);
                    return (
                      <div key={idx} className="relative flex items-start gap-4 group">
                        {/* Hop number & vertical line */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-md">
                            {idx + 1}
                          </div>
                          {idx < activeTrace.hops.length - 1 && (
                            <div className="w-0.5 h-12 bg-slate-200 dark:bg-zinc-800 my-1"></div>
                          )}
                        </div>

                        {/* Hop Card */}
                        <div className="flex-1 p-4 bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                          <div className="flex items-center gap-2">
                            <HopIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">
                              {hop.node}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-sans">
                              ({hop.type})
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-300 font-sans">
                            {hop.action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Risk Summary Callout */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
                  <div className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert size={15} />
                    Trace Security & Performance Risk Analysis:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
                    {activeTrace.riskSummary}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: INTER-MODULE COUPLING MATRIX */}
      {activeTab === 'coupling' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Network size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-xs font-mono uppercase tracking-wider">
                Extracted Module Coupling Matrix
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              {architectureEdges.length} Directed Graph Edges
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-mono border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Source Component</th>
                  <th className="px-5 py-3.5">Target Dependency</th>
                  <th className="px-5 py-3.5">Interaction Type</th>
                  <th className="px-5 py-3.5">Call Signature / Query</th>
                  <th className="px-5 py-3.5">Coupling Strength</th>
                  <th className="px-5 py-3.5">Architectural Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-xs">
                {architectureEdges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-mono text-xs">
                      No inter-module edges extracted from source code.
                    </td>
                  </tr>
                ) : (
                  architectureEdges.map((edge) => (
                    <tr
                      key={edge.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-zinc-100">
                        {edge.sourceLabel || edge.source}
                      </td>
                      <td className="px-5 py-3.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                        → {edge.targetLabel || edge.target}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-zinc-400 uppercase text-[10px]">
                        {edge.type}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-zinc-300">
                        <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                          {edge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-zinc-400">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            edge.strength === 'high'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : edge.strength === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {edge.strength.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              edge.risk === 'critical'
                                ? 'critical'
                                : edge.risk === 'high'
                                ? 'high'
                                : edge.risk === 'medium'
                                ? 'warning'
                                : 'safe'
                            }
                            size="xs"
                          >
                            {edge.risk.toUpperCase()}
                          </Badge>
                          {edge.riskDetails && (
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-xs font-sans">
                              {edge.riskDetails}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURAL SMELLS & ANTI-PATTERNS */}
      {activeTab === 'smells' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs font-mono uppercase tracking-wider">
                  Automated Architectural Anti-Pattern Detection ({architecturalSmells.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                Structural Clean Architecture Linter
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-4 space-y-4 font-sans text-xs">
              {architecturalSmells.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
                  No critical architectural smells or layer violations detected!
                </div>
              ) : (
                architecturalSmells.map((smell) => (
                  <div key={smell.id} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={smell.severity as BadgeVariant} size="xs">
                          {smell.severity.toUpperCase()}
                        </Badge>
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm font-mono">
                          {smell.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                        {smell.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {smell.description}
                    </p>

                    {/* Affected Components */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                        Affected Modules:
                      </span>
                      {smell.affectedNodes.map((nodeId, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          {nodeId}
                        </span>
                      ))}
                      {smell.affectedFiles.map((file, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                        >
                          {file}
                        </span>
                      ))}
                    </div>

                    {/* Recommendation */}
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold font-mono text-[11px]">Architectural Recommendation: </span>
                      <span className="leading-relaxed">{smell.recommendation}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
