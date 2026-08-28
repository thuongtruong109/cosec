import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Bug, 
  GitBranch, 
  Terminal, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Lock, 
  Cpu, 
  MessageSquare,
  FileCode,
  ShieldAlert,
  Play,
  Check,
  Flame,
  Layers,
  ChevronRight,
  ChevronDown,
  Code2,
  FileText,
  Workflow,
  Search,
  Crosshair,
  KeyRound,
  Network,
  RefreshCw,
  GitPullRequest
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from '../components/common/ThemeToggle';
import GitHubUserMenu from '../components/GitHubUserMenu';
import { BrandIcon } from '../components/common/BrandIcon';

interface LandingPageProps {
  onStartUpload: () => void;
  onExploreDemo: () => void;
}

export default function LandingPage({ onStartUpload, onExploreDemo }: LandingPageProps) {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'vulnerable' | 'fixed'>('vulnerable');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeThreatCategory, setActiveThreatCategory] = useState<string>('all');

  const techBadges = [
    'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'SQL', 'C#', 'Docker'
  ];

  const securityThreats = [
    {
      id: 'cwe-89',
      cwe: 'CWE-89',
      title: 'SQL Injection & Taint Tracking',
      desc: 'Traces untrusted user inputs into SQL string concatenations and queries without parameters.',
      category: 'injection',
      severity: 'Critical',
      detectedRate: '100%'
    },
    {
      id: 'cwe-798',
      cwe: 'CWE-798',
      title: 'Hardcoded Cryptographic Secrets',
      desc: 'Detects high-entropy private keys, JWT signing secrets, Stripe, and AWS tokens.',
      category: 'secrets',
      severity: 'Critical',
      detectedRate: '100%'
    },
    {
      id: 'cwe-918',
      cwe: 'CWE-918',
      title: 'Server-Side Request Forgery (SSRF)',
      desc: 'Flags unvalidated outbound HTTP requests fetching internal metadata services.',
      category: 'injection',
      severity: 'High',
      detectedRate: '99.4%'
    },
    {
      id: 'cwe-79',
      cwe: 'CWE-79',
      title: 'Cross-Site Scripting (XSS)',
      desc: 'Identifies dangerouslySetInnerHTML and direct HTML interpolation without sanitization.',
      category: 'injection',
      severity: 'High',
      detectedRate: '99.2%'
    },
    {
      id: 'cwe-22',
      cwe: 'CWE-22',
      title: 'Path Traversal & Unsafe I/O',
      desc: 'Catches relative path manipulation escaping root directories in file storage handlers.',
      category: 'storage',
      severity: 'High',
      detectedRate: '98.8%'
    },
    {
      id: 'cwe-1321',
      cwe: 'CWE-1321',
      title: 'Prototype Pollution & Deserialization',
      desc: 'Analyzes recursive object mergers and unvetted payload deserialization.',
      category: 'logic',
      severity: 'High',
      detectedRate: '97.5%'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Deep AST & Taint Flow Tracking',
      desc: 'Parses repositories into AST abstract syntax trees, tracing inputs from HTTP handlers straight to database sinks.',
      icon: Crosshair
    },
    {
      step: '02',
      title: 'Context-Aware Diagnostic Synthesis',
      desc: 'Evaluates architectural boundaries, cyclic dependencies, error resilience, and supply chain vulnerabilities.',
      icon: Cpu
    },
    {
      step: '03',
      title: 'Deterministic Patches & Test Suites',
      desc: 'Generates production-grade refactoring diffs and instant unit tests in Vitest, Jest, and PyTest.',
      icon: Zap
    }
  ];

  const comparisonRows = [
    {
      feature: 'AST-Based Source-to-Sink Taint Tracking',
      colens: true,
      linters: false,
      rawLlm: 'Hallucination Prone'
    },
    {
      feature: 'Repository-Wide Architecture Topology',
      colens: true,
      linters: false,
      rawLlm: false
    },
    {
      feature: 'Deterministic 1-Click Code Diff Patches',
      colens: true,
      linters: 'Rules Only',
      rawLlm: 'Untested Text'
    },
    {
      feature: 'Automated Vitest / Jest Unit Test Generation',
      colens: true,
      linters: false,
      rawLlm: 'Partial'
    },
    {
      feature: 'OSV Known Vulnerability Supply Chain Audit',
      colens: true,
      linters: 'Manual Snyk',
      rawLlm: false
    },
    {
      feature: 'Zero External Code Leakage & Privacy First',
      colens: true,
      linters: true,
      rawLlm: 'Risk'
    }
  ];

  const faqs = [
    {
      q: 'How does Colens differ from standard linters like ESLint or SonarQube?',
      a: 'Traditional linters check individual files against static regex patterns or rigid local rules. Colens combines full AST parsing, cross-file data flow taint analysis (from API entry points to database sinks), and AI synthesis to understand system context, architecture topology, and supply-chain vulnerabilities.'
    },
    {
      q: 'Can I review my private GitHub repositories safely?',
      a: 'Yes. Colens connects via secure GitHub Personal Access Tokens and client-side ZIP uploads. Your code is analyzed within sandboxed memory and never used for public model training.'
    },
    {
      q: 'What languages and frameworks are currently supported?',
      a: 'Colens provides deep AST analysis and security rules for TypeScript, JavaScript, Python, SQL, Go, Rust, Java, and C#, along with package manifest auditing for npm/yarn, PyPI, and Go modules.'
    },
    {
      q: 'Does Colens provide patch proposals that I can review before applying?',
      a: 'Yes. Every finding in the Refactor and Issues tab provides a side-by-side Monaco diff preview, a detailed explanation of the fix, and an instant 1-click apply action.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-150">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onExploreDemo}>
          <div className="text-slate-900 dark:text-white">
            <BrandIcon size={22} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Colens</span>
            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-semibold">
              v2.0
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <ThemeToggle showDropdown={true} />
          <GitHubUserMenu onOpenRepoSelect={onStartUpload} compact={true} />
          
          <button
            onClick={onExploreDemo}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Live Demo</span>
          </button>

          <button
            onClick={onStartUpload}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Analyze Code</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center space-y-5 relative z-10">
        {/* Floating Release Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-mono shadow-xs"
        >
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600"></span>
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">AI Code Review &amp; Security Engine</span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-slate-500 dark:text-zinc-400">AST Taint &amp; Architecture</span>
        </motion.div>

        {/* Distinctive Hero Headline with Modern Font */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto leading-[1.12]"
        >
          Ship Secure Code.{' '}
          <span className="text-slate-500 dark:text-zinc-400 font-bold">
            Zero Vulnerabilities.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
        >
          Automated AST taint tracking, OWASP vulnerability diagnostics, architecture topology maps, and 1-click refactoring in seconds.
        </motion.p>

        {/* Hero CTA Action Group - Compact & Sophisticated */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1"
        >
          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Analyze Your Repository</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Play size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span>Test-Drive Demo (Payment API)</span>
          </button>
        </motion.div>

        {/* 3 Value Metrics Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-1 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs font-mono text-slate-500 dark:text-zinc-400"
        >
          <div className="flex items-center space-x-1.5">
            <Zap size={13} className="text-amber-500" />
            <span>&lt; 2.5s AST Scan</span>
          </div>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-1.5">
            <Lock size={13} className="text-rose-500" />
            <span>OWASP &amp; CWE Coverage</span>
          </div>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-1.5">
            <CheckCircle size={13} className="text-emerald-500" />
            <span>1-Click Patch Generation</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Hero Live Code Scanner Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-md overflow-hidden relative">
          {/* IDE Window Title Bar */}
          <div className="bg-slate-100/80 dark:bg-zinc-950/80 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                <FileCode size={13} className="text-slate-500 dark:text-zinc-400" />
                <span>src/controllers/auth.controller.ts</span>
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-white dark:bg-zinc-900 p-0.5 rounded-md border border-slate-200 dark:border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setActiveSnippetTab('vulnerable')}
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
                  activeSnippetTab === 'vulnerable'
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-semibold'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                <ShieldAlert size={11} className="text-rose-500" />
                <span>Vulnerable</span>
              </button>
              <button
                onClick={() => setActiveSnippetTab('fixed')}
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
                  activeSnippetTab === 'fixed'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>AI Patched</span>
              </button>
            </div>
          </div>

          {/* Code Window Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[220px]">
            {/* Code lines */}
            <div className="lg:col-span-8 p-4 font-mono text-xs overflow-x-auto bg-slate-50 dark:bg-zinc-950/60 leading-relaxed text-slate-800 dark:text-zinc-200">
              <AnimatePresence mode="wait">
                {activeSnippetTab === 'vulnerable' ? (
                  <motion.div
                    key="vuln"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1"
                  >
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">01</span><span className="text-purple-600 dark:text-purple-400">export async function</span> loginUser(req: Request, res: Response) &#123;</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">02</span>  <span className="text-purple-600 dark:text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">03</span></div>
                    <div className="bg-rose-500/10 dark:bg-rose-950/30 -mx-4 px-4 py-0.5 border-l-2 border-rose-500 text-rose-800 dark:text-rose-300">
                      <span className="select-none mr-3 text-slate-400 dark:text-zinc-600">04</span>
                      <span>  <span className="text-purple-600 dark:text-purple-400">const</span> query = <span className="text-amber-700 dark:text-amber-300">{`\`SELECT * FROM users WHERE user = '\${username}'\``}</span>;</span>
                    </div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">05</span>  <span className="text-purple-600 dark:text-purple-400">const</span> result = <span className="text-purple-600 dark:text-purple-400">await</span> db.raw(query);</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">06</span>  <span className="text-purple-600 dark:text-purple-400">return</span> res.json(result.rows[0]);</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">07</span>&#125;</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="fixed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1"
                  >
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">01</span><span className="text-purple-600 dark:text-purple-400">export async function</span> loginUser(req: Request, res: Response) &#123;</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">02</span>  <span className="text-purple-600 dark:text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">03</span></div>
                    <div className="bg-emerald-500/10 dark:bg-emerald-950/30 -mx-4 px-4 py-0.5 border-l-2 border-emerald-500 text-emerald-800 dark:text-emerald-300">
                      <span className="select-none mr-3 text-slate-400 dark:text-zinc-600">04</span>
                      <span>  <span className="text-purple-600 dark:text-purple-400">const</span> query = <span className="text-amber-700 dark:text-amber-300">'SELECT * FROM users WHERE user = $1'</span>;</span>
                    </div>
                    <div className="bg-emerald-500/10 dark:bg-emerald-950/30 -mx-4 px-4 py-0.5 border-l-2 border-emerald-500 text-emerald-800 dark:text-emerald-300">
                      <span className="select-none mr-3 text-slate-400 dark:text-zinc-600">05</span>
                      <span>  <span className="text-purple-600 dark:text-purple-400">const</span> result = <span className="text-purple-600 dark:text-purple-400">await</span> db.query(query, [username]);</span>
                    </div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">06</span>  <span className="text-purple-600 dark:text-purple-400">return</span> res.json(result.rows[0]);</div>
                    <div className="text-slate-500 dark:text-zinc-500"><span className="select-none mr-3 text-slate-400 dark:text-zinc-600">07</span>&#125;</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Telemetry Radar Box */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    AST Taint Flow
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold">
                    CWE-89
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">SQL String Interpolation</h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Source: <code className="text-indigo-600 dark:text-indigo-400">req.body.username</code> &rarr; Sink: <code className="text-rose-600 dark:text-rose-400">db.raw(query)</code>
                  </p>
                </div>
              </div>

              <button
                onClick={onExploreDemo}
                className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-medium text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Inspect in Live Demo</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: OWASP TOP 10 & CWE THREAT COVERAGE MATRIX */}
      <section className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Security Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                OWASP Top 10 &amp; CWE Diagnostic Coverage
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl">
                Deterministic detection engines check for vulnerabilities across injection, cryptography, authentication, and logic flaws.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-mono bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-bold shadow-xs">
                100+ Rules
              </span>
              <span className="px-2 py-0.5 text-slate-500 dark:text-zinc-400">
                AST Verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {securityThreats.map((threat) => (
              <div
                key={threat.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-indigo-400 dark:hover:border-zinc-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
                    {threat.cwe}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    threat.severity === 'Critical' 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {threat.severity}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {threat.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
                    {threat.desc}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  <span>Accuracy Benchmark</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{threat.detectedRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: 3-STEP REVIEW & REMEDIATE WORKFLOW */}
      <section className="border-t border-slate-200 dark:border-zinc-800 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Audit Pipeline
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From Commit to Verified Clean Build
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              A comprehensive three-stage analysis pipeline executed directly in sandboxed memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowSteps.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.step}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-slate-400 dark:text-zinc-600">
                      {w.step}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {w.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {w.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURE & HEALTH PILLARS */}
      <section className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-1 max-w-lg mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Senior Engineering Teams
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="p-1.5 w-fit rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Lock size={15} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Security &amp; OWASP</h3>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                AST taint flows, token exposure, and input sanitization boundaries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="p-1.5 w-fit rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Layers size={15} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Architecture Topology</h3>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Graph dependencies, isolate layer violations, and spot circular smells.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="p-1.5 w-fit rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap size={15} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">1-Click Refactor Diffs</h3>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Production-ready diffs with side-by-side Monaco code comparisons.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="p-1.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={15} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Unit Test Synthesis</h3>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Generates full Vitest, Jest, and PyTest suites for any analyzed module.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMPARISON MATRIX */}
      <section className="border-t border-slate-200 dark:border-zinc-800 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1 max-w-lg mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Benchmark Comparison
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why Teams Choose Colens AI
            </h2>
          </div>

          <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-zinc-900">
            <div className="grid grid-cols-12 bg-slate-100/70 dark:bg-zinc-950 p-3 text-xs font-mono font-bold border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
              <div className="col-span-6">Audit Capability</div>
              <div className="col-span-2 text-center text-indigo-600 dark:text-indigo-400">Colens AI</div>
              <div className="col-span-2 text-center text-slate-500">Linters</div>
              <div className="col-span-2 text-center text-slate-500">Raw Chat LLM</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {comparisonRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50 dark:hover:bg-zinc-950/30">
                  <div className="col-span-6 font-medium text-slate-800 dark:text-zinc-200 text-[11px] sm:text-xs">
                    {row.feature}
                  </div>
                  <div className="col-span-2 text-center flex justify-center">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check size={14} />
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                    {typeof row.linters === 'boolean' ? (
                      row.linters ? (
                        <span className="text-emerald-500 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600">—</span>
                      )
                    ) : (
                      row.linters
                    )}
                  </div>
                  <div className="col-span-2 text-center text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                    {typeof row.rawLlm === 'boolean' ? (
                      row.rawLlm ? (
                        <span className="text-emerald-500 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600">—</span>
                      )
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">{row.rawLlm}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
      <section className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Questions &amp; Architecture
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="px-3.5 pb-3.5 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/80 pt-2.5"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Language ecosystem banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full text-center space-y-3 border-t border-slate-200 dark:border-zinc-800">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-500">Supported Tech Stacks</span>
        <div className="flex flex-wrap justify-center gap-1.5 text-xs font-mono">
          {techBadges.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-5 text-center text-xs text-slate-500 dark:text-zinc-500 font-mono flex items-center justify-center space-x-2">
        <BrandIcon size={14} />
        <span>Colens AI — Senior AI Code Reviewer &amp; Security Architecture Engine</span>
      </footer>
    </div>
  );
}
