export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IssueCategory = 
  | 'security' 
  | 'bug' 
  | 'performance' 
  | 'architecture' 
  | 'maintainability' 
  | 'style' 
  | 'dependency';

export type IssueStatus = 'open' | 'fixed' | 'ignored' | 'false_positive';

export interface CodeIssue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  file: string;
  line: number;
  confidence: number; // e.g. 0.98
  description: string;
  whyItMatters: string;
  potentialImpact: string;
  exploitationScenario?: string;
  recommendation: string;
  originalCode: string;
  suggestedFix: string;
  status: IssueStatus;
  references?: string[];
}

export interface FileItem {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number; // bytes
  lines: number;
}

export type ProjectFile = FileItem;

export interface FolderNode {
  name: string;
  path: string;
  files: FileItem[];
  subfolders: FolderNode[];
}

export interface ProjectHealthScores {
  overall: number; // 0-100
  security: number;
  reliability: number;
  performance: number;
  maintainability: number;
  architecture: number;
}

export interface IssueCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface SecuritySummary {
  sqlInjection: number;
  hardcodedSecrets: number;
  insecureAuth: number;
  xss: number;
  unsafeFileHandling: number;
  ssrf: number;
  pathTraversal: number;
}

export interface CodeQualitySummary {
  cyclomaticComplexity: 'Low' | 'Moderate' | 'High' | 'Critical';
  duplicationPercentage: number;
  longFunctionsCount: number;
  deadCodeLocations: number;
  namingIssues: number;
  errorHandlingGaps: number;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'api' | 'auth' | 'services' | 'database' | 'external';
  connections: string[]; // target IDs
  issuesCount: number;
  status: 'healthy' | 'warning' | 'critical';
  details?: string;
}

export interface DependencyItem {
  name: string;
  version: string;
  latestVersion?: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  vulnerability?: string;
  cve?: string;
  license: string;
  usageFile: string;
  description: string;
}

export interface AnalysisResult {
  projectId: string;
  projectName: string;
  analyzedAt: string;
  scores: ProjectHealthScores;
  issueCounts: IssueCounts;
  securitySummary: SecuritySummary;
  qualitySummary: CodeQualitySummary;
  issues: CodeIssue[];
  architectureNodes: ArchitectureNode[];
  dependencies: DependencyItem[];
  languagesBreakdown: { name: string; percentage: number; color: string }[];
  totalFiles: number;
  totalLines: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  uploadedAt: string;
  files: FileItem[];
  languages: { name: string; percentage: number; color: string }[];
  totalLines: number;
  analysis?: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  fileReferences?: { file: string; line?: number; snippet?: string }[];
}

export interface RefactorRequest {
  filePath: string;
  codeSnippet: string;
  goal: 'readability' | 'complexity' | 'performance' | 'security' | 'design_patterns' | 'error_handling' | 'type_safety';
}

export interface RefactorResult {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  improvements: string[];
}

export interface TestGenRequest {
  filePath: string;
  codeSnippet: string;
  framework: 'jest' | 'vitest' | 'pytest' | 'go_test';
}

export interface TestGenResult {
  testCode: string;
  coverageNotes: string[];
  testCasesCount: number;
}
