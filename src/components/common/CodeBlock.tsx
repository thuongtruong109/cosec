import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  maxHeight = 'max-h-96',
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-lg ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800/80 text-xs font-mono">
        <div className="flex items-center space-x-2 text-zinc-300">
          {filename ? (
            <>
              <FileCode size={14} className="text-indigo-400" />
              <span className="font-medium text-zinc-200">{filename}</span>
            </>
          ) : (
            <>
              <Terminal size={14} className="text-zinc-500" />
              <span className="text-zinc-400 uppercase">{language}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px]"
          title="Copy Code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-zinc-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code viewport */}
      <div className={`overflow-auto p-4 text-xs font-mono leading-relaxed ${maxHeight}`}>
        <pre className="flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-right text-zinc-600 border-r border-zinc-800/80 shrink-0 font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className={`${showLineNumbers ? 'pl-4' : ''} text-zinc-200 block flex-1 font-mono`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
