import React, { useState } from 'react';
import { 
  Upload, 
  FileCode, 
  Folder, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Code2,
  FileArchive,
  Layers,
  X,
  GitBranch,
  Globe,
  Link2,
  ClipboardPaste,
  Check,
  ClipboardCheck
} from 'lucide-react';
import { Project } from '../types';
import { parseZipRepository, parsePastedCode } from '../services/zipParser';
import { fetchRemoteGitRepository } from '../services/gitUrlService';
import { SAMPLE_PROJECT_PAYMENT_API } from '../data/sampleProjects';

interface ProjectUploadProps {
  onProjectLoaded: (project: Project) => void;
  onStartDemo: () => void;
}

export default function ProjectUpload({ onProjectLoaded, onStartDemo }: ProjectUploadProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'zip' | 'files' | 'paste'>('url');
  const [isParsing, setIsParsing] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [stagedProject, setStagedProject] = useState<Project | null>(null);

  // Git URL state
  const [gitUrlInput, setGitUrlInput] = useState('https://github.com/expressjs/express');
  const [pastedUrlSuccess, setPastedUrlSuccess] = useState<boolean>(false);

  // Paste code state
  const [pastedCode, setPastedCode] = useState('');
  const [pastedFileName, setPastedFileName] = useState('auth.ts');
  const [pastedSnippetSuccess, setPastedSnippetSuccess] = useState<boolean>(false);

  // Handle Clipboard Paste for Git URL
  const handlePasteGitUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setGitUrlInput(text.trim());
        setPastedUrlSuccess(true);
        setParseError(null);
        setTimeout(() => setPastedUrlSuccess(false), 2000);
      } else {
        setParseError('Clipboard is empty. Please copy a Git repository URL first.');
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      // Fallback for browsers that restrict clipboard permissions
      setParseError('Could not access clipboard automatically. Please press Ctrl+V / Cmd+V into the input field.');
    }
  };

  // Handle Clipboard Paste for Code Snippet
  const handlePasteSnippet = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPastedCode(text);
        setPastedSnippetSuccess(true);
        setParseError(null);
        setTimeout(() => setPastedSnippetSuccess(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Handle Remote Git URL Clone / Import
  const handleFetchGitUrl = async () => {
    if (!gitUrlInput.trim()) {
      setParseError('Please enter a GitHub or GitLab repository URL (e.g. https://github.com/expressjs/express)');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setProgressMsg('Connecting to repository...');

    try {
      const result = await fetchRemoteGitRepository(gitUrlInput, (msg) => setProgressMsg(msg));
      setStagedProject(result.project);
    } catch (err: any) {
      console.error('Git Fetch Error:', err);
      setParseError(err.message || 'Failed to fetch repository.');
    } finally {
      setIsParsing(false);
      setProgressMsg('');
    }
  };

  // Handle ZIP File Upload
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setParseError('Please select a valid .ZIP repository file.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const parsed = await parseZipRepository(file);
      setStagedProject(parsed);
    } catch (err: any) {
      console.error('ZIP Parse Error:', err);
      setParseError(err.message || 'Failed to parse ZIP file.');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Direct Files Upload
  const handleIndividualFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    setIsParsing(true);
    setParseError(null);

    const fileItems: any[] = [];
    let totalLines = 0;
    const langCounts: Record<string, number> = {};

    Array.from(filesList).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        const lines = content.split('\n').length;
        totalLines += lines;

        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
        const langName = ext === 'ts' || ext === 'tsx' ? 'TypeScript' : ext === 'py' ? 'Python' : 'JavaScript';

        fileItems.push({
          path: `src/${file.name}`,
          name: file.name,
          content,
          language: langName.toLowerCase(),
          size: file.size,
          lines,
        });

        langCounts[langName] = (langCounts[langName] || 0) + lines;

        if (fileItems.length === filesList.length) {
          const project: Project = {
            id: `proj-${Date.now()}`,
            name: 'custom-files-upload',
            description: `Uploaded ${fileItems.length} individual source files`,
            uploadedAt: new Date().toISOString(),
            files: fileItems,
            languages: [
              { name: 'TypeScript', percentage: 70, color: '#3178c6' },
              { name: 'JavaScript', percentage: 30, color: '#f7df1e' },
            ],
            totalLines,
          };
          setStagedProject(project);
          setIsParsing(false);
        }
      };
      reader.readAsText(file);
    });
  };

  // Handle Staged Paste
  const handleStagePaste = () => {
    if (!pastedCode.trim()) {
      setParseError('Please enter source code before proceeding.');
      return;
    }
    const project = parsePastedCode(pastedCode, pastedFileName);
    setStagedProject(project);
    setParseError(null);
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Upload size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Import Codebase & Run Analysis</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paste a public GitHub/GitLab URL, upload a repository .ZIP, or select source files to initiate an AI senior code review.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onProjectLoaded(SAMPLE_PROJECT_PAYMENT_API);
          }}
          className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shrink-0 cursor-pointer"
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span>Load Sample "payment-api" Project</span>
        </button>
      </div>

      {/* Upload Modes Tabs */}
      <div className="flex border-b border-zinc-800/80 space-x-4">
        <button
          onClick={() => {
            setActiveTab('url');
            setStagedProject(null);
          }}
          className={`pb-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'url'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe size={15} />
          <span>GitHub / GitLab URL</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('zip');
            setStagedProject(null);
          }}
          className={`pb-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'zip'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileArchive size={15} />
          <span>ZIP Archive</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('files');
            setStagedProject(null);
          }}
          className={`pb-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'files'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Folder size={15} />
          <span>Source Files</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('paste');
            setStagedProject(null);
          }}
          className={`pb-2.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'paste'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code2 size={15} />
          <span>Paste Code</span>
        </button>
      </div>

      {/* Upload / Import Input Zones */}
      {!stagedProject ? (
        <div className="space-y-5">
          {activeTab === 'url' && (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 font-mono flex items-center gap-1.5 mb-1.5">
                  <Link2 size={14} className="text-indigo-400" />
                  <span>Public GitHub or GitLab Repository URL</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={gitUrlInput}
                    onChange={(e) => setGitUrlInput(e.target.value)}
                    placeholder="e.g. https://github.com/expressjs/express or facebook/react"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteGitUrl}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer border border-zinc-700 shadow-sm"
                      title="Paste URL from Clipboard"
                    >
                      {pastedUrlSuccess ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <ClipboardPaste size={14} className="text-indigo-400" />
                      )}
                      <span>{pastedUrlSuccess ? 'Pasted!' : 'Paste'}</span>
                    </button>
                    <button
                      onClick={handleFetchGitUrl}
                      disabled={isParsing}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <GitBranch size={14} />
                      <span>Import Repository</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-zinc-800/60">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                  Quick Popular Repositories
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {[
                    'https://github.com/expressjs/express',
                    'https://github.com/fastify/fastify',
                    'https://github.com/pallets/flask',
                    'https://gitlab.com/gitlab-org/gitlab-runner'
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setGitUrlInput(preset);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                    >
                      {preset.replace('https://github.com/', '').replace('https://gitlab.com/', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'zip' && (
            <div className="relative border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-xl p-8 bg-zinc-900/40 text-center transition-all group">
              <input
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload size={20} />
              </div>
              <h3 className="font-semibold text-zinc-100 text-xs">
                Drag & drop repository .ZIP file here
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                Or click to select file from system storage
              </p>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="relative border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-xl p-8 bg-zinc-900/40 text-center transition-all group">
              <input
                type="file"
                multiple
                onChange={handleIndividualFiles}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Folder size={20} />
              </div>
              <h3 className="font-semibold text-zinc-100 text-xs">
                Select source files (.ts, .js, .py, .java, .go, .sql, etc.)
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">Click to open system file chooser</p>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-zinc-300 font-mono">
                    File Name:
                  </label>
                  <input
                    type="text"
                    value={pastedFileName}
                    onChange={(e) => setPastedFileName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. auth.ts, payment.py"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePasteSnippet}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-white rounded text-xs font-mono flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                >
                  {pastedSnippetSuccess ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <ClipboardPaste size={13} className="text-indigo-400" />
                  )}
                  <span>{pastedSnippetSuccess ? 'Pasted from Clipboard!' : 'Paste from Clipboard'}</span>
                </button>
              </div>

              <textarea
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="Paste your source code snippet here..."
                rows={10}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleStagePaste}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <span>Stage Code Snippet</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Supported Languages List */}
          <div className="pt-3 border-t border-zinc-800/80">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
              Supported Programming Languages
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono text-zinc-400">
              {['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Kotlin', 'SQL'].map((lang) => (
                <span key={lang} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Staged Project Summary Card */
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                Staged Repository
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{stagedProject.name}</h3>
            </div>
            <button
              onClick={() => setStagedProject(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              title="Reset Upload"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Total Files</div>
              <div className="text-xl font-bold text-white mt-0.5 font-mono">{stagedProject.files.length}</div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Lines of Code</div>
              <div className="text-xl font-bold text-white mt-0.5 font-mono">
                {stagedProject.totalLines.toLocaleString()}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Primary Language</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5 font-mono">
                {stagedProject.languages[0]?.name || 'TypeScript'}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Config Files</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1.5 font-mono">
                {stagedProject.files.some((f) => f.name.includes('package.json')) ? 'package.json detected' : 'Standard files'}
              </div>
            </div>
          </div>

          {/* File List Preview */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
              Detected Files Preview ({stagedProject.files.length})
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-zinc-900 font-mono text-xs text-zinc-300">
              {stagedProject.files.map((file) => (
                <div key={file.path} className="pt-1 flex items-center justify-between">
                  <span className="truncate">{file.path}</span>
                  <span className="text-zinc-500 text-[10px]">{file.lines} lines</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start AI Review CTA */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onProjectLoaded(stagedProject)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Start AI Code Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Parsing indicator or errors */}
      {isParsing && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-indigo-500/30 flex items-center space-x-3 text-xs text-indigo-300 font-mono">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
          <span>{progressMsg || 'Parsing repository...'}</span>
        </div>
      )}

      {parseError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-xs text-rose-300 font-mono">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  );
}

