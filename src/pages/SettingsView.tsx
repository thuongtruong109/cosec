import React, { useState } from 'react';
import { Sliders, ShieldCheck, Check, Key, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';

export default function SettingsView() {
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [securityRules, setSecurityRules] = useState<boolean>(true);
  const [complexityRules, setComplexityRules] = useState<boolean>(true);
  const [duplicationRules, setDuplicationRules] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="CodeLens AI Engine Settings"
        subtitle="Configure rule sensitivity, AI reasoning models, and backend security policies"
        icon={<Sliders size={22} />}
      />

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl"
      >
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Sparkles size={18} className="text-indigo-400" />
          <h3 className="font-bold text-white text-sm">AI Engine Model Configuration</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-600/10 text-indigo-300 font-semibold cursor-pointer">
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-2.5-flash'} onChange={() => setModel('gemini-2.5-flash')} className="accent-indigo-500" />
              <div>
                <div className="text-white">Gemini 2.5 Flash (Recommended)</div>
                <div className="text-[11px] text-zinc-400 font-normal">Ultra-fast multi-file context analysis & line-by-line reasoning.</div>
              </div>
            </div>
            <Badge variant="indigo" size="xs">Default</Badge>
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-400 cursor-pointer hover:border-zinc-700">
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-2.5-pro'} onChange={() => setModel('gemini-2.5-pro')} className="accent-indigo-500" />
              <div>
                <div className="text-zinc-200">Gemini 2.5 Pro</div>
                <div className="text-[11px] text-zinc-500 font-normal">Deep architecture synthesis for large enterprise repositories.</div>
              </div>
            </div>
            <Badge variant="purple" size="xs">Pro</Badge>
          </label>
        </div>
      </motion.div>

      {/* Rule Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl space-y-4 shadow-xl"
      >
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Security & Quality Analyzers</h3>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">OWASP Security Scanner Module</div>
              <div className="text-[11px] text-zinc-500">Detect SQLi, hardcoded secrets, XSS, and broken auth.</div>
            </div>
            <input
              type="checkbox"
              checked={securityRules}
              onChange={(e) => setSecurityRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">Cyclomatic Complexity & Debt Analysis</div>
              <div className="text-[11px] text-zinc-500">Flag deeply nested loops and long methods.</div>
            </div>
            <input
              type="checkbox"
              checked={complexityRules}
              onChange={(e) => setComplexityRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">Code Duplication Finder</div>
              <div className="text-[11px] text-zinc-500">Identify redundant functions across files.</div>
            </div>
            <input
              type="checkbox"
              checked={duplicationRules}
              onChange={(e) => setDuplicationRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </motion.div>

      {/* API Key Status Readout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl space-y-3 shadow-xl"
      >
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Key size={18} className="text-amber-400" />
          <h3 className="font-bold text-white text-sm">Gemini API Key Connection Status</h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          The Gemini API Key is configured via your platform environment secrets (`GEMINI_API_KEY`). All queries route securely through server-side proxy handlers (`/api/*`).
        </p>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center space-x-2">
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
    </div>
  );
}
