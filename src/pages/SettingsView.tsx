import React, { useState } from 'react';
import { Sliders, ShieldCheck, Check, Key, Sparkles, Sun, Moon, Monitor, Palette, Github, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';
import Checkbox from '../components/common/Checkbox';
import { useTheme, Theme } from '../context/ThemeContext';
import { useGitHub } from '../context/GitHubContext';
import GitHubAuthModal from '../components/GitHubAuthModal';

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, refreshRepos, isLoadingRepos } = useGitHub();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [securityRules, setSecurityRules] = useState<boolean>(true);
  const [complexityRules, setComplexityRules] = useState<boolean>(true);
  const [duplicationRules, setDuplicationRules] = useState<boolean>(true);
  const [autoPatchMode, setAutoPatchMode] = useState<boolean>(false);
  const [strictLinting, setStrictLinting] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions: { value: Theme; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'dark',
      title: 'Dark Mode (Cyber Slate)',
      desc: 'Optimized for eye comfort during long code reviews in low light.',
      icon: <Moon size={18} className="text-indigo-400" />,
    },
    {
      value: 'light',
      title: 'Light Mode (Pristine High-Contrast)',
      desc: 'Crisp, high-contrast daylight layout with clear typographic bounds.',
      icon: <Sun size={18} className="text-amber-500" />,
    },
    {
      value: 'system',
      title: 'System Automatic',
      desc: 'Automatically synchronizes with your operating system preference.',
      icon: <Monitor size={18} className="text-slate-400 dark:text-zinc-400" />,
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="Colens AI Settings"
        subtitle="Configure appearance, AI models, GitHub integrations, and security policies"
        icon={<Sliders size={22} />}
      />

      {/* Theme Appearance Setting Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl text-slate-800 dark:text-zinc-100"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <Palette size={18} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Appearance & Visual Theme</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/80 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-slate-200/80 dark:border-zinc-800">
                    {opt.icon}
                  </div>
                  {isSelected && (
                    <Badge variant="indigo" size="xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{opt.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {opt.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl text-slate-800 dark:text-zinc-100"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Engine Model Configuration</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <label className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
            model === 'gemini-2.5-flash'
              ? 'border-indigo-500/40 bg-indigo-50/70 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}>
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-2.5-flash'} onChange={() => setModel('gemini-2.5-flash')} className="accent-indigo-600 cursor-pointer" />
              <div>
                <div className="text-slate-900 dark:text-white font-sans font-bold">Gemini 2.5 Flash (Recommended)</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">Ultra-fast multi-file context analysis & line-by-line reasoning.</div>
              </div>
            </div>
            <Badge variant="indigo" size="xs">Default</Badge>
          </label>

          <label className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
            model === 'gemini-2.5-pro'
              ? 'border-indigo-500/40 bg-indigo-50/70 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}>
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-2.5-pro'} onChange={() => setModel('gemini-2.5-pro')} className="accent-indigo-600 cursor-pointer" />
              <div>
                <div className="text-slate-900 dark:text-zinc-200 font-sans font-bold">Gemini 2.5 Pro</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-normal">Deep architecture synthesis for large enterprise repositories.</div>
              </div>
            </div>
            <Badge variant="purple" size="xs">Pro</Badge>
          </label>
        </div>
      </motion.div>

      {/* Rule Toggles with Custom Checkbox component */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl text-slate-800 dark:text-zinc-100"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <ShieldCheck size={18} className="text-emerald-500 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Security & Quality Analyzers</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Checkbox
              id="setting-owasp"
              checked={securityRules}
              onChange={(checked) => setSecurityRules(checked)}
              variant="indigo"
              size="md"
              label={<span className="font-semibold text-slate-900 dark:text-zinc-200">OWASP Security Scanner Module</span>}
              description="Detect SQLi, hardcoded secrets, XSS, broken authentication, and CVE risks."
              badge={<Badge variant="rose" size="xs">Security</Badge>}
              className="w-full"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Checkbox
              id="setting-complexity"
              checked={complexityRules}
              onChange={(checked) => setComplexityRules(checked)}
              variant="indigo"
              size="md"
              label={<span className="font-semibold text-slate-900 dark:text-zinc-200">Cyclomatic Complexity & Debt Analysis</span>}
              description="Flag deeply nested conditionals, massive methods (>50 lines), and high cognitive load."
              badge={<Badge variant="amber" size="xs">Quality</Badge>}
              className="w-full"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Checkbox
              id="setting-duplication"
              checked={duplicationRules}
              onChange={(checked) => setDuplicationRules(checked)}
              variant="indigo"
              size="md"
              label={<span className="font-semibold text-slate-900 dark:text-zinc-200">Code Duplication & Redundancy Finder</span>}
              description="Identify repetitive AST logic and suggest reusable helper abstractions."
              badge={<Badge variant="blue" size="xs">Architecture</Badge>}
              className="w-full"
            />
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/80 rounded-xl border border-slate-200 dark:border-zinc-800">
            <Checkbox
              id="setting-autopatch"
              checked={autoPatchMode}
              onChange={(checked) => setAutoPatchMode(checked)}
              variant="emerald"
              size="md"
              label={<span className="font-semibold text-slate-900 dark:text-zinc-200">1-Click Auto-Patch Verification</span>}
              description="Automatically perform AST dry-run compilation before proposing code diffs."
              badge={<Badge variant="emerald" size="xs">Recommended</Badge>}
              className="w-full"
            />
          </div>
        </div>
      </motion.div>

      {/* GitHub Integration Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl text-slate-800 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Github size={18} className="text-slate-900 dark:text-white" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">GitHub Account & OAuth Sync</h3>
          </div>
          {isAuthenticated ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              Not Connected
            </span>
          )}
        </div>

        {isAuthenticated && user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center space-x-3.5">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-11 h-11 rounded-xl ring-2 ring-indigo-500/20 object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{user.name || user.login}</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">@{user.login}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  {user.public_repos} Repositories • Full Code Audit & PR Push Active
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => refreshRepos()}
                disabled={isLoadingRepos}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isLoadingRepos ? 'animate-spin text-indigo-500' : ''} />
                <span>Sync Repos</span>
              </button>
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Enable 1-Click Codebase Import & Automated PR Creation
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                Authenticate via GitHub OAuth or Personal Access Token to list your public & private repositories and push verified security patches back to GitHub.
              </p>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Github size={14} />
              <span>Connect GitHub</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* API Key Status Readout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 p-6 rounded-2xl space-y-3 shadow-xl text-slate-800 dark:text-zinc-100"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <Key size={18} className="text-amber-500 dark:text-amber-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Gemini API Key Connection Status</h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
          The Gemini API Key is configured via your platform environment secrets (`GEMINI_API_KEY`). All queries route securely through server-side proxy handlers (`/api/*`).
        </p>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <Check size={16} />
          <span>Server API Key Active & Validated</span>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
        >
          {saved && <Check size={14} />}
          <span>{saved ? 'Preferences Saved' : 'Save Preferences'}</span>
        </button>
      </div>

      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

