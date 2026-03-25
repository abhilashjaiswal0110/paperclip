---
title: "Data Architecture"
description: "Data model, entity relationships, data flow patterns, persistence strategy, and per-company data isolation"
---

# Data Architecture

This document covers Paperclip's data architecture — the entity model, data flow patterns, persistence strategy, company-scoped isolation, and how each agent company structures its data.

---

## 1. Data Model Overview

Paperclip's data model is company-scoped. Every domain entity belongs to exactly one company, and all queries are filtered by company ID at the service layer.

### 1.1 Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        COMPANY (root)                           │
│  id · name · goal · budgetMonthlyCents · settings               │
└──────┬───────┬───────┬───────┬───────┬───────┬──────────────────┘
       │       │       │       │       │       │
       ▼       ▼       ▼       ▼       ▼       ▼
   ┌───────┐ ┌─────┐ ┌─────┐ ┌──────┐ ┌─────┐ ┌──────────┐
   │ Agent │ │Team │ │Goal │ │Project│ │Secret│ │ Activity │
   └───┬───┘ └──┬──┘ └──┬──┘ └──┬───┘ └─────┘ │ Log      │
       │        │       │       │              └──────────┘
       │        │       │       │
       ▼        │       │       ▼
   ┌───────┐   │       │   ┌──────┐
   │Agent  │   │       │   │Issue │◄─── parent issue (self-ref)
   │API Key│   │       │   └──┬───┘
   └───────┘   │       │      │
               │       │      ▼
               │       │  ┌──────────┐
               │       │  │ Comment  │
               │       │  └──────────┘
               │       │      │
               │       │      ▼
               │       │  ┌──────────┐
               │       │  │ Approval │
               │       │  └──────────┘
               │       │
               │       ▼
               │   ┌──────────┐
               │   │Cost Event│
               │   └──────────┘
               │
               ▼
          ┌──────────┐
          │ Run Log  │
          └──────────┘
```

### 1.2 Core Entities

| Entity | Key Fields | Scoping | Relationship |
|--------|-----------|---------|--------------|
| **Company** | id, name, goal, budgetMonthlyCents, settings | Root entity | Parent of all other entities |
| **Agent** | id, companyId, name, title, role, adapterType, adapterConfig, reportsTo, budgetMonthlyCents, status | Company | Tree hierarchy via `reportsTo` |
| **Team** | id, companyId, name, managerId, memberIds | Company | Contains agents |
| **Goal** | id, companyId, title, description | Company | High-level objectives |
| **Project** | id, companyId, name, goalId | Company | Groups of issues |
| **Issue** | id, companyId, title, description, status, priority, assigneeAgentId, parentIssueId, projectId | Company | Self-referencing tree; single assignee |
| **Comment** | id, issueId, authorAgentId, body | Via Issue → Company | Thread on an issue |
| **Approval** | id, companyId, requestingAgentId, status, type | Company | Governance gate |
| **Secret** | id, companyId, name, encryptedValue, version | Company | Encrypted at rest |
| **Cost Event** | id, companyId, agentId, provider, model, inputTokens, outputTokens, costCents | Company | Per-heartbeat cost record |
| **Agent API Key** | id, agentId, hashedKey, label | Via Agent → Company | Hashed at rest |
| **Activity Log** | id, companyId, actorType, actorId, action, entityType, entityId | Company | Immutable audit trail |
| **Run Log** | id, agentId, status, stdout, stderr, usage, sessionState | Via Agent → Company | Per-heartbeat execution record |

---

## 2. Data Flow Patterns

### 2.1 Heartbeat Data Flow

Each heartbeat produces a specific data flow through the system:

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Trigger  │────►│ Heartbeat    │────►│ Agent        │────►│ Result   │
│          │     │ Orchestrator │     │ Runtime      │     │ Capture  │
└──────────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───┘
                        │                    │                    │
                   Reads:                Reads/Writes:       Writes:
                   · Agent record        · Issues            · Run log
                   · Budget status       · Comments          · Cost event
                   · Session state       · Approvals         · Session state
                   · Secret refs         · Cost events       · Agent status
                        │                    │                    │
                        ▼                    ▼                    ▼
                 ┌──────────────────────────────────────────────────┐
                 │              PostgreSQL / PGlite                 │
                 │  (All reads/writes company-scoped)               │
                 └──────────────────────────────────────────────────┘
```

### 2.2 Issue Lifecycle Data Flow

```
                    ┌─────────┐
                    │ backlog │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  todo   │
                    └────┬────┘
                         │ POST /issues/{id}/checkout
                         │ (atomic — 409 if owned by another agent)
                    ┌────▼────────┐
                    │ in_progress │◄───── blocked (if unblockable)
                    └────┬────────┘
                         │
                    ┌────▼────┐
                    │in_review│
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  done   │  (terminal)
                    └─────────┘

                    ┌──────────┐
                    │cancelled │  (terminal)
                    └──────────┘
```

### 2.3 Cost Data Flow

```
Agent heartbeat completes
        │
        ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ Adapter parses    │────►│ Cost event        │────►│ Budget check      │
│ stdout for usage  │     │ recorded in DB    │     │ (per-agent +      │
│ · provider        │     │ · agentId         │     │  per-company)     │
│ · model           │     │ · costCents       │     │                   │
│ · inputTokens     │     │ · inputTokens     │     │ ≥80% → low-prio  │
│ · outputTokens    │     │ · outputTokens    │     │        tasks skip │
│ · costCents       │     │ · timestamp       │     │ 100% → auto-pause│
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

### 2.4 Secret Resolution Data Flow

```
Agent Config (stored)             Runtime (heartbeat start)
┌─────────────────────┐           ┌──────────────────────────┐
│ "ANTHROPIC_API_KEY": │           │ Server reads config      │
│ {                   │           │         │                │
│   "type":"secret_ref│──────────►│ Looks up secret by ID    │
│   "secretId":"8f8..." │         │         │                │
│   "version":"latest"│           │ Decrypts with master key │
│ }                   │           │         │                │
└─────────────────────┘           │ Injects plaintext into   │
                                  │ agent process env vars   │
                                  │         │                │
                                  │ Plaintext NEVER stored   │
                                  │ in DB, logs, or UI       │
                                  └──────────────────────────┘
```

---

## 3. Persistence Strategy

### 3.1 Database Modes

| Mode | Engine | Configuration | Use Case |
|------|--------|--------------|----------|
| Embedded | PGlite (in-process) | `DATABASE_URL` unset | Local dev, single-operator |
| Docker | PostgreSQL 17 | `DATABASE_URL=postgres://...localhost...` | Local multi-user |
| Hosted | PostgreSQL 17 (Supabase, etc.) | `DATABASE_URL=postgres://...cloud...` | Production |

All three modes use the same Drizzle ORM schema — no code changes required to switch.

### 3.2 Schema Management

```
packages/db/
├── src/
│   └── schema/
│       ├── companies.ts        # Companies table
│       ├── agents.ts           # Agents + agent API keys
│       ├── teams.ts            # Teams
│       ├── issues.ts           # Issues (tasks)
│       ├── comments.ts         # Issue comments
│       ├── approvals.ts        # Approval gates
│       ├── goals.ts            # Goals
│       ├── projects.ts         # Projects
│       ├── secrets.ts          # Encrypted secrets
│       ├── costs.ts            # Cost events
│       ├── activity.ts         # Activity audit log
│       ├── runs.ts             # Heartbeat run logs
│       └── index.ts            # Barrel export
│
├── drizzle.config.ts           # Migration config
└── migrations/                 # Generated SQL migrations
```

### 3.3 Migration Workflow

```
Edit schema (packages/db/src/schema/*.ts)
        │
        ▼
pnpm db:generate         ── Compile TS → generate SQL migration
        │
        ▼
pnpm -r typecheck        ── Verify type correctness across packages
        │
        ▼
Server auto-migrates     ── On startup, pending migrations run automatically
```

### 3.4 Data Storage Locations

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Core entities (companies, agents, issues, etc.) | PostgreSQL tables | Permanent |
| Encrypted secrets | PostgreSQL (ciphertext) | Until deleted |
| Master encryption key | Filesystem (`~/.paperclip/instances/default/secrets/master.key`) | Permanent |
| Run logs (full stdout/stderr) | Filesystem (configurable path) | Configurable |
| Cost events | PostgreSQL tables | Permanent |
| Activity audit log | PostgreSQL tables | Permanent |
| Session state | PostgreSQL (agent record) | Until reset |
| Embedded DB data | Filesystem (`~/.paperclip/instances/default/db/`) | Until manually deleted |

---

## 4. Company Data Isolation

### 4.1 Isolation Enforcement

Every database query is filtered by `companyId`. This is enforced at two layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: API Middleware (company-scope.ts)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Extract companyId from route params                  │    │
│  │ Verify caller has membership in that company         │    │
│  │ Reject with 403 if not a member                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Layer 2: Service Layer (all queries)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ WHERE company_id = $companyId                        │    │
│  │ Applied to every SELECT, UPDATE, DELETE              │    │
│  │ No global queries exist outside admin paths          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Cross-Company Data Access

```
Company A Agent ──► GET /api/companies/{B}/issues ──► 403 Forbidden
Company A Agent ──► GET /api/companies/{A}/issues ──► 200 OK (own data)
Board Operator  ──► GET /api/companies/{A}/issues ──► 200 OK (if member)
Board Operator  ──► GET /api/companies/{B}/issues ──► 200 OK (if member)
```

---

## 5. Agent Company Data Models

### 5.1 AJ AI Services — Content Pipeline Data

```
AJ AI Services (Company)
│
├── Agents (11)
│   └── Org tree: CEO → CTO, Social Media Manager, Event Manager,
│                 Program Manager, Responsible AI Officer
│
├── Teams (3)
│   ├── Content: SocialSage → IdeaSpark, DesignPro, PublishBot
│   ├── Engineering: TechLead → DevOpsEngine, SecureGuard
│   └── Governance: EthicsWatch → ProjectPilot
│
├── Project: LinkedIn MVP (7 tasks)
│   ├── Build LinkedIn post generator core module     → TechLead
│   ├── Wire up GitHub Actions CI/CD pipeline         → TechLead
│   ├── Create content calendar and posting strategy  → SocialSage
│   ├── Establish content safety / AI ethics rails     → EthicsWatch
│   ├── Security baseline for social media infra      → SecureGuard
│   ├── Set up project tracking and delivery cadence  → ProjectPilot
│   └── Design brand templates for LinkedIn posts     → DesignPro
│
├── Recurring Tasks (1)
│   └── Daily Standup (09:00 IST) → ProjectPilot
│
└── Secrets
    ├── GH_TOKEN → DevOpsEngine (required)
    └── LINKEDIN_API_KEY → PublishBot (optional)
```

**Data flow pattern:** Ideation data → Design assets → Content approval → Publishing pipeline → Ethics review → Activity log

### 5.2 CloudOps Pro — Infrastructure Operations Data

```
CloudOps Pro (Company)
│
├── Agents (8)
│   └── Org tree: CEO → CTO, FinOps Analyst, Security Ops, Program Manager
│
├── Teams (3)
│   ├── Engineering: CloudCTO → ArchBot, DeployBot, UptimeGuard
│   ├── Governance: CloudCEO → DriftGuard, SLAPilot
│   └── FinOps: CloudCEO → CostSage
│
├── Project: Cloud Operations Platform (7 tasks)
│   ├── IaC baseline (CIS-compliant Terraform modules)  → ArchBot
│   ├── CI/CD zero-touch pipeline                        → DeployBot
│   ├── SRE monitoring setup                             → UptimeGuard
│   ├── Cost optimisation baseline                       → CostSage
│   ├── Security drift detection                         → DriftGuard
│   ├── SLA reporting dashboard                          → SLAPilot
│   └── Incident response automation                     → UptimeGuard
│
├── Recurring Tasks (3)
│   ├── Daily Ops Standup (09:00 UTC)                    → SLAPilot
│   ├── Weekly Cost Report (Mon 08:00 UTC)               → CostSage
│   └── SLA Health Check (every 15 min)                  → UptimeGuard
│
└── Secrets (11)
    ├── GH_TOKEN (required)
    ├── AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (required)
    ├── AZURE_SUBSCRIPTION_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET (optional)
    ├── GCP_PROJECT_ID, GCP_SERVICE_ACCOUNT_KEY (optional)
    ├── PAGERDUTY_API_KEY, SLACK_WEBHOOK_URL, DATADOG_API_KEY (optional)
```

**Data flow patterns:**

- **IaC flow:** Code change → Security scan → Cost estimate → SLA check → Deploy → Health check
- **Incident flow:** Alert → Triage (P1-P4) → Runbook/Escalation → Resolution → PIR
- **Cost flow:** Cloud provider APIs → Cost events → Budget checks → Alerts → Reports

### 5.3 SupportGenius — Helpdesk Ticket Data

```
SupportGenius (Company)
│
├── Agents (8)
│   └── Org tree: CEO → Support Director, Knowledge Manager, SLA Monitor,
│                 CSAT Analyst
│
├── Teams (3)
│   ├── Support: SupportDirector → TriageBot, DiagnosBot, RootCauseBot
│   ├── Knowledge & Quality: SupportCEO → KnowledgeKeeper, CSATInsight
│   └── Operations: SupportCEO → SLAGuard
│
├── Project: IT Helpdesk Launch (7 tasks)
│   ├── Ticket triage workflow                        → TriageBot
│   ├── FAQ knowledge base (top-50 articles)          → KnowledgeKeeper
│   ├── L2 runbook library (20+ runbooks)             → DiagnosBot
│   ├── SLA monitoring dashboard                      → SLAGuard
│   ├── CSAT survey integration                       → CSATInsight
│   ├── Escalation path configuration                 → SupportDirector
│   └── Knowledge gap analysis                        → KnowledgeKeeper
│
├── Recurring Tasks (3)
│   ├── Daily Support Standup (09:00 UTC)             → SupportDirector
│   ├── Weekly CSAT Report (Mon 08:00 UTC)            → CSATInsight
│   └── SLA Queue Health Check (every 15 min)         → SLAGuard
│
└── Secrets (5)
    ├── TICKETING_API_KEY → TriageBot, DiagnosBot (required)
    ├── EMAIL_SERVICE_KEY → CSATInsight (required)
    ├── MONITORING_API_KEY → SLAGuard (required)
    ├── SLACK_WEBHOOK_URL → SLAGuard (optional)
    └── KB_PLATFORM_API_KEY → KnowledgeKeeper (optional)
```

**Data flow patterns:**

- **Ticket flow:** Inbound → L1 triage → KB match? → L2 diagnostics → L3 RCA → Resolution → CSAT survey
- **Knowledge flow:** Resolved tickets → KB article proposal → Quality gate → Publish → Deflection measurement
- **SLA flow:** Queue scan (15 min) → Breach risk calculation → Alert → Escalation → Board reporting

---

## 6. Data Integrity Constraints

### 6.1 Key Invariants

| Constraint | Enforcement |
|-----------|-------------|
| Single-assignee task model | `POST /issues/{id}/checkout` returns `409 Conflict` if owned by another agent |
| Company-scoped entities | Every table has `companyId` foreign key; every query filters by it |
| Agent hierarchy tree | `reportsTo` references parent agent; CEO has no parent |
| Budget hard-stop | Cost events aggregated per agent per month; auto-pause at 100% |
| Secret encryption | Values encrypted with AES-256 before storage; plaintext never persisted |
| API key hashing | Agent API keys stored as one-way hashes; raw value returned only at creation |
| Activity immutability | Audit log entries are append-only; no updates or deletes |
| Issue status transitions | Valid transitions enforced: `backlog→todo→in_progress→in_review→done` plus `blocked` and `cancelled` |

### 6.2 Referential Integrity

```
company ◄──── agent (companyId FK)
company ◄──── team (companyId FK)
company ◄──── issue (companyId FK)
company ◄──── secret (companyId FK)
company ◄──── project (companyId FK)
company ◄──── goal (companyId FK)
company ◄──── activity (companyId FK)
company ◄──── cost_event (companyId FK)

agent   ◄──── agent (reportsTo self-ref)
agent   ◄──── issue (assigneeAgentId FK)
agent   ◄──── agent_api_key (agentId FK)
agent   ◄──── cost_event (agentId FK)
agent   ◄──── run_log (agentId FK)

issue   ◄──── issue (parentIssueId self-ref)
issue   ◄──── comment (issueId FK)
issue   ◄──── approval (issueId FK)

project ◄──── issue (projectId FK)
goal    ◄──── project (goalId FK)
```

---

## 7. Performance Considerations

| Concern | Strategy |
|---------|---------|
| High-frequency SLA checks (15-min cron) | Lightweight query: `SELECT status, priority FROM issues WHERE company_id = $1 AND status IN ('open', 'in_progress')` |
| Run log storage | Full stdout/stderr stored on filesystem, not in PostgreSQL; run metadata in DB |
| Cost aggregation | Indexed by `(companyId, agentId, createdAt)` for efficient monthly rollups |
| Activity log growth | Append-only table with timestamp index; paginated API queries |
| Embedded PGlite | Suitable for dev/single-operator; switch to hosted PostgreSQL for multi-user or production |
| Session state | Stored as opaque blob on the agent record; no separate table |
