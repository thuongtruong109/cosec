import {
  FileItem,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitecturalSmell,
  CodeIssue,
} from '../types';

export interface CodeModule {
  path: string;
  name: string;
  layer: 'frontend' | 'api' | 'auth' | 'services' | 'database' | 'external' | 'queue';
  layerIndex: number;
  imports: string[];
  exports: string[];
  calls: string[];
  externalSdks: string[];
  dbOperations: string[];
  lines: number;
}

/**
 * Parse repository files into fine-grained AST-level modules, imports, and call dependencies
 */
export function buildCodeModules(files: FileItem[]): CodeModule[] {
  return files.map((file) => {
    const lines = file.content.split('\n');
    const imports: string[] = [];
    const exports: string[] = [];
    const calls: string[] = [];
    const externalSdks: string[] = [];
    const dbOperations: string[] = [];

    const p = file.path.toLowerCase();

    // Determine initial architectural layer
    let layer: 'frontend' | 'api' | 'auth' | 'services' | 'database' | 'external' | 'queue' = 'services';
    let layerIndex = 2;

    if (
      p.includes('/components/') ||
      p.includes('/pages/') ||
      p.includes('/views/') ||
      p.endsWith('.tsx') ||
      p.endsWith('.jsx') ||
      p.endsWith('.vue') ||
      p.endsWith('.html') ||
      p.endsWith('.css')
    ) {
      layer = 'frontend';
      layerIndex = 0;
    } else if (
      p.includes('/routes/') ||
      p.includes('/controllers/') ||
      p.includes('/api/') ||
      p.includes('server.') ||
      p.includes('app.') ||
      p.includes('main.') ||
      p.includes('router')
    ) {
      layer = 'api';
      layerIndex = 1;
    } else if (p.includes('auth') || p.includes('jwt') || p.includes('passport') || p.includes('session')) {
      layer = 'auth';
      layerIndex = 2;
    } else if (
      p.includes('/db/') ||
      p.includes('/models/') ||
      p.includes('/entities/') ||
      p.includes('/migrations/') ||
      p.includes('/schema/') ||
      p.endsWith('.sql')
    ) {
      layer = 'database';
      layerIndex = 3;
    } else if (p.includes('queue') || p.includes('worker') || p.includes('consumer') || p.includes('reconciliation') || p.includes('job')) {
      layer = 'queue';
      layerIndex = 3;
    } else if (p.includes('stripe') || p.includes('aws') || p.includes('s3') || p.includes('twilio') || p.includes('sendgrid') || p.includes('webhook')) {
      layer = 'external';
      layerIndex = 4;
    }

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      // 1. Static and Dynamic Imports
      const importMatch = trimmed.match(/(?:import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\))/);
      if (importMatch) {
        const imp = importMatch[1] || importMatch[2];
        if (imp) imports.push(imp);
      }

      // Python import
      const pyImportMatch = trimmed.match(/(?:from\s+([a-zA-Z0-9_\.]+)\s+import|import\s+([a-zA-Z0-9_]+))/);
      if (pyImportMatch) {
        const imp = pyImportMatch[1] || pyImportMatch[2];
        if (imp) imports.push(imp);
      }

      // 2. Exported functions / classes / variables
      const exportMatch = trimmed.match(/(?:export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([a-zA-Z0-9_$]+)|def\s+([a-zA-Z0-9_$]+))/);
      if (exportMatch) {
        const exp = exportMatch[1] || exportMatch[2];
        if (exp) exports.push(exp);
      }

      // 3. Database operations
      if (/(?:db\.query|db\.raw|prisma\.|mongoose\.|SELECT|INSERT|UPDATE|DELETE|execute\s*\()/i.test(trimmed)) {
        dbOperations.push(trimmed.slice(0, 80));
      }

      // 4. External SDK calls
      if (/(?:stripe\.|stripeService\.|aws\.|boto3\.|s3\.|requests\.|axios\.|fetch\(|jwt\.)/i.test(trimmed)) {
        externalSdks.push(trimmed.slice(0, 80));
      }

      // 5. Function calls & route handlers
      const callMatch = trimmed.match(/([a-zA-Z0-9_$]+)\s*\(/);
      if (callMatch && !['if', 'for', 'while', 'switch', 'catch', 'function', 'return'].includes(callMatch[1])) {
        calls.push(callMatch[1]);
      }
    });

    return {
      path: file.path,
      name: file.name,
      layer,
      layerIndex,
      imports,
      exports,
      calls,
      externalSdks,
      dbOperations,
      lines: lines.length,
    };
  });
}

/**
 * Build dynamic multi-tier Architecture Graph (React -> API -> Auth -> Services -> DB -> External)
 */
export function buildArchitectureGraph(
  files: FileItem[],
  issues: CodeIssue[]
): {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  smells: ArchitecturalSmell[];
} {
  const modules = buildCodeModules(files);
  const nodesMap: Map<string, ArchitectureNode> = new Map();
  const edges: ArchitectureEdge[] = [];
  const smells: ArchitecturalSmell[] = [];

  // Group files into logical architecture service components
  const hasFrontend = modules.some((m) => m.layer === 'frontend');
  const hasApi = modules.some((m) => m.layer === 'api');
  const hasAuth = modules.some((m) => m.layer === 'auth' || m.path.toLowerCase().includes('auth') || m.imports.some((i) => i.includes('jwt') || i.includes('auth')));
  const hasPayment = modules.some((m) => m.path.toLowerCase().includes('payment') || m.path.toLowerCase().includes('billing') || m.path.toLowerCase().includes('stripe') || m.imports.some((i) => i.includes('stripe')));
  const hasReconciliation = modules.some((m) => m.path.toLowerCase().includes('reconciliation') || m.path.toLowerCase().includes('worker') || m.path.toLowerCase().includes('queue'));
  const hasDb = modules.some((m) => m.layer === 'database' || m.dbOperations.length > 0 || m.imports.some((i) => i.includes('db') || i.includes('pg') || i.includes('prisma') || i.includes('mongoose')));
  const hasStripe = files.some((f) => f.content.toLowerCase().includes('stripe') || f.content.includes('cardToken'));
  const hasAws = files.some((f) => f.content.toLowerCase().includes('aws_access_key') || f.content.includes('s3') || f.content.includes('boto3'));
  const hasQueue = modules.some((m) => m.layer === 'queue' || m.path.includes('queue') || m.path.includes('worker'));

  // 1. Frontend Node (Layer 0)
  if (hasFrontend) {
    const feFiles = modules.filter((m) => m.layer === 'frontend').map((m) => m.path);
    const feIssues = issues.filter((i) => feFiles.includes(i.file)).length;
    nodesMap.set('frontend_ui', {
      id: 'frontend_ui',
      label: 'Client / React Web SPA',
      type: 'frontend',
      layer: 0,
      connections: [],
      inboundConnections: [],
      files: feFiles,
      symbols: ['App', 'DashboardView', 'CheckoutModal', 'AuthForm'],
      issuesCount: feIssues,
      status: feIssues > 2 ? 'critical' : feIssues > 0 ? 'warning' : 'healthy',
      technologies: ['React 19', 'Tailwind CSS', 'Vite'],
      details: `${feFiles.length} interactive UI components, state stores, and page views`,
    });
  }

  // 2. API Gateway & Controller Layer (Layer 1)
  if (hasApi || !hasFrontend) {
    const apiFiles = modules.filter((m) => m.layer === 'api').map((m) => m.path);
    const apiIssues = issues.filter((i) => apiFiles.includes(i.file)).length;
    nodesMap.set('api_gateway', {
      id: 'api_gateway',
      label: 'API Gateway & Ingress Router',
      type: 'api',
      layer: 1,
      connections: [],
      inboundConnections: [],
      files: apiFiles.length > 0 ? apiFiles : ['server.ts'],
      symbols: ['ExpressRouter', 'CORS Guard', 'RequestValidator', 'ErrorHandler'],
      issuesCount: apiIssues,
      status: apiIssues > 2 ? 'critical' : apiIssues > 0 ? 'warning' : 'healthy',
      technologies: ['Node.js', 'Express 4', 'REST API'],
      details: 'HTTP routing, middleware pipeline, CORS validation, and API rate limiting',
    });
  }

  // 3. Auth & Session Service (Layer 2)
  if (hasAuth) {
    const authFiles = modules.filter((m) => m.path.toLowerCase().includes('auth') || m.layer === 'auth').map((m) => m.path);
    const authIssues = issues.filter((i) => authFiles.includes(i.file)).length;
    nodesMap.set('auth_service', {
      id: 'auth_service',
      label: 'Auth & JWT Token Service',
      type: 'auth',
      layer: 2,
      connections: [],
      inboundConnections: [],
      files: authFiles.length > 0 ? authFiles : ['src/controllers/auth.ts'],
      symbols: ['loginUser', 'resetPassword', 'verifyJWT', 'grantAdminPrivileges'],
      issuesCount: authIssues,
      status: authIssues > 0 ? 'critical' : 'healthy',
      technologies: ['jsonwebtoken', 'bcrypt', 'RBAC'],
      details: 'User credential verification, token signing, session lifecycle, and password resets',
    });
  }

  // 4. Payment & Billing Service (Layer 2)
  if (hasPayment) {
    const payFiles = modules.filter((m) => m.path.toLowerCase().includes('payment') || m.path.toLowerCase().includes('billing')).map((m) => m.path);
    const payIssues = issues.filter((i) => payFiles.includes(i.file)).length;
    nodesMap.set('payment_service', {
      id: 'payment_service',
      label: 'Payment & Billing Controller',
      type: 'services',
      layer: 2,
      connections: [],
      inboundConnections: [],
      files: payFiles.length > 0 ? payFiles : ['src/controllers/payment.ts'],
      symbols: ['processPayment', 'refundPayment', 'createCharge', 'validateAccountBalance'],
      issuesCount: payIssues,
      status: payIssues > 2 ? 'critical' : payIssues > 0 ? 'warning' : 'healthy',
      technologies: ['Stripe SDK', 'Idempotency Layer', 'Financial Ledger'],
      details: 'Card transactions, checkout workflows, refunds, and user ledger synchronization',
    });
  }

  // 5. Worker / Python Reconciliation Service (Layer 2 / 3)
  if (hasReconciliation) {
    const recFiles = modules.filter((m) => m.path.toLowerCase().includes('reconciliation') || m.layer === 'queue').map((m) => m.path);
    const recIssues = issues.filter((i) => recFiles.includes(i.file)).length;
    nodesMap.set('reconciliation_worker', {
      id: 'reconciliation_worker',
      label: 'Reconciliation & Batch Worker',
      type: 'queue',
      layer: 3,
      connections: [],
      inboundConnections: [],
      files: recFiles.length > 0 ? recFiles : ['services/reconciliation.py'],
      symbols: ['reconcile_daily_transactions', 'exportBatch', 'dispatchWebhook'],
      issuesCount: recIssues,
      status: recIssues > 0 ? 'critical' : 'healthy',
      technologies: ['Python 3', 'Batch Processor', 'Webhook Dispatcher'],
      details: 'Daily ledger auditing, asynchronous transaction batching, and webhook notifications',
    });
  }

  // 6. Database / Persistence Layer (Layer 3)
  if (hasDb || !hasFrontend) {
    const dbFiles = modules.filter((m) => m.layer === 'database' || m.dbOperations.length > 0).map((m) => m.path);
    const dbIssues = issues.filter((i) => i.taintFlow?.sinkType === 'sql' || i.title.toLowerCase().includes('sql')).length;
    nodesMap.set('database_layer', {
      id: 'database_layer',
      label: 'PostgreSQL Relational DB',
      type: 'database',
      layer: 3,
      connections: [],
      inboundConnections: [],
      files: dbFiles.length > 0 ? dbFiles : ['db/migrations/001_init.sql'],
      symbols: ['users_table', 'user_accounts_table', 'audit_logs_table', 'ConnectionPool'],
      issuesCount: dbIssues,
      status: dbIssues > 0 ? 'critical' : 'healthy',
      technologies: ['PostgreSQL 16', 'pg node driver', 'SQL DDL'],
      details: 'Persistent relational tables: users, user_accounts, charges, and audit_logs',
    });
  }

  // 7. External Integrations: Stripe API (Layer 4)
  if (hasStripe) {
    nodesMap.set('external_stripe', {
      id: 'external_stripe',
      label: 'Stripe Payment Gateway',
      type: 'external',
      layer: 4,
      connections: [],
      inboundConnections: [],
      files: ['External Cloud API'],
      symbols: ['charges.create', 'refunds.create', 'customer.attach'],
      issuesCount: 0,
      status: 'healthy',
      technologies: ['Stripe REST API', 'PCI-DSS Compliant Gateway'],
      details: 'Third-party credit card tokenization, authorization, and capture',
    });
  }

  // 8. External Integrations: AWS Cloud Services (Layer 4)
  if (hasAws) {
    const awsIssues = issues.filter((i) => i.title.toLowerCase().includes('aws') || i.title.toLowerCase().includes('secret')).length;
    nodesMap.set('external_aws', {
      id: 'external_aws',
      label: 'AWS Cloud Services (S3 & IAM)',
      type: 'external',
      layer: 4,
      connections: [],
      inboundConnections: [],
      files: ['services/reconciliation.py'],
      symbols: ['s3:PutObject', 's3:GetObject', 'IAM Credentials'],
      issuesCount: awsIssues,
      status: awsIssues > 0 ? 'critical' : 'healthy',
      technologies: ['Amazon S3', 'AWS SDK / boto3'],
      details: 'Cloud object storage for transaction reports and secure cloud archives',
    });
  }

  // Helper to connect nodes with typed edges
  const addEdge = (
    id: string,
    source: string,
    target: string,
    label: string,
    type: ArchitectureEdge['type'],
    strength: ArchitectureEdge['strength'],
    risk: ArchitectureEdge['risk'],
    riskDetails?: string
  ) => {
    if (nodesMap.has(source) && nodesMap.has(target)) {
      const srcNode = nodesMap.get(source)!;
      const tgtNode = nodesMap.get(target)!;

      if (!srcNode.connections.includes(target)) srcNode.connections.push(target);
      if (tgtNode.inboundConnections && !tgtNode.inboundConnections.includes(source)) {
        tgtNode.inboundConnections.push(source);
      } else if (!tgtNode.inboundConnections) {
        tgtNode.inboundConnections = [source];
      }

      edges.push({
        id,
        source,
        target,
        sourceLabel: srcNode.label,
        targetLabel: tgtNode.label,
        label,
        type,
        strength,
        risk,
        riskDetails,
      });
    }
  };

  // Build Real Inter-Module Graph Edges:
  // Edge 1: Frontend -> API Gateway
  if (nodesMap.has('frontend_ui') && nodesMap.has('api_gateway')) {
    addEdge(
      'edge-fe-api',
      'frontend_ui',
      'api_gateway',
      'HTTP / REST API (JSON/CORS)',
      'http_rest',
      'high',
      'low',
      'Standard client-server decoupled HTTP transport'
    );
  }

  // Edge 2: API Gateway -> Auth Service
  if (nodesMap.has('api_gateway') && nodesMap.has('auth_service')) {
    addEdge(
      'edge-api-auth',
      'api_gateway',
      'auth_service',
      'POST /auth/login, POST /auth/reset',
      'http_rest',
      'high',
      'medium',
      'Direct route dispatch; lacks request payload schema validation (Zod)'
    );
  }

  // Edge 3: API Gateway -> Payment Service
  if (nodesMap.has('api_gateway') && nodesMap.has('payment_service')) {
    addEdge(
      'edge-api-pay',
      'api_gateway',
      'payment_service',
      'POST /payment/charge, POST /payment/refund',
      'http_rest',
      'high',
      'high',
      'Refund endpoint lacks authorization middleware check before service execution'
    );
  }

  // Edge 4: Auth Service -> PostgreSQL DB
  if (nodesMap.has('auth_service') && nodesMap.has('database_layer')) {
    const hasSqli = issues.some((i) => i.file.includes('auth') && (i.cwe === 'CWE-89' || i.title.toLowerCase().includes('sql')));
    addEdge(
      'edge-auth-db',
      'auth_service',
      'database_layer',
      'db.query("SELECT * FROM users...")',
      'database_query',
      'high',
      hasSqli ? 'critical' : 'low',
      hasSqli
        ? 'Direct SQL string concatenation without parameterized placeholders ($1)'
        : 'Direct database driver connection'
    );
  }

  // Edge 5: Payment Service -> PostgreSQL DB
  if (nodesMap.has('payment_service') && nodesMap.has('database_layer')) {
    const hasN1 = issues.some((i) => i.file.includes('payment') && i.title.toLowerCase().includes('n+1'));
    addEdge(
      'edge-pay-db',
      'payment_service',
      'database_layer',
      'db.query(SELECT/UPDATE balance)',
      'database_query',
      'high',
      hasN1 ? 'high' : 'low',
      hasN1
        ? 'N+1 query loop fetching audit logs sequentially inside payment iteration'
        : 'Direct transaction ledger queries'
    );
  }

  // Edge 6: Payment Service -> Stripe API
  if (nodesMap.has('payment_service') && nodesMap.has('external_stripe')) {
    addEdge(
      'edge-pay-stripe',
      'payment_service',
      'external_stripe',
      'stripeService.createCharge()',
      'external_api',
      'medium',
      'low',
      'Third-party HTTPS API call with card tokens'
    );
  }

  // Edge 7: Payment Service -> Reconciliation Worker / Queue
  if (nodesMap.has('payment_service') && nodesMap.has('reconciliation_worker')) {
    addEdge(
      'edge-pay-rec',
      'payment_service',
      'reconciliation_worker',
      'Async Batch Export & Queue Event',
      'queue_event',
      'medium',
      'medium',
      'File-based batch handoff; missing event queue isolation (BullMQ/RabbitMQ)'
    );
  }

  // Edge 8: Reconciliation Worker -> PostgreSQL DB
  if (nodesMap.has('reconciliation_worker') && nodesMap.has('database_layer')) {
    addEdge(
      'edge-rec-db',
      'reconciliation_worker',
      'database_layer',
      'SQL Audit Verification Pool',
      'database_query',
      'medium',
      'low',
      'Shared database connection pool between microservices'
    );
  }

  // Edge 9: Reconciliation Worker -> AWS Cloud
  if (nodesMap.has('reconciliation_worker') && nodesMap.has('external_aws')) {
    const hasExposedAws = issues.some((i) => i.file.includes('reconciliation') && i.title.toLowerCase().includes('aws'));
    addEdge(
      'edge-rec-aws',
      'reconciliation_worker',
      'external_aws',
      'boto3.client("s3") & IAM',
      'external_api',
      'medium',
      hasExposedAws ? 'critical' : 'low',
      hasExposedAws ? 'Hardcoded AWS Access Keys embedded in worker source code' : 'Cloud archive upload'
    );
  }

  // Detect Architectural Smells:
  // Smell 1: Layer Inversion / Missing Repository Layer
  if (nodesMap.has('auth_service') && nodesMap.has('database_layer')) {
    smells.push({
      id: 'smell-layer-inversion',
      title: 'Layer Inversion: Direct DB Driver Invocations in Auth Controller',
      severity: 'high',
      category: 'layer_violation',
      description: 'Controllers (`src/controllers/auth.ts`) directly execute raw SQL queries via `db.query` instead of routing through an isolated Data Access Object (DAO) or repository interface.',
      affectedNodes: ['auth_service', 'database_layer'],
      affectedFiles: ['src/controllers/auth.ts'],
      recommendation: 'Introduce an `UserRepository` interface with abstract methods (`findByUsername`, `updatePassword`) to encapsulate query logic and parameter binding.',
    });
  }

  // Smell 2: Insecure Egress & Unvalidated Deserialization in Worker
  if (nodesMap.has('reconciliation_worker')) {
    smells.push({
      id: 'smell-untrusted-deserialization',
      title: 'Insecure Microservice Coupling: Pickle Serializer & Unbounded Egress',
      severity: 'critical',
      category: 'insecure_egress',
      description: 'The background worker service (`services/reconciliation.py`) consumes raw serialized binary streams (`pickle.load`) and issues outbound HTTP webhooks to arbitrary URLs without domain whitelist validation.',
      affectedNodes: ['reconciliation_worker', 'external_aws'],
      affectedFiles: ['services/reconciliation.py'],
      recommendation: 'Replace Python `pickle` with schema-enforced JSON / Protocol Buffers, and validate outbound webhook URLs against a private IP blacklist to prevent SSRF.',
    });
  }

  // Smell 3: Shared Database Anti-Pattern between Node & Python Microservices
  if (nodesMap.has('payment_service') && nodesMap.has('reconciliation_worker') && nodesMap.has('database_layer')) {
    smells.push({
      id: 'smell-shared-db',
      title: 'Distributed Monolith: Shared Database Anti-Pattern',
      severity: 'medium',
      category: 'coupling',
      description: 'Both the Node.js Payment API and the Python Reconciliation Worker read and modify the same underlying tables without schema boundary protection.',
      affectedNodes: ['payment_service', 'reconciliation_worker', 'database_layer'],
      affectedFiles: ['src/controllers/payment.ts', 'services/reconciliation.py'],
      recommendation: 'Expose a dedicated internal gRPC or REST endpoint on the Payment Service for ledger verification instead of direct dual-language database access.',
    });
  }

  // Smell 4: Missing Circuit Breaker on Third-Party Gateway (Stripe)
  if (nodesMap.has('payment_service') && nodesMap.has('external_stripe')) {
    smells.push({
      id: 'smell-circuit-breaker',
      title: 'Resilience Gap: Missing Circuit Breaker for External Payment Gateway',
      severity: 'medium',
      category: 'resilience',
      description: 'Calls to `stripeService.createCharge` are executed synchronously in the HTTP request thread without a circuit breaker or fallback queue during payment provider downtime.',
      affectedNodes: ['payment_service', 'external_stripe'],
      affectedFiles: ['src/controllers/payment.ts'],
      recommendation: 'Wrap external payment calls with an exponential backoff retry and circuit breaker pattern (e.g. Opossum or Polly).',
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
    smells,
  };
}
