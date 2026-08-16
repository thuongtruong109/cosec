import React, { useState } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  Code, 
  Table, 
  Printer, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../types';
import Modal from './common/Modal';
import Badge from './common/Badge';
import { 
  downloadBlob, 
  generateMarkdownReport, 
  generateCSVReport, 
  generateStandaloneHTMLReport, 
  generateScorecardImage 
} from '../utils/exportUtils';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
}

export default function ShareExportModal({
  isOpen,
  onClose,
  analysis,
}: ShareExportModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'export_files' | 'export_image'>('share');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [imageTheme, setImageTheme] = useState<'cyber' | 'obsidian' | 'emerald'>('cyber');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!analysis) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(analysis);
    downloadBlob(md, `${analysis.projectName}-codelens-audit.md`, 'text/markdown');
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(analysis, null, 2);
    downloadBlob(json, `${analysis.projectName}-codelens-analysis.json`, 'application/json');
  };

  const handleDownloadCSV = () => {
    const csv = generateCSVReport(analysis);
    downloadBlob(csv, `${analysis.projectName}-issues-export.csv`, 'text/csv');
  };

  const handleDownloadHTML = () => {
    const html = generateStandaloneHTMLReport(analysis);
    downloadBlob(html, `${analysis.projectName}-report.html`, 'text/html');
  };

  const handleDownloadPNG = async () => {
    try {
      setIsGeneratingImage(true);
      const blob = await generateScorecardImage(analysis, imageTheme);
      downloadBlob(blob, `${analysis.projectName}-scorecard-${imageTheme}.png`, 'image/png');
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyImageToClipboard = async () => {
    try {
      setIsGeneratingImage(true);
      const blob = await generateScorecardImage(analysis, imageTheme);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopiedKey('image_clipboard');
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#share=${analysis.projectId}` : 'https://codelens.ai';
  
  const markdownBadge = `[![CodeLens Health: ${analysis.scores.overall}/100](https://img.shields.io/badge/CodeLens_Score-${analysis.scores.overall}%2F100-${analysis.scores.overall >= 80 ? '22c55e' : 'f59e0b'}?style=for-the-badge&logo=shield)](${shareUrl})`;

  const slackText = `🛡️ *CodeLens AI Code Review Audit for ${analysis.projectName}*
• Health Score: *${analysis.scores.overall}/100* (Security: ${analysis.scores.security} | Reliability: ${analysis.scores.reliability})
• Findings: *${analysis.issueCounts.critical} Critical*, *${analysis.issueCounts.high} High*, *${analysis.issueCounts.medium} Medium*
• View Interactive Report: ${shareUrl}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <Share2 size={18} className="text-indigo-400" />
          <span>Share & Export Review Findings</span>
        </div>
      }
      subtitle={`Export and share security audit report for ${analysis.projectName}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Share2 size={14} />
            <span>Share & Embed</span>
          </button>

          <button
            onClick={() => setActiveTab('export_image')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'export_image'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ImageIcon size={14} />
            <span>Export Scorecard Image</span>
          </button>

          <button
            onClick={() => setActiveTab('export_files')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'export_files'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Download size={14} />
            <span>File Formats (.md, .json, .csv, .html)</span>
          </button>
        </div>

        {/* Tab 1: Share & Embed */}
        {activeTab === 'share' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Quick Share Link */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 font-mono flex items-center space-x-1.5">
                <Globe size={13} className="text-indigo-400" />
                <span>Interactive Public Share Link</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500/60 selection:bg-indigo-500"
                />
                <button
                  onClick={() => handleCopy(shareUrl, 'link')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'link' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === 'link' ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* GitHub README Badge */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-200">GitHub README Badge</span>
                </div>
                <button
                  onClick={() => handleCopy(markdownBadge, 'badge')}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'badge' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === 'badge' ? 'Copied' : 'Copy Markdown'}</span>
                </button>
              </div>

              {/* Visual Preview */}
              <div className="flex items-center space-x-3 p-3 bg-zinc-900/90 rounded-lg border border-zinc-800">
                <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold flex items-center space-x-2">
                  <span className="text-zinc-400">CODELENS SCORE</span>
                  <span className={analysis.scores.overall >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                    {analysis.scores.overall}/100
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">Add directly to your repository README</span>
              </div>

              <pre className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                {markdownBadge}
              </pre>
            </div>

            {/* Slack / Discord Team Announcement */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 font-mono">Team Chat Summary (Slack / Discord)</span>
                <button
                  onClick={() => handleCopy(slackText, 'slack')}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'slack' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === 'slack' ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/60 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {slackText}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Export Image */}
        {activeTab === 'export_image' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Theme Picker */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-mono text-zinc-400">Select Visual Scorecard Palette:</span>
              <div className="flex items-center space-x-2">
                {[
                  { id: 'cyber', label: 'Cyber Dark', bg: 'bg-indigo-600' },
                  { id: 'obsidian', label: 'Obsidian Purple', bg: 'bg-purple-600' },
                  { id: 'emerald', label: 'Emerald Forest', bg: 'bg-emerald-600' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setImageTheme(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                      imageTheme === t.id
                        ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.bg}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scorecard Visual Mockup */}
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                    CODELENS AI AUDIT
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{analysis.projectName}</h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-white">{analysis.scores.overall}<span className="text-xs text-zinc-500">/100</span></div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Health Score</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-400 text-[10px]">SECURITY</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5">{analysis.scores.security}/100</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-400 text-[10px]">RELIABILITY</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">{analysis.scores.reliability}/100</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-400 text-[10px]">CRITICAL RISKS</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{analysis.issueCounts.critical} Flags</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                <span>{analysis.totalFiles} Files • {analysis.totalLines.toLocaleString()} Lines Audited</span>
                <span>Verified Architecture Badge</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                disabled={isGeneratingImage}
                onClick={handleDownloadPNG}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <Download size={15} />
                <span>{isGeneratingImage ? 'Rendering Image...' : 'Download High-Res PNG (1200x675)'}</span>
              </button>

              <button
                disabled={isGeneratingImage}
                onClick={handleCopyImageToClipboard}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {copiedKey === 'image_clipboard' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span>{copiedKey === 'image_clipboard' ? 'Copied Image!' : 'Copy Image to Clipboard'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 3: File Formats */}
        {activeTab === 'export_files' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {/* Markdown Report Card */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Markdown Audit Report</h4>
                    <span className="text-[10px] font-mono text-zinc-500">.md format • GitHub friendly</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Full structured markdown document with executive summary, tables, and exact code fix blocks.
                </p>
              </div>

              <button
                onClick={handleDownloadMarkdown}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download .md</span>
              </button>
            </div>

            {/* Standalone HTML Report Card */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Standalone HTML Report</h4>
                    <span className="text-[10px] font-mono text-zinc-500">.html format • Self-contained</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Styled single-file web document with built-in responsive themes and issue cards for offline sharing.
                </p>
              </div>

              <button
                onClick={handleDownloadHTML}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download .html</span>
              </button>
            </div>

            {/* CSV Issues Export */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Table size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Spreadsheet CSV Export</h4>
                    <span className="text-[10px] font-mono text-zinc-500">.csv format • Excel / Sheets</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tabular findings dataset with CWE identifiers, confidence scores, file paths, and fix descriptions.
                </p>
              </div>

              <button
                onClick={handleDownloadCSV}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download .csv</span>
              </button>
            </div>

            {/* JSON Schema Analysis */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Code size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Structured JSON Schema</h4>
                    <span className="text-[10px] font-mono text-zinc-500">.json format • CI/CD Automation</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Machine-readable AST and vulnerability data for automated pipelines and custom dashboard ingestion.
                </p>
              </div>

              <button
                onClick={handleDownloadJSON}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download .json</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
