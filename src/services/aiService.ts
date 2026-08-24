import { AnalysisResult, RefactorRequest, RefactorResult, TestGenRequest, TestGenResult } from '../types';

export async function requestCodeAnalysis(
  files: { path: string; content: string }[],
  projectName: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, projectName }),
  });

  if (!response.ok) {
    throw new Error(`Analysis request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.analysis) {
    throw new Error(data.error || 'Failed to parse analysis results');
  }

  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);

  // Dynamic language distribution calculation from files
  const langCounts: Record<string, number> = {};
  files.forEach((f) => {
    const ext = f.path.split('.').pop()?.toLowerCase() || 'code';
    let lang = 'TypeScript';
    if (ext === 'ts' || ext === 'tsx') lang = 'TypeScript';
    else if (ext === 'js' || ext === 'jsx') lang = 'JavaScript';
    else if (ext === 'py') lang = 'Python';
    else if (ext === 'go') lang = 'Go';
    else if (ext === 'rs') lang = 'Rust';
    else if (ext === 'java') lang = 'Java';
    else if (ext === 'sql') lang = 'SQL';
    else if (ext === 'json') lang = 'JSON';

    const lines = f.content.split('\n').length;
    langCounts[lang] = (langCounts[lang] || 0) + lines;
  });

  const languagesBreakdown = Object.entries(langCounts)
    .map(([name, count]) => {
      const percentage = Math.round((count / Math.max(1, totalLines)) * 100);
      let color = '#3178c6';
      if (name === 'JavaScript') color = '#f7df1e';
      if (name === 'Python') color = '#3572A5';
      if (name === 'Go') color = '#00ADD8';
      if (name === 'Rust') color = '#dea584';
      if (name === 'SQL') color = '#e38c00';
      if (name === 'JSON') color = '#292929';
      return { name, percentage, color };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const issues = data.analysis.issues || [];

  return {
    ...data.analysis,
    projectId: `proj-${Date.now()}`,
    projectName,
    analyzedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalLines,
    languagesBreakdown: languagesBreakdown.length > 0 ? languagesBreakdown : [
      { name: 'Plain Text', percentage: 100, color: '#94a3b8' },
    ],
    securitySummary: data.analysis.securitySummary || {
      sqlInjection: issues.filter((i: any) => i.cwe === 'CWE-89' || i.title?.toLowerCase().includes('sql') || i.taintFlow?.sinkType === 'sql').length,
      hardcodedSecrets: issues.filter((i: any) => i.cwe === 'CWE-798' || i.title?.toLowerCase().includes('secret') || i.title?.toLowerCase().includes('key') || i.title?.toLowerCase().includes('token')).length,
      insecureAuth: issues.filter((i: any) => i.category === 'security' && (i.cwe === 'CWE-287' || i.cwe === 'CWE-306' || i.title?.toLowerCase().includes('auth') || i.title?.toLowerCase().includes('cors') || i.title?.toLowerCase().includes('jwt'))).length,
      xss: issues.filter((i: any) => i.cwe === 'CWE-79' || i.title?.toLowerCase().includes('xss') || i.taintFlow?.sinkType === 'xss').length,
      unsafeFileHandling: issues.filter((i: any) => i.cwe === 'CWE-22' || i.cwe === 'CWE-434' || i.title?.toLowerCase().includes('path') || i.title?.toLowerCase().includes('file') || i.title?.toLowerCase().includes('upload')).length,
      ssrf: issues.filter((i: any) => i.cwe === 'CWE-918' || i.title?.toLowerCase().includes('ssrf') || i.title?.toLowerCase().includes('forgery')).length,
      pathTraversal: issues.filter((i: any) => i.cwe === 'CWE-22' || i.title?.toLowerCase().includes('traversal')).length,
    },
    qualitySummary: data.analysis.qualitySummary || {
      cyclomaticComplexity: 'Low',
      duplicationPercentage: 0,
      longFunctionsCount: issues.filter((i: any) => i.category === 'maintainability' && (i.title?.toLowerCase().includes('function') || i.title?.toLowerCase().includes('complexity'))).length,
      deadCodeLocations: issues.filter((i: any) => i.title?.toLowerCase().includes('unused') || i.title?.toLowerCase().includes('dead')).length,
      namingIssues: issues.filter((i: any) => i.category === 'style').length,
      errorHandlingGaps: issues.filter((i: any) => i.title?.toLowerCase().includes('error') || i.title?.toLowerCase().includes('catch') || i.title?.toLowerCase().includes('exception')).length,
    },
    issueCounts: {
      critical: issues.filter((i: any) => i.severity === 'critical').length,
      high: issues.filter((i: any) => i.severity === 'high').length,
      medium: issues.filter((i: any) => i.severity === 'medium').length,
      low: issues.filter((i: any) => i.severity === 'low').length,
      info: issues.filter((i: any) => i.severity === 'info').length,
    },
  };
}

export async function requestCodebaseChat(
  message: string,
  files?: { path: string; content: string }[]
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, files }),
  });

  if (!response.ok) {
    throw new Error('Chat API call failed');
  }

  const data = await response.json();
  return data.text || 'No response received from AI assistant.';
}

export async function requestRefactor(req: RefactorRequest): Promise<RefactorResult> {
  const response = await fetch('/api/refactor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error('Refactor request failed');
  }

  const data = await response.json();
  return data.result;
}

export async function requestTestGen(req: TestGenRequest): Promise<TestGenResult> {
  const response = await fetch('/api/generate-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error('Test generation request failed');
  }

  const data = await response.json();
  return {
    framework: req.framework,
    testCode: data.testCode,
    coverageNotes: data.coverageNotes || [],
    testCasesCount: data.testCasesCount || 3,
  };
}
