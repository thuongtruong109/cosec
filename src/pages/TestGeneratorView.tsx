import React, { useState } from 'react';
import { TestTube, Sparkles, Copy, Check, FileCode } from 'lucide-react';
import { Project, TestGenResult } from '../types';
import { requestTestGen } from '../services/aiService';

interface TestGeneratorViewProps {
  project: Project | null;
}

export default function TestGeneratorView({ project }: TestGeneratorViewProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    project?.files[0]?.path || 'src/controllers/auth.ts'
  );
  const [framework, setFramework] = useState<string>('Vitest');
  const [loading, setLoading] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<TestGenResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = project?.files.find((f) => f.path === selectedFilePath) || project?.files[0];

  const handleGenerateTests = async () => {
    if (!activeFile) return;
    setLoading(true);

    try {
      const result = await requestTestGen({
        codeSnippet: activeFile.content,
        framework: framework as any,
        filePath: activeFile.path,
      });
      setTestOutput(result);
    } catch (err) {
      console.error('Test generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!testOutput) return;
    navigator.clipboard.writeText(testOutput.testCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <TestTube size={24} className="text-indigo-400" />
            <span>Automated AI Test Suite Generator</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generate comprehensive unit and integration test suites with edge case coverage and mock handlers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6 shadow-xl h-fit">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">Select Source File</label>
            <select
              value={selectedFilePath}
              onChange={(e) => {
                setSelectedFilePath(e.target.value);
                setTestOutput(null);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
            >
              {project?.files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path} ({f.lines} lines)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">Test Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="Vitest">Vitest (React / Node)</option>
              <option value="Jest">Jest (JavaScript / TypeScript)</option>
              <option value="PyTest">PyTest (Python)</option>
              <option value="Go Test">Go standard testing</option>
            </select>
          </div>

          <button
            onClick={handleGenerateTests}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <Sparkles size={16} className="animate-spin" />
            ) : (
              <TestTube size={16} />
            )}
            <span>{loading ? 'Generating Test Suite...' : 'Generate Test Suite'}</span>
          </button>
        </div>

        {/* Output Column */}
        <div className="md:col-span-2 space-y-6">
          {testOutput ? (
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <FileCode size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    Generated Test File ({testOutput.framework})
                  </h3>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Suite' : 'Copy Test Code'}</span>
                </button>
              </div>

              {/* Coverage Edge Cases */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <div className="font-bold text-indigo-400 uppercase font-mono">
                  Covered Edge Cases ({testOutput.coverageNotes.length})
                </div>
                <ul className="list-disc list-inside text-zinc-300 space-y-1 font-sans">
                  {testOutput.coverageNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Test Code Block */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-emerald-300 max-h-96">
                <pre>{testOutput.testCode}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 font-mono text-xs space-y-2">
              <TestTube size={32} className="mx-auto text-zinc-600 mb-2" />
              <div>Select a source file and click "Generate Test Suite".</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
