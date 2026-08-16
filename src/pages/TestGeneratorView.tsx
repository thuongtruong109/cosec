import React, { useState } from 'react';
import { TestTube, Sparkles, Copy, Check, FileCode, Play, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { Project, TestGenResult } from '../types';
import { requestTestGen } from '../services/aiService';
import CustomSelect, { SelectOption } from '../components/common/CustomSelect';
import CodeBlock from '../components/common/CodeBlock';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';

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

  const activeFile = project?.files.find((f) => f.path === selectedFilePath) || project?.files[0];

  const fileOptions: SelectOption[] = (project?.files || []).map((f) => ({
    value: f.path,
    label: f.name,
    sublabel: f.path,
    badge: `${f.lines} lines`,
  }));

  const frameworkOptions: SelectOption[] = [
    { value: 'Vitest', label: 'Vitest (React / Node.js / Vite)', badge: 'Modern', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { value: 'Jest', label: 'Jest (JavaScript / TypeScript)', badge: 'Standard' },
    { value: 'PyTest', label: 'PyTest (Python Unit & Mock)' },
    { value: 'Go Test', label: 'Go standard testing' },
  ];

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

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-7 select-none font-sans">
      {/* Header */}
      <PageHeader
        title="AI Automated Test Suite Generator"
        subtitle="Generate comprehensive unit and integration test suites with mock handlers and edge-case boundaries"
        icon={<TestTube size={22} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl space-y-6 shadow-xl h-fit backdrop-blur-sm"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">
              Select Source File
            </label>
            <CustomSelect
              options={fileOptions}
              value={selectedFilePath}
              onChange={(val) => {
                setSelectedFilePath(val);
                setTestOutput(null);
              }}
              searchable
              placeholder="Choose code file"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase font-mono">
              Test Framework
            </label>
            <CustomSelect
              options={frameworkOptions}
              value={framework}
              onChange={setFramework}
            />
          </div>

          <button
            onClick={handleGenerateTests}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <Sparkles size={16} className="animate-spin" />
            ) : (
              <TestTube size={16} />
            )}
            <span>{loading ? 'Synthesizing Test Suite...' : 'Generate Test Suite'}</span>
          </button>
        </motion.div>

        {/* Output Column */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-2 space-y-6"
        >
          {testOutput ? (
            <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-2xl space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <FileCode size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    Generated Test Suite ({testOutput.framework})
                  </h3>
                </div>
                <Badge variant="indigo" size="xs">
                  {testOutput.framework}
                </Badge>
              </div>

              {/* Coverage Edge Cases */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/90 space-y-2 text-xs">
                <div className="font-bold text-indigo-400 uppercase font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Covered Edge Cases & Assertions ({testOutput.coverageNotes.length})
                </div>
                <ul className="list-disc list-inside text-zinc-300 space-y-1 font-sans">
                  {testOutput.coverageNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">{note}</li>
                  ))}
                </ul>
              </div>

              {/* Code Block with 1-click Copy */}
              <CodeBlock
                code={testOutput.testCode}
                filename={`${selectedFilePath.split('/').pop()?.split('.')[0] || 'test'}.spec.ts`}
                language="typescript"
                maxHeight="max-h-[480px]"
              />
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-14 text-center text-zinc-400 font-mono text-xs space-y-3">
              <TestTube size={36} className="mx-auto text-zinc-600 mb-2" />
              <div className="text-sm font-semibold text-zinc-300">Ready to Generate Tests</div>
              <p className="text-zinc-500 max-w-sm mx-auto font-sans">
                Select a target file and testing framework on the left, then click "Generate Test Suite".
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
