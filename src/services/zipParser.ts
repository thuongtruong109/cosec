import JSZip from 'jszip';
import { Project, FileItem } from '../types';

// Supported file extensions mapping to languages and colors
const LANGUAGE_MAP: Record<string, { name: string; color: string }> = {
  ts: { name: 'TypeScript', color: '#3178c6' },
  tsx: { name: 'TypeScript', color: '#3178c6' },
  js: { name: 'JavaScript', color: '#f7df1e' },
  jsx: { name: 'JavaScript', color: '#f7df1e' },
  py: { name: 'Python', color: '#3572A5' },
  java: { name: 'Java', color: '#b07219' },
  go: { name: 'Go', color: '#00ADD8' },
  rs: { name: 'Rust', color: '#dea584' },
  cpp: { name: 'C++', color: '#f34b7d' },
  c: { name: 'C', color: '#555555' },
  cs: { name: 'C#', color: '#178600' },
  php: { name: 'PHP', color: '#4F5D95' },
  rb: { name: 'Ruby', color: '#701516' },
  kt: { name: 'Kotlin', color: '#A97BFF' },
  swift: { name: 'Swift', color: '#F05138' },
  sql: { name: 'SQL', color: '#e38c00' },
  html: { name: 'HTML', color: '#e34c26' },
  css: { name: 'CSS', color: '#563d7c' },
  json: { name: 'JSON', color: '#292929' },
  md: { name: 'Markdown', color: '#083fa1' },
  yml: { name: 'YAML', color: '#cb171e' },
  yaml: { name: 'YAML', color: '#cb171e' },
};

export async function parseZipRepository(file: File): Promise<Project> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const files: FileItem[] = [];
  const languageCounts: Record<string, number> = {};
  let totalLines = 0;

  const entries = Object.keys(loadedZip.files);

  for (const relativePath of entries) {
    const entry = loadedZip.files[relativePath];

    // Ignore directories, hidden files, node_modules, git, images/binaries
    if (
      entry.dir ||
      relativePath.includes('node_modules/') ||
      relativePath.includes('.git/') ||
      relativePath.includes('dist/') ||
      relativePath.includes('build/') ||
      relativePath.startsWith('__MACOSX') ||
      relativePath.endsWith('.png') ||
      relativePath.endsWith('.jpg') ||
      relativePath.endsWith('.jpeg') ||
      relativePath.endsWith('.ico') ||
      relativePath.endsWith('.pdf') ||
      relativePath.endsWith('.zip') ||
      relativePath.endsWith('.tar')
    ) {
      continue;
    }

    try {
      const content = await entry.async('string');
      // Skip empty or purely whitespace files
      if (!content.trim()) continue;

      const fileName = relativePath.split('/').pop() || relativePath;
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const langInfo = LANGUAGE_MAP[ext] || { name: 'Other', color: '#888888' };

      const lines = content.split('\n').length;
      totalLines += lines;

      files.push({
        path: relativePath,
        name: fileName,
        content,
        language: langInfo.name.toLowerCase(),
        size: content.length,
        lines,
      });

      if (langInfo.name !== 'Other') {
        languageCounts[langInfo.name] = (languageCounts[langInfo.name] || 0) + lines;
      }
    } catch (err) {
      console.warn(`Could not parse file ${relativePath}:`, err);
    }
  }

  // Calculate language percentage breakdown
  const languageSum = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(languageCounts)
    .map(([name, count]) => {
      const pct = Math.round((count / languageSum) * 100);
      const extMatch = Object.entries(LANGUAGE_MAP).find(([_, v]) => v.name === name);
      const color = extMatch ? extMatch[1].color : '#6366f1';
      return { name, percentage: pct, color };
    })
    .filter((l) => l.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (languages.length === 0) {
    languages.push({ name: 'Text / Code', percentage: 100, color: '#6366f1' });
  }

  const projName = file.name.replace(/\.zip$/i, '');

  return {
    id: `project-${Date.now()}`,
    name: projName,
    description: `Uploaded repository ZIP with ${files.length} source files`,
    uploadedAt: new Date().toISOString(),
    files,
    languages,
    totalLines,
  };
}

export function parsePastedCode(code: string, fileName: string = 'snippet.ts'): Project {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'ts';
  const langInfo = LANGUAGE_MAP[ext] || { name: 'TypeScript', color: '#3178c6' };
  const lines = code.split('\n').length;

  const fileItem: FileItem = {
    path: `src/${fileName}`,
    name: fileName,
    content: code,
    language: langInfo.name.toLowerCase(),
    size: code.length,
    lines,
  };

  return {
    id: `project-${Date.now()}`,
    name: 'custom-snippet',
    description: 'Direct code snippet upload',
    uploadedAt: new Date().toISOString(),
    files: [fileItem],
    languages: [{ name: langInfo.name, percentage: 100, color: langInfo.color }],
    totalLines: lines,
  };
}
