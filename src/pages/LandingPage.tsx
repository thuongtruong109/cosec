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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onStartUpload: () => void;
  onExploreDemo: () => void;
}

export default function LandingPage({ onStartUpload, onExploreDemo }: LandingPageProps) {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'vulnerable' | 'fixed'>('vulnerable');
  const [isScanning, setIsScanning] = useState(true);

  // Periodic simulated scanning loop for the hero demo
  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning((prev) => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const techBadges = [
    'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'SQL', 'C#'
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Animated Ambient Lights */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 rounded-full blur-[140px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [20, -20, 20],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-40 -left-20 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" 
      />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-16 text-center space-y-7 relative z-10">
        {/* Floating Release Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-mono backdrop-blur-md shadow-lg shadow-indigo-500/10"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="font-semibold text-zinc-200">AI Code Reviewer 2.0</span>
          <span className="text-zinc-600">•</span>
          <span className="text-indigo-400 font-medium">OWASP Top 10 & Architecture</span>
        </motion.div>

        {/* Punchy Concise Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.08]"
        >
          Ship Flawless Code.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Zero Vulnerabilities.
          </span>
        </motion.h1>

        {/* Concise Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Instant deep AST code analysis, automated security patches, dependency graphs, and test generation in seconds.
        </motion.p>

        {/* Hero CTA Action Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
        >
          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Analyze Your Code</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
          >
            <Play size={15} className="text-indigo-400 fill-indigo-400/20" />
            <span>Test-Drive Demo (Payment API)</span>
          </button>
        </motion.div>

        {/* 3 Value Metrics Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-4 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs font-mono text-zinc-400"
        >
          <div className="flex items-center space-x-2">
            <Zap size={14} className="text-amber-400" />
            <span>&lt; 3.2s Full Scan</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-2">
            <Lock size={14} className="text-rose-400" />
            <span>100+ Security Rules</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>1-Click AI Patches</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Hero Live Code Scanner Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="max-w-5xl mx-auto px-6 pb-20 w-full"
      >
        <div className="bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl relative group">
          {/* Laser Scanning Animation Beam */}
          <motion.div
            animate={{
              y: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20 pointer-events-none opacity-80"
          />

          {/* IDE Window Title Bar */}
          <div className="bg-zinc-950/80 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <FileCode size={13} className="text-indigo-400" />
                <span>src/controllers/auth.controller.ts</span>
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setActiveSnippetTab('vulnerable')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeSnippetTab === 'vulnerable'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert size={12} className="text-rose-400" />
                <span>Vulnerable</span>
              </button>
              <button
                onClick={() => setActiveSnippetTab('fixed')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeSnippetTab === 'fixed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>AI Patched</span>
              </button>
            </div>
          </div>

          {/* Code Window Body with Floating Threat Detection Pin */}
          <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[260px]">
            {/* Code lines */}
            <div className="lg:col-span-8 p-5 font-mono text-xs overflow-x-auto bg-zinc-950/60 leading-relaxed">
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
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">01</span><span className="text-purple-400">export async function</span> <span className="text-indigo-300">loginUser</span>(req: Request, res: Response) &#123;</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">02</span>  <span className="text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">03</span></div>
                    {/* Vulnerable highlight line */}
                    <div className="bg-rose-950/30 -mx-5 px-5 py-0.5 border-l-2 border-rose-500 text-rose-300 flex items-center">
                      <span className="text-zinc-600 select-none mr-4">04</span>
                      <span>  <span className="text-purple-400">const</span> query = <span className="text-amber-300">{`\`SELECT * FROM users WHERE user = '\${username}' AND pass = '\${password}'\``}</span>;</span>
                    </div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">05</span>  <span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> db.raw(query);</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">06</span>  <span className="text-purple-400">return</span> res.json(result.rows[0]);</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">07</span>&#125;</div>
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
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">01</span><span className="text-purple-400">export async function</span> <span className="text-indigo-300">loginUser</span>(req: Request, res: Response) &#123;</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">02</span>  <span className="text-purple-400">const</span> &#123; username, password &#125; = req.body;</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">03</span></div>
                    {/* Fixed highlight line */}
                    <div className="bg-emerald-950/30 -mx-5 px-5 py-0.5 border-l-2 border-emerald-500 text-emerald-300 flex items-center">
                      <span className="text-zinc-600 select-none mr-4">04</span>
                      <span>  <span className="text-purple-400">const</span> query = <span className="text-amber-300">'SELECT * FROM users WHERE user = $1 AND pass = $2'</span>;</span>
                    </div>
                    <div className="bg-emerald-950/30 -mx-5 px-5 py-0.5 border-l-2 border-emerald-500 text-emerald-300 flex items-center">
                      <span className="text-zinc-600 select-none mr-4">05</span>
                      <span>  <span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> db.query(query, [username, password]);</span>
                    </div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">06</span>  <span className="text-purple-400">return</span> res.json(result.rows[0]);</div>
                    <div className="text-zinc-500"><span className="text-zinc-600 select-none mr-4">07</span>&#125;</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Telemetry Radar Box */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-zinc-800/80 p-5 bg-zinc-900/70 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>Real-Time AST Triage</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                    CWE-89
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white">SQL String Concatenation</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Unsanitized parameters in query construction allow remote authentication bypass.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>Confidence</span>
                    <span className="text-emerald-400 font-bold">99.4%</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Severity</span>
                    <span className="text-rose-400 font-bold">CRITICAL</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onExploreDemo}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Core Value Pillars (Clean & Minimalist) */}
      <div className="max-w-6xl mx-auto px-6 py-14 w-full border-t border-zinc-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">Security & OWASP</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Detects SQL injections, token leaks, SSRF, XSS, and authorization bypasses.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">Architecture Visualizer</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interactive node topology maps layers, services, and circular dependency risks.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">1-Click Auto Patches</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Accept production-grade diff fixes directly into your codebase in seconds.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">Automated Test Suites</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates Vitest, Jest, PyTest, and Go unit tests for any function automatically.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Language ecosystem banner */}
      <div className="max-w-6xl mx-auto px-6 pb-16 w-full text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Supports Modern Tech Stacks</span>
        <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
          {techBadges.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 hover:border-indigo-500/40 hover:text-white transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 font-mono">
        CodeLens AI — Senior AI Code Reviewer & Architecture Engine
      </footer>
    </div>
  );
}
