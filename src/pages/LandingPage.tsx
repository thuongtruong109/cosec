import React from 'react';
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
  ShieldAlert
} from 'lucide-react';

interface LandingPageProps {
  onStartUpload: () => void;
  onExploreDemo: () => void;
}

export default function LandingPage({ onStartUpload, onExploreDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium">
          <Sparkles size={14} />
          <span>Next-Gen Senior AI Code Reviewer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Understand Your Code. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Fix Problems Before Production.
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AI-powered code review platform that automatically detects security vulnerabilities, performance bottlenecks, architectural flaws, and subtle bugs across your entire repository.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Analyze Your Code</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FileCode size={16} className="text-indigo-400" />
            <span>Explore Demo Project (Payment API)</span>
          </button>
        </div>

        {/* Supported Tech Badges */}
        <div className="pt-8 flex flex-wrap justify-center gap-2 text-xs font-mono text-zinc-500">
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">TypeScript</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">JavaScript</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">Python</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">Java</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">Go</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">Rust</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">SQL</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800">C# / C++</span>
        </div>
      </div>

      {/* Realistic Dashboard Preview Frame */}
      <div className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden backdrop-blur">
          {/* Mock Top bar */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-zinc-400">CodeLens AI Reviewer — payment-api</span>
            </div>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
              Live Interactive Preview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Ring Preview */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray="263.8"
                    strokeDashoffset="47.4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">82</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    / 100 Health
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-emerald-400">Grade: B+ (Good)</div>
            </div>

            {/* Finding Card Preview 1 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase font-mono">
                  CRITICAL
                </span>
                <span className="text-xs text-zinc-500 font-mono">src/controllers/auth.ts:14</span>
              </div>
              <h4 className="font-semibold text-zinc-100 text-sm">SQL Injection Vulnerability</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct concatenation of user input into raw SQL string allows remote authentication bypass.
              </p>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400">
                + const user = await db.query(sql, [username, password]);
              </div>
            </div>

            {/* Finding Card Preview 2 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                  HIGH
                </span>
                <span className="text-xs text-zinc-500 font-mono">services/reconciliation.py:7</span>
              </div>
              <h4 className="font-semibold text-zinc-100 text-sm">Exposed AWS Credentials</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AWS Secret Key in plain text. Move keys to environment variables.
              </p>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400">
                + AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16 w-full border-t border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Multi-Dimensional Code Intelligence
          </h2>
          <p className="text-zinc-400 text-sm">
            CodeLens AI doesn't just scan for syntax syntax errors. It analyzes architecture, security, performance, and maintainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">AI Security Review</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Detects OWASP vulnerabilities, hardcoded API secrets, SQL injections, insecure JWT verification, SSRF, XSS, and authorization gaps.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GitBranch size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">Architecture Insights</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates an interactive dependency graph across frontend, API, auth, services, and database layers to detect circular dependencies and tight coupling.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">Automated Fixes & Diffs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates secure code replacements and side-by-side diff previews so you can accept and copy production-ready code with 1-click.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">AI Codebase Chat</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ask deep questions about your repository structure, payment flows, or authentication logic and receive exact line-number answers.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">Refactoring Assistant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Optimize function performance, reduce cyclomatic complexity, enforce type safety, and apply modern design patterns effortlessly.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bug size={20} />
            </div>
            <h3 className="font-semibold text-zinc-100 text-base">Automated Test Generation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate complete unit and integration test suites using Vitest, Jest, PyTest, or Go Test for any function or controller file.
            </p>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="max-w-5xl mx-auto px-6 py-16 w-full border-t border-zinc-800/80">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-white">How CodeLens AI Works</h2>
          <p className="text-zinc-400 text-xs font-mono">Seamless 4-step workflow</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
          <div className="p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto font-mono">
              1
            </div>
            <h4 className="font-semibold text-zinc-200 text-sm">Upload</h4>
            <p className="text-xs text-zinc-400">Upload a repository ZIP, single files, or paste code directly.</p>
          </div>

          <div className="p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto font-mono">
              2
            </div>
            <h4 className="font-semibold text-zinc-200 text-sm">Analyze</h4>
            <p className="text-xs text-zinc-400">Gemini AI inspects files, security rules, and dependency structures.</p>
          </div>

          <div className="p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto font-mono">
              3
            </div>
            <h4 className="font-semibold text-zinc-200 text-sm">Review</h4>
            <p className="text-xs text-zinc-400">Inspect the IDE Code Explorer, highlighted line issues, and side-by-side diffs.</p>
          </div>

          <div className="p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto font-mono">
              4
            </div>
            <h4 className="font-semibold text-zinc-200 text-sm">Fix & Export</h4>
            <p className="text-xs text-zinc-400">Accept recommended fixes and export team executive PDF reports.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 font-mono">
        CodeLens AI — Senior AI Code Reviewer Platform
      </footer>
    </div>
  );
}
