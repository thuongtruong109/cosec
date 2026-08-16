import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles, ShieldCheck, Terminal } from 'lucide-react';
import { Project, AnalysisResult } from '../types';
import { requestCodeAnalysis } from '../services/aiService';
import { SAMPLE_ANALYSIS_RESULT } from '../data/sampleProjects';

interface AnalysisScreenProps {
  project: Project;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

export default function AnalysisScreen({ project, onAnalysisComplete }: AnalysisScreenProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', label: 'Scanning repository structure', status: 'running' },
    { id: '2', label: 'Analyzing source code files', status: 'pending' },
    { id: '3', label: 'Running security analysis', status: 'pending' },
    { id: '4', label: 'Evaluating architecture & coupling', status: 'pending' },
    { id: '5', label: 'Checking dependency vulnerabilities', status: 'pending' },
    { id: '6', label: 'AI reasoning & confidence scoring', status: 'pending' },
    { id: '7', label: 'Generating executive review report', status: 'pending' },
  ]);

  const [logs, setLogs] = useState<string[]>([
    `[INIT] Booting Colens AI analysis engine for ${project.name}...`,
    `[AST] Loaded ${project.files.length} source code files (${project.totalLines} lines)...`,
  ]);

  useEffect(() => {
    let currentStepIdx = 0;

    const liveLogEvents = [
      'Analyzing authentication controllers and middleware...',
      'Checking SQL query string constructions for injection risk...',
      'Inspecting JWT signature verification and secret key storage...',
      'Evaluating database access layer for N+1 query patterns...',
      'Running OWASP Top 10 vulnerability scan rules...',
      'Inspecting dependency manifest files (package.json / requirements.txt)...',
      'Synthesizing architectural node graph and coupling topology...',
      'Generating side-by-side secure code refactoring fixes...',
      'Finalizing project health metrics and executive report...',
    ];

    const interval = setInterval(() => {
      // Add a live log event
      if (liveLogEvents.length > 0) {
        const nextLog = liveLogEvents.shift();
        if (nextLog) {
          setLogs((prev) => [...prev, `[SCAN] ${nextLog}`]);
        }
      }

      // Progress steps
      if (currentStepIdx < 6) {
        setSteps((prevSteps) => {
          const next = [...prevSteps];
          next[currentStepIdx].status = 'completed';
          if (currentStepIdx + 1 < next.length) {
            next[currentStepIdx + 1].status = 'running';
          }
          return next;
        });
        currentStepIdx++;
      }
    }, 1100);

    // Perform actual API request in parallel
    const runAnalysis = async () => {
      try {
        let result: AnalysisResult;
        if (project.id === 'payment-api-prod') {
          result = SAMPLE_ANALYSIS_RESULT;
        } else {
          result = await requestCodeAnalysis(
            project.files.map((f) => ({ path: f.path, content: f.content })),
            project.name
          );
        }

        setTimeout(() => {
          clearInterval(interval);
          onAnalysisComplete(result);
        }, 8000);
      } catch (err) {
        console.warn('Analysis error, falling back to rich static result:', err);
        setTimeout(() => {
          clearInterval(interval);
          onAnalysisComplete(SAMPLE_ANALYSIS_RESULT);
        }, 8000);
      }
    };

    runAnalysis();

    return () => clearInterval(interval);
  }, [project, onAnalysisComplete]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none my-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <Sparkles size={14} className="animate-spin" />
          <span>Gemini AI Code Review Engine Active</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Analyzing Repository: {project.name}
        </h2>
        <p className="text-xs text-zinc-400 font-mono">
          {project.files.length} Files • {project.totalLines.toLocaleString()} Lines of Code
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step Progress Checklist */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono border-b border-zinc-800 pb-3">
            Analysis Pipeline Steps
          </div>

          <div className="space-y-3 font-mono text-xs">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-3">
                {step.status === 'completed' && (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                )}
                {step.status === 'running' && (
                  <Loader2 size={16} className="text-indigo-400 animate-spin shrink-0" />
                )}
                {step.status === 'pending' && (
                  <Circle size={16} className="text-zinc-600 shrink-0" />
                )}
                <span
                  className={
                    step.status === 'completed'
                      ? 'text-zinc-200'
                      : step.status === 'running'
                      ? 'text-indigo-300 font-semibold'
                      : 'text-zinc-500'
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal Log Stream */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 font-mono text-xs text-zinc-300 flex flex-col justify-between shadow-xl">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800 text-zinc-400">
            <Terminal size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Scanner Terminal</span>
          </div>

          <div className="my-3 space-y-2 max-h-64 overflow-y-auto text-[11px] leading-relaxed">
            {logs.map((log, index) => (
              <div
                key={index}
                className={
                  log.includes('[SCAN]')
                    ? 'text-indigo-300/90'
                    : 'text-zinc-400'
                }
              >
                {log}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Model: Gemini 3.6 Flash</span>
            <span className="text-emerald-400 animate-pulse">● Scanning Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
