import React from 'react';
import { Check, Copy } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  suggestedCode: string;
  originalTitle?: string;
  suggestedTitle?: string;
  onApplyFix?: () => void;
}

export default function DiffViewer({
  originalCode,
  suggestedCode,
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden text-xs font-mono my-3 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
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
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-sans flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onApplyFix && (
              <button
                onClick={onApplyFix}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-sans font-semibold flex items-center space-x-1 transition-colors shadow-sm"
              >
                <Check size={12} />
                <span>Apply Fix</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 max-h-80 overflow-y-auto">
        {/* Left Side: Original / Removed Code */}
        <div className="p-3 bg-rose-950/10 space-y-1">
          {origLines.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-rose-300/90 leading-relaxed">
              <span className="text-zinc-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
              <span className="text-rose-500/80 select-none shrink-0">-</span>
              <pre className="whitespace-pre-wrap break-all overflow-x-auto">{line}</pre>
            </div>
          ))}
        </div>

        {/* Right Side: Suggested / Added Code */}
        <div className="p-3 bg-emerald-950/10 space-y-1">
          {suggLines.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-emerald-300 leading-relaxed">
              <span className="text-zinc-600 select-none w-6 text-right shrink-0">{idx + 1}</span>
              <span className="text-emerald-400 select-none shrink-0">+</span>
              <pre className="whitespace-pre-wrap break-all overflow-x-auto">{line}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
