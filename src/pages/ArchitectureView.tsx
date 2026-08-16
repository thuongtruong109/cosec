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
import { AnalysisResult, ArchitectureNode } from '../types';

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
        return 'border-rose-500/50 bg-rose-950/20 text-rose-300';
      case 'warning':
        return 'border-amber-500/50 bg-amber-950/20 text-amber-300';
      default:
        return 'border-zinc-800 bg-zinc-900/90 text-zinc-200';
    }
  };

  const dependencyMatrix = [
    { source: 'UI / Client SPA', target: 'API Gateway', strength: 'High Coupling (HTTP)', risk: 'Low' },
    { source: 'API Gateway', target: 'Auth Controller', strength: 'Direct Method Call', risk: 'Medium' },
    { source: 'Auth Controller', target: 'PostgreSQL DB', strength: 'Raw Driver Call (No DAO)', risk: 'High' },
    { source: 'Reconciliation', target: 'Stripe Adapter', strength: 'Async Webhook Event', risk: 'Low' },
    { source: 'Payment Controller', target: 'Audit Logger', strength: 'Event Bus Publish', risk: 'Low' },
  ];

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GitFork size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>System Topology & Dependency Matrix</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              System architecture map and module boundary coupling inspection for <span className="font-mono text-indigo-400">{analysis.projectName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onAskAIAboutArchitecture}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <MessageSquare size={14} />
          <span>Ask AI Architecture Advice</span>
        </button>
      </div>

      {/* Visual Architecture Flow Diagram */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Boxes size={14} className="text-indigo-400" />
            <span>Architectural Topology Pipeline</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Frontend → Gateway → Microservices → Database</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {nodes.slice(0, 4).map((node, index) => {
            const Icon = getNodeIcon(node.type);
            return (
              <div key={node.id} className="relative group">
                <div
                  className={`p-4 rounded-xl border ${getStatusBorder(
                    node.status
                  )} space-y-2 shadow-lg transition-all relative z-10`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
                      <Icon size={16} />
                    </div>
                    {node.issuesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {node.issuesCount} Alert(s)
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{node.label}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{node.details}</p>
                  </div>
                </div>

                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 text-zinc-600 z-20 pointer-events-none">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Component Coupling & Dependency Matrix */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Network size={16} className="text-indigo-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
              Module Boundary Coupling Matrix
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">5 Inter-Module Edge Connections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-3.5 py-2">Source Component</th>
                <th className="px-3.5 py-2">Target Dependency</th>
                <th className="px-3.5 py-2">Coupling Type</th>
                <th className="px-3.5 py-2">Architectural Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {dependencyMatrix.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedMatrixNode(item.source)}
                  className={`hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                    selectedMatrixNode === item.source ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="px-3.5 py-2 text-white font-bold">{item.source}</td>
                  <td className="px-3.5 py-2 text-indigo-300">→ {item.target}</td>
                  <td className="px-3.5 py-2 text-zinc-400">{item.strength}</td>
                  <td className="px-3.5 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.risk === 'High'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.risk === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.risk} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detected Architectural Issues Panel */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
        <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span>Detected Architectural Anti-Patterns</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
            <div className="font-bold text-amber-400 text-[11px]">TIGHT COUPLING IN AUTH CONTROLLER</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              `auth.ts` communicates directly with raw database drivers without an abstract service layer or repository interface.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
            <div className="font-bold text-amber-400 text-[11px]">CIRCULAR DEPENDENCY IN RECONCILIATION</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              `reconciliation.py` issues HTTP callbacks back to the main payment gateway API while sharing DB connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

