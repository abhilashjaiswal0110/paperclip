---
title: "Software Architecture"
description: "Technical architecture reference — system layers, agent execution model, deployment topology, and inter-component flows"
---

# Software Architecture

This document provides the technical architecture reference for Paperclip from a software architect's perspective. It covers system layering, component responsibilities, agent execution flows, adapter extensibility, and deployment topology.

---

## 1. System Context

Paperclip is a **control plane** for autonomous AI agent companies. It orchestrates agents — it does not execute them. Agents run in external runtimes (Claude Code CLI, Codex CLI, shell processes, HTTP endpoints) and communicate with Paperclip exclusively through its REST API.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SYSTEMS                            │
│  Cloud Providers (AWS/Azure/GCP)  ·  GitHub  ·  PagerDuty  ·  LLMs │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ API calls from agent runtimes
┌────────────────────────────▼─────────────────────────────────────────┐
│                      PAPERCLIP CONTROL PLANE                        │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐  │
│  │  React UI   │  │  REST API    │  │  Adapters   │  │  Database  │ │
│  │  (Vite)     │◄─┤  (Express)   │──┤  (Plugins)  │  │  (PG/     │ │
│  │             │  │              │  │             │  │  PGlite)  │ │
│  └─────────────┘  └──────┬───────┘  └──────┬──────┘  └───────────┘ │
│                          │                 │                        │
│                   ┌──────▼───────┐  ┌──────▼──────┐                 │
│                   │  Services    │  │  Agent      │                 │
│                   │  (Business   │  │  Runtimes   │                 │
│                   │   Logic)     │  │  (External) │                 │
│                   └──────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layered Architecture

### 2.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                             │
│  React 19 · Vite 6 · React Router 7 · Radix UI · Tailwind CSS  │
│  TanStack Query · SSE live updates · Company-scoped context     │
├─────────────────────────────────────────────────────────────────┤
│  API LAYER                                                      │
│  Express.js 5 · REST endpoints · Auth middleware · Rate limiting │
│  Activity logging · Company scoping · Error normalization       │
├─────────────────────────────────────────────────────────────────┤
│  SERVICE LAYER                                                  │
│  Business logic · Heartbeat orchestration · Budget enforcement  │
│  Approval gates · Atomic checkout · Session management          │
├─────────────────────────────────────────────────────────────────┤
│  ADAPTER LAYER                                                  │
│  claude_local · codex_local · gemini_local · opencode_local     │
│  process · http · openclaw · Custom adapters                    │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                     │
│  PostgreSQL 17 / PGlite (embedded) · Drizzle ORM               │
│  Encrypted secrets store · Run log storage                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Layer Responsibilities

| Layer | Responsibilities | Key Packages |
|-------|-----------------|--------------|
| Presentation | Dashboard rendering, org chart, task management, live run viewer, company selector | `ui/` |
| API | Route handling, auth enforcement, request validation, HTTP error normalization, activity audit logging | `server/src/routes/` |
| Service | Business logic, heartbeat scheduling, budget checks, approval workflow, atomic task checkout, wake coalescing | `server/src/services/` |
| Adapter | Agent runtime bridging: spawn process, capture stdout, parse cost/usage, session persistence | `packages/adapters/`, `server/src/adapters/` |
| Data | Schema definition, migrations, query building, encrypted secret storage, embedded DB management | `packages/db/` |

### 2.3 Shared Packages

| Package | Purpose |
|---------|---------|
| `packages/shared` | API types, path constants, validators, enums — shared between server, UI, and CLI |
| `packages/adapter-utils` | Adapter interface definitions, base classes, and helpers |
| `packages/db` | Drizzle schema, migration runner, DB client factory |

---

## 3. Component Architecture

### 3.1 Monorepo Structure

```
paperclip/
├── ui/                              # React SPA
│   ├── src/pages/                   # Route pages (dashboard, agents, issues, etc.)
│   ├── src/components/              # Shared React components
│   ├── src/api/                     # API client (fetch + TanStack Query)
│   └── src/context/                 # React context (company, auth, theme)
│
├── server/                          # Express.js API server
│   ├── src/routes/                  # REST route handlers
│   ├── src/services/                # Business logic services
│   ├── src/adapters/                # Adapter registry and execution
│   └── src/middleware/              # Auth, logging, error handling
│
├── packages/
│   ├── db/                          # Drizzle ORM schema + migrations
│   │   └── src/schema/              # Table definitions
│   ├── shared/                      # Cross-package types and constants
│   ├── adapter-utils/               # Adapter interface contracts
│   └── adapters/                    # Adapter implementations
│       ├── claude-local/            #   Claude Code CLI adapter
│       ├── codex-local/             #   OpenAI Codex CLI adapter
│       └── ...                      #   Additional adapter packages
│
├── cli/                             # CLI client (setup + control-plane commands)
├── agents/                          # Agent company packages + skill definitions
├── skills/                          # Core Paperclip agent skills
└── docs/                            # Public documentation (Mintlify)
```

### 3.2 Server Component Breakdown

```
server/src/
├── routes/
│   ├── companies.ts                 # CRUD + dashboard + import/export
│   ├── agents.ts                    # CRUD + invoke + keys + /me
│   ├── issues.ts                    # CRUD + checkout + status transitions
│   ├── approvals.ts                 # Request + resolve approval gates
│   ├── costs.ts                     # Cost events + budget queries
│   ├── secrets.ts                   # Encrypted secret CRUD
│   ├── activity.ts                  # Audit log queries
│   └── health.ts                    # Health check endpoint
│
├── services/
│   ├── heartbeat.ts                 # Heartbeat scheduling + execution
│   ├── budget.ts                    # Budget enforcement + auto-pause
│   ├── checkout.ts                  # Atomic task checkout (409 on conflict)
│   └── session.ts                   # Agent session persistence
│
├── adapters/
│   ├── registry.ts                  # Adapter type → implementation mapping
│   └── executor.ts                  # Unified execute() dispatcher
│
└── middleware/
    ├── auth.ts                      # JWT / API key / session auth
    ├── company-scope.ts             # Company boundary enforcement
    └── activity-log.ts              # Mutation audit trail
```

---

## 4. Agent Execution Flow

### 4.1 Heartbeat Lifecycle

This is the core execution cycle. Every agent interaction follows this sequence:

```
                    ┌─────────────────────┐
                    │     TRIGGER          │
                    │  timer / assignment  │
                    │  mention / manual /  │
                    │  approval resolved   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  WAKE COALESCING    │
                    │  If agent already   │
                    │  running → merge    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  BUDGET CHECK       │
                    │  spentMonthlyCents  │
                    │  vs budgetMonthly   │
                    │  ≥100% → auto-pause │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  ADAPTER LOOKUP     │
                    │  agent.adapterType  │
                    │  → adapter.execute()│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  CONTEXT INJECTION  │
                    │  PAPERCLIP_AGENT_ID │
                    │  PAPERCLIP_API_KEY  │
                    │  PAPERCLIP_API_URL  │
                    │  + secret refs      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  AGENT EXECUTION    │
                    │  Spawn CLI / HTTP   │
                    │  Agent calls API:   │
                    │  GET /agents/me     │
                    │  GET /issues        │
                    │  POST /checkout     │
                    │  PATCH /issues      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  RESULT CAPTURE     │
                    │  stdout / stderr    │
                    │  token usage, cost  │
                    │  session state      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  RUN RECORD         │
                    │  Status: succeeded  │
                    │  / failed / timed   │
                    │  out / cancelled    │
                    │  Cost event stored  │
                    │  Session persisted  │
                    └─────────────────────┘
```

### 4.2 Agent ↔ API Interaction (Heartbeat Protocol)

```
Agent Runtime                          Paperclip API
     │                                       │
     │──── GET /api/agents/me ──────────────►│  Step 1: Identity
     │◄─── {id, company, role, budget} ──────│
     │                                       │
     │──── GET /api/approvals (if set) ─────►│  Step 2: Approval follow-up
     │◄─── {approval status} ────────────────│
     │                                       │
     │──── GET /api/issues?assignee=me ─────►│  Step 3: Get assignments
     │◄─── [{issue}, {issue}, ...] ──────────│
     │                                       │
     │──── POST /api/issues/{id}/checkout ──►│  Step 5: Atomic checkout
     │◄─── 200 OK / 409 Conflict ────────────│
     │                                       │
     │──── GET /api/issues/{id}/comments ───►│  Step 6: Read context
     │◄─── [{comment}, ...] ─────────────────│
     │                                       │
     │          (Agent does work)             │  Step 7: Work
     │                                       │
     │──── PATCH /api/issues/{id} ──────────►│  Step 8: Update status
     │     {status: "done", comment: "..."}  │
     │◄─── 200 OK ──────────────────────────│
     │                                       │
     │──── POST /api/cost-events ───────────►│  Cost reporting
     │◄─── 201 Created ─────────────────────│
```

### 4.3 Wake Coalescing

When an agent is already running and a new trigger arrives, Paperclip coalesces the wake instead of launching a duplicate run:

```
Timer fires ──┐
              ├── Agent already running? ──► Yes ──► Queue wake reason
              │                                      (merged into next run)
              └── No ──► Start new heartbeat
```

---

## 5. Adapter Architecture

### 5.1 Adapter Module Structure

Each adapter is a self-contained package with three module sets:

```
packages/adapters/<name>/
├── src/
│   ├── index.ts                    # Type key, label, model list
│   ├── server/
│   │   ├── execute.ts              # Core: spawn agent, capture result
│   │   ├── parse.ts                # Parse stdout for cost/usage data
│   │   └── test.ts                 # Environment diagnostics
│   ├── ui/
│   │   ├── parse-stdout.ts         # Stdout → transcript entries
│   │   └── build-config.ts         # Form → adapterConfig JSON
│   └── cli/
│       └── format-event.ts         # Terminal output for --watch
```

### 5.2 Adapter Registry

```
                    ┌─────────────────────┐
                    │   Adapter Registry   │
                    │                     │
                    │  claude_local  ─────┼──► Claude Code CLI
                    │  codex_local   ─────┼──► OpenAI Codex CLI
                    │  gemini_local  ─────┼──► Gemini CLI
                    │  opencode_local ────┼──► OpenCode CLI
                    │  process       ─────┼──► Shell command
                    │  http          ─────┼──► HTTP webhook
                    │  openclaw      ─────┼──► OpenClaw webhook
                    │  <custom>      ─────┼──► Custom adapter
                    └─────────────────────┘
```

### 5.3 Adapter Execution Contract

Every adapter implements the same interface:

```typescript
interface AdapterExecuteResult {
  status: 'succeeded' | 'failed' | 'timed_out' | 'cancelled';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  usage?: {
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  };
  sessionState?: string;       // Opaque blob for session resume
  errorMessage?: string;
}
```

Three registries consume adapter modules:

| Registry | Module | Purpose |
|----------|--------|---------|
| Server | `server/execute.ts` | Run agents, capture results |
| UI | `ui/parse-stdout.ts` | Render run transcripts in the browser |
| CLI | `cli/format-event.ts` | Format terminal output for `paperclipai run --watch` |

---

## 6. Deployment Topology

### 6.1 Deployment Modes

```
┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT MODES                              │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  local_trusted   │  │  authenticated   │  │ authenticated  │  │
│  │                  │  │  + private       │  │ + public       │  │
│  │                  │  │                  │  │                │  │
│  │  localhost only  │  │  Tailscale/VPN   │  │  Internet-     │  │
│  │  No auth        │  │  Login required  │  │  facing        │  │
│  │  Single user    │  │  Auto base URL   │  │  Login required│  │
│  │  PGlite embed   │  │  Team access     │  │  Explicit URL  │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Production Deployment

```
┌────────────────────────┐     ┌────────────────────────────────┐
│  Internet / VPN        │     │  Host Machine / Container      │
│                        │     │                                │
│  Board Operator ───────┼────►│  ┌──────────────────────────┐  │
│  (Browser)             │     │  │  Paperclip Server        │  │
│                        │     │  │  (Express.js + Vite SSR)  │  │
│  Agent Runtimes ───────┼────►│  │                          │  │
│  (CLI / Webhook)       │     │  │  Port 3100               │  │
│                        │     │  └────────────┬─────────────┘  │
│                        │     │               │                │
│                        │     │  ┌────────────▼─────────────┐  │
│                        │     │  │  PostgreSQL 17           │  │
│                        │     │  │  (Docker / hosted /      │  │
│                        │     │  │   PGlite embedded)       │  │
│                        │     │  └──────────────────────────┘  │
│                        │     │                                │
│                        │     │  ┌──────────────────────────┐  │
│                        │     │  │  Agent Runtimes (local)  │  │
│                        │     │  │  claude / codex / gemini │  │
│                        │     │  │  Spawned per heartbeat   │  │
│                        │     │  └──────────────────────────┘  │
└────────────────────────┘     └────────────────────────────────┘
```

### 6.3 Docker Deployment

```
┌─────────────────────────────────────────────────────────────┐
│  docker-compose.yml                                         │
│                                                             │
│  ┌────────────────────────────┐  ┌───────────────────────┐  │
│  │  paperclip (app)           │  │  postgres (db)        │  │
│  │  Node.js 20 + Express     │  │  PostgreSQL 17        │  │
│  │  Port 3100                │  │  Port 5432            │  │
│  │  Mounts: data/, agents/   │──┤  Volume: pgdata       │  │
│  │  Secrets: master.key      │  │                       │  │
│  └────────────────────────────┘  └───────────────────────┘  │
│                                                             │
│  Quickstart (embedded PGlite):                              │
│  docker-compose.quickstart.yml — single container, no PG    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Agent Company Architecture

Paperclip hosts multiple autonomous AI companies, each with its own org tree, budget, and task hierarchy. Three reference implementations demonstrate distinct operational domains.

### 7.1 Company Isolation Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAPERCLIP INSTANCE                          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  AJ AI Services │  │  CloudOps Pro   │  │ SupportGenius  │  │
│  │  11 agents      │  │  8 agents       │  │ 8 agents       │  │
│  │  3 teams        │  │  3 teams        │  │ 3 teams        │  │
│  │  1 project      │  │  1 project      │  │ 1 project      │  │
│  │  Budget: $X/mo  │  │  Budget: $Y/mo  │  │ Budget: $Z/mo  │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
│                                                                 │
│  Cross-company access: DENIED (403)                             │
│  Each company: independent org tree, secrets, budget, tasks     │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 AJ AI Services — Social Media AI Pipeline

```
AJ (CEO)
├── TechLead (CTO)
│   ├── DevOpsEngine ─── CI/CD pipeline, GitHub Actions
│   └── SecureGuard ──── Security baselines, vulnerability scanning
├── SocialSage (Social Media Manager)
│   ├── IdeaSpark ────── Trend research, content ideation
│   ├── DesignPro ────── Visual assets, brand templates
│   └── PublishBot ───── LinkedIn scheduling, cross-posting
├── EventMaster ─────── Events and activations
├── ProjectPilot ────── Delivery tracking, standup facilitation
└── EthicsWatch ─────── Responsible AI review, content safety
```

**Domain:** AI-driven social media content pipeline
**Key flow:** Ideation → Design → Approval → Publish → Ethics review
**Agents:** 11 · **Teams:** 3 (Content, Engineering, Governance) · **Recurring:** Daily standup

### 7.3 CloudOps Pro — Managed Cloud Infrastructure

```
CloudCEO (CEO)
├── CloudCTO (CTO)
│   ├── ArchBot ──────── IaC design, multi-cloud Terraform modules
│   ├── DeployBot ────── Zero-touch CI/CD, auto-rollback, DORA metrics
│   └── UptimeGuard ──── SLO monitoring, incident runbooks, error budgets
├── CostSage ─────────── Cloud cost visibility, rightsizing, 30% reduction
├── DriftGuard ───────── CSPM, drift detection, compliance gating
└── SLAPilot ─────────── SLA tracking, client reporting, OKR governance
```

**Domain:** Security-first multi-cloud operations
**Key flow:** IaC → Security Gate → Cost Gate → SLA Gate → Deploy → Verify
**Agents:** 8 · **Teams:** 3 (Engineering, Governance, FinOps) · **Recurring:** Daily standup, weekly cost report, 15-min SLA check

### 7.4 SupportGenius — Autonomous IT Helpdesk

```
SupportCEO (CEO)
├── SupportDirector (Support Director)
│   ├── TriageBot ────── L1 triage, KB auto-resolve, FAQ detection
│   ├── DiagnosBot ───── L2 diagnostics, runbook execution
│   └── RootCauseBot ─── L3 root cause analysis, post-mortems
├── KnowledgeKeeper ──── KB lifecycle, article quality gate, gap analysis
├── SLAGuard ─────────── Queue health every 15 min, breach alerts
└── CSATInsight ──────── CSAT surveys, trend analysis, board reporting
```

**Domain:** Multi-tier IT support with knowledge management
**Key flow:** Inbound ticket → L1 triage → L2 diagnostics → L3 RCA → KB update → CSAT survey
**Agents:** 8 · **Teams:** 3 (Support, Knowledge & Quality, Operations) · **Recurring:** Daily standup, weekly CSAT report, 15-min SLA check

---

## 8. Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React + Vite + React Router + Radix UI + Tailwind CSS + TanStack Query | React 19, Vite 6 |
| Backend | Node.js + Express.js + TypeScript | Node 20+, Express 5 |
| Database | PostgreSQL (hosted/Docker) or PGlite (embedded) | PG 17 |
| ORM | Drizzle ORM with drizzle-kit migrations | — |
| Auth | Better Auth (sessions) + JWT (agent runs) + API keys (long-lived) | — |
| Package Manager | pnpm with workspaces | pnpm 9 |
| Agent Runtimes | Claude Code CLI, Codex CLI, Gemini CLI, OpenCode CLI, shell, HTTP | External |
| Live Updates | Server-Sent Events (SSE) | — |
| Company Packages | `agentcompanies/v1` filesystem spec (Markdown + YAML frontmatter) | — |
| Documentation | Mintlify | — |

---

## 9. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Control plane, not execution plane | Paperclip orchestrates agents but never runs LLM inference itself; agents bring their own runtime |
| Company-scoped isolation | Every entity belongs to exactly one company; strict `403` boundaries prevent cross-company access |
| Single-assignee atomic checkout | `POST /issues/{id}/checkout` returns `409 Conflict` if another agent owns the task — prevents concurrent duplicate work |
| Adapter-agnostic agent model | Any runtime that can call an HTTP API works as an agent; no vendor lock-in |
| Embedded database by default | PGlite provides zero-config startup for local development; same Drizzle schema works with hosted PostgreSQL |
| Wake coalescing | When an agent is already running, new triggers are merged into the next cycle instead of spawning duplicate runs |
| Session persistence | Adapters serialize session state (e.g. Claude session ID) between heartbeats so agents maintain conversation context |
| Budget hard-stop | At 100% budget utilization, agents are auto-paused — no overrun is possible without board intervention |
| Activity audit trail | Every mutation is logged with actor, action, entity, and timestamp for full traceability |
