---
title: "DevLaunch Studio — Company Reference"
description: "Complete reference for the DevLaunch Studio MVP delivery software development agent company"
---

# DevLaunch Studio

**DevLaunch Studio** is a reference `agentcompanies/v1` package for an AI-powered software development-as-a-service company. It demonstrates how to model a full-cycle engineering team that ships MVPs in 14 days with board-gated sprint releases, 80% test coverage enforcement, and day-1 API documentation.

**Package location:** `agents/devlaunch-studio/`

## At a Glance

| Metric | Target | Owner |
|--------|--------|-------|
| MVP delivery | ≤ 14 days | LaunchCEO |
| Test coverage | ≥ 80% | TestGuard (QA Engineer) |
| P1 bugs at launch | 0 | TestGuard (QA Engineer) |
| API documentation | Day 1 | DocScribe (Technical Writer) |
| API p99 latency | ≤ 200ms | BackendAce (Backend Engineer) |
| CI pipeline duration | ≤ 10 min | DeployDriven (DevOps Engineer) |

---

## Org Structure

### Agents (9 total)

```
LaunchCEO (CEO)
├── ArchLead (CTO)
│   ├── BackendAce (Backend Engineer)
│   ├── FrontForge (Frontend Engineer)
│   ├── TestGuard (QA Engineer)
│   └── DeployDriven (DevOps Engineer)
├── ProdPilot (Product Manager)
├── PixelCraft (UI/UX Designer)
└── DocScribe (Technical Writer)
```

### Agent Reference Table

| Slug | Name | Title | Reports To | Primary Mandate |
|------|------|-------|-----------|-----------------|
| `ceo` | LaunchCEO | Chief Executive Officer | — (root) | Board operator, sprint release gate, client relationship |
| `cto` | ArchLead | CTO & Technical Lead | `ceo` | Architecture, engineering coordination, code quality |
| `backend-engineer` | BackendAce | Backend Engineer | `cto` | APIs, database schema, business logic, OWASP compliance |
| `frontend-engineer` | FrontForge | Frontend Engineer | `cto` | React/Next.js UI, API integration, accessibility |
| `qa-engineer` | TestGuard | QA Engineer | `cto` | Test suites, 80% coverage gate, P1 bug blocking |
| `devops-engineer` | DeployDriven | DevOps Engineer | `cto` | CI/CD, containers, cloud deploy, zero-downtime |
| `product-manager` | ProdPilot | Product Manager | `ceo` | Requirements, user stories, sprint tracking |
| `ux-designer` | PixelCraft | UI/UX Designer | `ceo` | Wireframes, design system, responsive layouts |
| `technical-writer` | DocScribe | Technical Writer | `ceo` | API docs, README, onboarding guides |

### Teams (3 total)

| Team | Manager | Members | Focus |
|------|---------|---------|-------|
| Engineering | ArchLead | BackendAce, FrontForge, TestGuard, DeployDriven | Code, tests, deployments |
| Product | ProdPilot | ProdPilot | Requirements and delivery tracking |
| Design | PixelCraft | PixelCraft, DocScribe | UI/UX and documentation |

---

## Projects

### MVP Factory (seed project)

| Task Slug | Assignee | Outcome |
|-----------|---------|---------|
| `requirements-discovery` | ProdPilot | PRD + user story backlog + 14-day sprint plan |
| `api-design` | ArchLead | OpenAPI 3.0 spec — contract before code |
| `backend-implementation` | BackendAce | All API endpoints + ≥ 80% test coverage |
| `frontend-implementation` | FrontForge | Full UI implementation from Figma specs |
| `test-automation` | TestGuard | E2E tests + coverage report + QA sign-off |
| `cicd-pipeline` | DeployDriven | GitHub Actions + staging + CEO-gated production |
| `api-documentation` | DocScribe | OpenAPI reference + README + onboarding guide |

---

## Recurring Tasks

| Task | Cron | Timezone | Assignee | Purpose |
|------|------|----------|---------|---------|
| `daily-standup` | `0 9 * * 1-5` | UTC | ProdPilot | Team sync, blocker identification, sprint health |
| `weekly-sprint-review` | `0 14 * * 5` | UTC | ProdPilot | Sprint progress report to LaunchCEO |
| `sprint-retrospective` | `0 15 * * 5` | UTC | ProdPilot | Process improvement actions for next sprint |

---

## Sprint Gate

**No code reaches production without CEO board approval.** Every release requires all four conditions:

```
TestGuard   → QA sign-off: coverage ≥ 80%, zero P1 bugs
DocScribe   → documentation complete (API ref + README)
ArchLead    → architecture review passed
LaunchCEO  → board approval granted
DeployDriven → production deployment
```

### Why Product, Design, and Docs Report to CEO

ProdPilot, PixelCraft, and DocScribe report to the CEO to ensure product requirements, design quality, and documentation completeness are never deprioritised by engineering velocity pressure. The sprint gate requires sign-off from all three before CEO approval is possible.

---

## Quality Standards

### Backend Engineering

- OpenAPI 3.0 spec before any implementation code
- OWASP-compliant from day one: parameterised queries, input validation, rate limiting, authentication on all non-public endpoints
- p99 latency ≤ 200ms for all endpoints in staging and production
- ≥ 80% test coverage (unit + integration)

### Frontend Engineering

- React/Next.js implementation from Figma specifications
- WCAG 2.1 AA accessibility compliance
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Responsive: mobile (375px), tablet (768px), desktop (1280px)

### QA / Test

- E2E tests covering all acceptance criteria
- Combined coverage ≥ 80% (backend + frontend)
- Zero open P1 bugs at release gate
- Regression suite covers all prior P1/P2 bugs

### DevOps

- CI in under 10 minutes for every PR
- Zero-downtime production deployments
- Rollback within 5 minutes
- OIDC-based cloud authentication — no long-lived credentials

---

## Required Secrets

| Secret | Required For | Requirement |
|--------|-------------|-------------|
| `GH_TOKEN` | ArchLead, BackendAce, FrontForge, TestGuard, DeployDriven, DocScribe | Required — GitHub CI/CD and code access |
| `VERCEL_TOKEN` | DeployDriven | Optional — Frontend deployment |
| `AWS_ACCESS_KEY_ID` | DeployDriven | Optional — Backend cloud infrastructure |
| `AWS_SECRET_ACCESS_KEY` | DeployDriven | Optional — Backend cloud infrastructure |
| `FIGMA_API_KEY` | FrontForge, PixelCraft | Optional — Design file access |
| `LINEAR_API_KEY` | ProdPilot | Optional — Linear project management |

---

## Getting Started

### 1. Import the company

```bash
paperclipai company import --from agents/devlaunch-studio
```

Or from GitHub:

```bash
paperclipai company import --from https://github.com/paperclipai/paperclip/tree/main/agents/devlaunch-studio
```

### 2. Configure required secrets

```bash
paperclipai secrets set GH_TOKEN <your-github-token>
```

### 3. Start the MVP Factory project

Begin with `requirements-discovery` (ProdPilot). All downstream tasks depend on the PRD and user story backlog.

### 4. Run schema tests

```bash
vitest run tests/devlaunch-studio/schema.test.ts
```

---

## Testing

```bash
vitest run tests/devlaunch-studio/schema.test.ts
```

The test suite covers:
- Top-level package file existence
- COMPANY.md frontmatter validation
- All 9 AGENTS.md files (name, title, reportsTo, paperclip skill)
- Org tree integrity (correct reporting lines, no cycles)
- All 3 TEAM.md files
- MVP Factory project + 7 seed tasks
- 3 recurring tasks (portable: `recurring: true`, no schedule block)
- `.paperclip.yaml` (heartbeat × 9 agents, 3 routines, GH_TOKEN declarations)
- README.md structure and 14-day/80%/P1/sprint-gate content
- Agent-specific content (OWASP, React/Next.js, coverage gate, zero-downtime, day 1 docs)
