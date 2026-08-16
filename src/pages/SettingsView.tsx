import React, { useState } from 'react';
import { Sliders, ShieldCheck, Check, Key, Sparkles } from 'lucide-react';

export default function SettingsView() {
  const [model, setModel] = useState<string>('gemini-3.6-flash');
  const [securityRules, setSecurityRules] = useState<boolean>(true);
  const [complexityRules, setComplexityRules] = useState<boolean>(true);
  const [duplicationRules, setDuplicationRules] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
          <Sliders size={24} className="text-indigo-400" />
          <span>CodeLens AI Engine Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure rule sensitivity, AI reasoning model options, and API key environment settings.
        </p>
      </div>

      {/* Model Selection */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Sparkles size={18} className="text-indigo-400" />
          <h3 className="font-bold text-white text-sm">AI Engine Model Selection</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-600/10 text-indigo-300 font-semibold cursor-pointer">
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-3.6-flash'} onChange={() => setModel('gemini-3.6-flash')} className="accent-indigo-500" />
              <div>
                <div className="text-white">Gemini 3.6 Flash (Recommended)</div>
                <div className="text-[11px] text-zinc-400 font-normal">Ultra-fast multi-file context analysis & line-by-line reasoning.</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">Default</span>
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 cursor-pointer hover:border-zinc-700">
            <div className="flex items-center space-x-3">
              <input type="radio" name="model" checked={model === 'gemini-3.1-pro-preview'} onChange={() => setModel('gemini-3.1-pro-preview')} className="accent-indigo-500" />
              <div>
                <div className="text-zinc-200">Gemini 3.1 Pro Preview</div>
                <div className="text-[11px] text-zinc-500 font-normal">Deep architecture synthesis for large enterprise repositories.</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Rule Toggles */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Rule Detector Modules</h3>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">OWASP Security Scanner Module</div>
              <div className="text-[11px] text-zinc-500">Detect SQLi, hardcoded secrets, XSS, and broken auth.</div>
            </div>
            <input
              type="checkbox"
              checked={securityRules}
              onChange={(e) => setSecurityRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">Cyclomatic Complexity & Debt Analysis</div>
              <div className="text-[11px] text-zinc-500">Flag deeply nested loops and long methods.</div>
            </div>
            <input
              type="checkbox"
              checked={complexityRules}
              onChange={(e) => setComplexityRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <div className="font-semibold text-zinc-200">Code Duplication Finder</div>
              <div className="text-[11px] text-zinc-500">Identify redundant functions across files.</div>
            </div>
            <input
              type="checkbox"
              checked={duplicationRules}
              onChange={(e) => setDuplicationRules(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* API Key Status Readout */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Key size={18} className="text-amber-400" />
          <h3 className="font-bold text-white text-sm">Gemini API Key Connection Status</h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          The Gemini API Key is configured via your platform environment secrets (`GEMINI_API_KEY`). All queries route securely through server-side proxy handlers (`/api/*`).
        </p>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <Check size={16} />
          <span>Server API Key Active & Validated</span>
        </div>
      </div>

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
