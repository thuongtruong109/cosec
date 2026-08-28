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

export interface TaintFlowStep {
  type: 'source' | 'step' | 'sanitizer' | 'sink';
  label: string;
  file: string;
  line: number;
  snippet: string;
}

export interface TaintFlow {
  source: string;
  sink: string;
  sinkType: 'sql' | 'xss' | 'command' | 'path_traversal' | 'ssrf' | 'deserialization' | 'eval';
  isSanitized: boolean;
  sanitizerUsed?: string;
  steps: TaintFlowStep[];
}

export interface CodeIssue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  file: string;
  line: number;
  confidence: number; // e.g. 0.98
  description: string;
  whyItMatters?: string;
  potentialImpact?: string;
  exploitationScenario?: string;
  recommendation?: string;
  originalCode?: string;
  codeSnippet?: string;
  fixedCode?: string;
  suggestedFix: string;
  status: IssueStatus;
  cwe?: string;
  references?: string[];
  analysisTier?: 'tier1_rules' | 'tier2_ast_taint' | 'tier3_ai_reasoning';
  taintFlow?: TaintFlow;
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
  bug?: number;
  performance?: number;
  architecture?: number;
  maintainability?: number;
  security?: number;
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
  type: 'frontend' | 'api' | 'auth' | 'services' | 'database' | 'external' | 'queue';
  layer?: number; // 0=Client, 1=Gateway/API, 2=Domain Services, 3=Data/Queue, 4=External
  connections: string[]; // target IDs
  inboundConnections?: string[]; // source IDs
  files?: string[];
  symbols?: string[];
  issuesCount: number;
  status: 'healthy' | 'warning' | 'critical';
  technologies?: string[];
  details?: string;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  sourceLabel?: string;
  targetLabel?: string;
  type: 'http_rest' | 'function_call' | 'module_import' | 'database_query' | 'queue_event' | 'external_api';
  label: string;
  strength: 'high' | 'medium' | 'low';
  risk: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  riskDetails?: string;
}

export interface ArchitecturalSmell {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'coupling' | 'layer_violation' | 'circular_dependency' | 'god_module' | 'insecure_egress' | 'resilience';
  description: string;
  affectedNodes: string[];
  affectedFiles: string[];
  recommendation: string;
}

export interface VulnerabilityDetail {
  id: string; // GHSA or CVE ID
  aliases: string[]; // ['CVE-2021-23337', 'GHSA-xxxx-xxxx']
  summary: string;
  details?: string;
  fixedIn?: string;
  cvssScore?: number;
  cvssVector?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  exploitAvailable?: boolean;
  published?: string;
  references?: string[];
}

export interface DependencyItem {
  id?: string;
  name: string;
  version: string;
  resolvedVersion?: string;
  latestVersion?: string;
  ecosystem?: 'npm' | 'PyPI' | 'Go' | 'crates.io' | 'Maven' | 'Packagist' | 'RubyGems' | string;
  isDirect?: boolean;
  isTransitive?: boolean;
  dependencyPath?: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  vulnerabilities?: VulnerabilityDetail[];
  vulnerability?: string;
  cve?: string;
  ghsa?: string;
  fixedIn?: string;
  exploitAvailable?: boolean;
  license: string;
  usageFile: string;
  description: string;
}

export interface ExecutiveSummary {
  verdict: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical Risk';
  headline: string;
  summary: string;
  keyStrengths: string[];
  keyRisks: string[];
  urgentActionItems: string[];
  scanCoverage: {
    totalFilesScanned: number;
    linesOfCode: number;
    astNodesAnalyzed: number;
    dependenciesAudited: number;
    taintPathsChecked: number;
  };
}

export interface AnalysisResult {
  projectId: string;
  projectName: string;
  analyzedAt: string;
  scores: ProjectHealthScores;
  issueCounts: IssueCounts;
  securitySummary: SecuritySummary;
  qualitySummary: CodeQualitySummary;
  executiveSummary?: ExecutiveSummary;
  issues: CodeIssue[];
  architectureNodes: ArchitectureNode[];
  architectureEdges?: ArchitectureEdge[];
  architecturalSmells?: ArchitecturalSmell[];
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
  framework: string;
  coverageNotes: string[];
  testCasesCount: number;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  html_url: string;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  size: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubPushFixRequest {
  owner: string;
  repo: string;
  baseBranch?: string;
  targetBranch: string;
  commitMessage: string;
  createPullRequest?: boolean;
  prTitle?: string;
  prBody?: string;
  changes: {
    path: string;
    content: string;
  }[];
}

export interface GitHubPushFixResult {
  success: boolean;
  partial?: boolean;
  failedFiles?: string[];
  step?: 'validation' | 'blob_creation' | 'tree_creation' | 'commit_creation' | 'branch_update' | 'pr_creation';
  blobsCreated?: number;
  totalFiles?: number;
  branch?: string;
  commitSha?: string;
  commitUrl?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  message?: string;
  error?: string;
}
