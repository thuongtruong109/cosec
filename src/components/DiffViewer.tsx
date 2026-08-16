import React from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  suggestedCode: string;
  filename?: string;
  originalTitle?: string;
  suggestedTitle?: string;
  onApplyFix?: () => void;
}

export default function DiffViewer({
  originalCode,
  suggestedCode,
  filename,
  originalTitle = 'Current Code (Vulnerable)',
  suggestedTitle = 'Recommended Code (Secure)',
  onApplyFix,
}: DiffViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origLines = originalCode.trim().split('\n');
  const suggLines = suggestedCode.trim().split('\n');

  return (
    <div className="bg-slate-900 dark:bg-zinc-950 border border-slate-700 dark:border-zinc-800 rounded-xl overflow-hidden text-xs font-mono my-3 shadow-xl">
      {filename && (
        <div className="bg-slate-800/90 dark:bg-zinc-900/90 px-4 py-2 border-b border-slate-700 dark:border-zinc-800 flex items-center space-x-2 text-slate-200 dark:text-zinc-300 font-sans">
          <FileCode size={14} className="text-indigo-400" />
          <span className="font-semibold text-xs text-white">{filename}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700 dark:divide-zinc-800 border-b border-slate-700 dark:border-zinc-800 bg-slate-800/60 dark:bg-zinc-900/70 px-4 py-2.5">
        <div className="flex items-center space-x-2 text-rose-400 font-sans font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{originalTitle}</span>
        </div>
        <div className="flex items-center justify-between pt-2 md:pt-0 text-emerald-400 font-sans font-semibold md:pl-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{suggestedTitle}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-200 dark:text-zinc-300 rounded-lg text-[11px] font-sans flex items-center space-x-1 transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onApplyFix && (
              <button
                onClick={onApplyFix}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-sans font-semibold flex items-center space-x-1 transition-colors shadow-sm cursor-pointer"
              >
                <Check size={12} />
                <span>Apply Fix</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700 dark:divide-zinc-800 max-h-80 overflow-y-auto">
        {/* Left Side: Original / Removed Code */}
        <div className="p-3 bg-rose-950/20 space-y-1">
          {origLines.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-rose-300 leading-relaxed">
              <span className="text-slate-500 dark:text-zinc-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
              <span className="text-rose-400 select-none shrink-0 font-bold">-</span>
              <pre className="whitespace-pre-wrap break-all overflow-x-auto">{line}</pre>
            </div>
          ))}
        </div>

        {/* Right Side: Suggested / Added Code */}
        <div className="p-3 bg-emerald-950/20 space-y-1">
          {suggLines.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-emerald-300 leading-relaxed">
              <span className="text-slate-500 dark:text-zinc-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
              <span className="text-emerald-400 select-none shrink-0 font-bold">+</span>
              <pre className="whitespace-pre-wrap break-all overflow-x-auto">{line}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
