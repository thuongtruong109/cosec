import React, { useState } from 'react';
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
  Boxes
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult, ArchitectureNode } from '../types';
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
  const [selectedMatrixNode, setSelectedMatrixNode] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="p-10 text-center text-zinc-400 font-mono text-xs">
        No architecture data available. Please upload or select a project first.
      </div>
    );
  }

  const nodes = analysis.architectureNodes;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return Globe;
      case 'api':
        return Server;
      case 'auth':
        return Lock;
      case 'services':
        return Layers;
      case 'database':
        return Database;
      default:
        return Server;
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-rose-500/40 bg-rose-950/20 text-rose-300';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      default:
        return 'border-zinc-800 bg-zinc-900/90 text-zinc-200';
    }
  };

  const dependencyMatrix = [
    { source: 'UI / Client SPA', target: 'API Gateway', strength: 'High Coupling (HTTP/REST)', risk: 'Low' },
    { source: 'API Gateway', target: 'Auth Controller', strength: 'Direct Method Ingress', risk: 'Medium' },
    { source: 'Auth Controller', target: 'PostgreSQL DB', strength: 'Raw Driver Call (No DAO)', risk: 'High' },
    { source: 'Reconciliation', target: 'Stripe Adapter', strength: 'Async Webhook Event', risk: 'Low' },
    { source: 'Payment Controller', target: 'Audit Logger', strength: 'Event Bus Publish', risk: 'Low' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="System Topology & Component Coupling Matrix"
        subtitle={`Architectural pipeline and module boundary analysis for ${analysis.projectName}`}
        icon={<GitFork size={22} />}
        actions={
          <button
            onClick={onAskAIAboutArchitecture}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Consult AI Architect</span>
          </button>
        }
      />

      {/* Visual Architecture Flow Diagram */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Boxes size={15} className="text-indigo-400" />
            <span>Architectural Layer Topology</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Frontend → Gateway → Microservices → Database</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {nodes.slice(0, 4).map((node, index) => {
            const Icon = getNodeIcon(node.type);
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="relative group"
              >
                <div
                  className={`p-4 rounded-xl border ${getStatusBorder(
                    node.status
                  )} space-y-3 shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-indigo-400">
                      <Icon size={16} />
                    </div>
                    {node.issuesCount > 0 && (
                      <Badge variant="critical" size="xs">
                        {node.issuesCount} Alert(s)
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{node.label}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{node.details}</p>
                  </div>
                </div>

                {index < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 text-zinc-600 z-20 pointer-events-none">
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Module Boundary Coupling Matrix */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network size={16} className="text-indigo-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
              Module Boundary Coupling Matrix
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">5 Inter-Module Edge Connections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Source Component</th>
                <th className="px-4 py-2.5">Target Dependency</th>
                <th className="px-4 py-2.5">Coupling Type</th>
                <th className="px-4 py-2.5">Architectural Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {dependencyMatrix.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedMatrixNode(item.source)}
                  className={`hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                    selectedMatrixNode === item.source ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-white font-bold">{item.source}</td>
                  <td className="px-4 py-2.5 text-indigo-300">→ {item.target}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{item.strength}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant={item.risk === 'High' ? 'critical' : item.risk === 'Medium' ? 'high' : 'success'}
                      size="xs"
                    >
                      {item.risk} Risk
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detected Architectural Anti-Patterns */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span>Detected Architectural Anti-Patterns</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/90 space-y-1.5">
            <div className="font-bold text-amber-400 text-xs">TIGHT COUPLING IN AUTH CONTROLLER</div>
            <p className="text-zinc-400 leading-relaxed font-sans text-xs">
              `auth.ts` communicates directly with raw database drivers without an abstract service layer or repository interface.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/90 space-y-1.5">
            <div className="font-bold text-amber-400 text-xs">CIRCULAR DEPENDENCY IN RECONCILIATION</div>
            <p className="text-zinc-400 leading-relaxed font-sans text-xs">
              `reconciliation.py` issues HTTP callbacks back to the main payment gateway API while sharing database transaction pools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
