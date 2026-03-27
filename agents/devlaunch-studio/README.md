# DevLaunch Studio

> Deliver MVPs and production-grade software for startups and scale-ups — zero to shipped in 2 weeks.

DevLaunch Studio is an AI-powered software development company that ships client MVPs in 14 days. Every project runs a full engineering cycle — requirements, design, backend, frontend, QA, CI/CD, and documentation — with board-approved sprint gates before any code reaches production.

## What This Company Does

1. **Discover** — ProdPilot conducts requirements discovery and writes user stories with acceptance criteria
2. **Design** — PixelCraft creates wireframes, high-fidelity designs, and a full design system
3. **Architect** — ArchLead designs the technical architecture and writes the OpenAPI spec before code starts
4. **Build** — BackendAce and FrontForge implement in parallel against the agreed API contract
5. **Test** — TestGuard enforces 80% coverage and blocks releases with any open P1 bugs
6. **Deploy** — DeployDriven manages CI/CD with automated staging and CEO-gated production deployments
7. **Document** — DocScribe ships complete API docs, README, and onboarding guide on day 1

## Org Chart

| Agent | Title | Reports To | Role |
|---|---|---|---|
| LaunchCEO | Chief Executive Officer | — | CEO (Board Operator, sprint gate) |
| ArchLead | CTO & Technical Lead | LaunchCEO | Architecture, engineering coordination |
| BackendAce | Backend Engineer | ArchLead | APIs, database, business logic |
| FrontForge | Frontend Engineer | ArchLead | React/Next.js UI |
| TestGuard | QA Engineer | ArchLead | Test suites, 80% coverage gate |
| DeployDriven | DevOps Engineer | ArchLead | CI/CD, containers, cloud deploy |
| ProdPilot | Product Manager | LaunchCEO | Requirements, user stories, sprint tracking |
| PixelCraft | UI/UX Designer | LaunchCEO | Wireframes, design system, style guide |
| DocScribe | Technical Writer | LaunchCEO | API docs, README, onboarding guides |

### Org Tree

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

## Teams

| Team | Manager | Members | Focus |
|---|---|---|---|
| Engineering | ArchLead | BackendAce, FrontForge, TestGuard, DeployDriven | Code, tests, deployments |
| Product | ProdPilot | ProdPilot | Requirements and delivery tracking |
| Design | PixelCraft | PixelCraft, DocScribe | UI/UX and documentation |

## Key Quality Commitments

| Metric | Target | Owner |
|--------|--------|-------|
| MVP delivery | ≤ 14 days | LaunchCEO |
| Test coverage | ≥ 80% | TestGuard |
| P1 bugs at launch | 0 | TestGuard |
| API documentation | Day 1 | DocScribe |
| API p99 latency | ≤ 200ms | BackendAce |
| CI pipeline duration | ≤ 10 min | DeployDriven |

## Sprint Gate

**No code reaches production without CEO board approval.** The gate requires:

```
TestGuard → QA sign-off (coverage ≥ 80%, zero P1 bugs)
DocScribe → documentation complete
ArchLead → architecture review passed
LaunchCEO → board approval granted
DeployDriven → production deployment
```

## Projects

### MVP Factory (seed project)

Seven sequential seed tasks drive every client engagement:

| Task | Assignee | Priority |
|---|---|---|
| Requirements discovery and product backlog | ProdPilot | Critical |
| API design and OpenAPI specification | ArchLead | Critical |
| Backend API implementation | BackendAce | Critical |
| Frontend UI implementation | FrontForge | Critical |
| Test suite and QA sign-off | TestGuard | High |
| CI/CD pipeline and cloud deployment | DeployDriven | High |
| API documentation, README, and onboarding guide | DocScribe | High |

## Recurring Tasks

| Task | Schedule | Assignee |
|---|---|---|
| Daily Standup | Weekdays at 09:00 UTC | ProdPilot |
| Weekly Sprint Review | Fridays at 14:00 UTC | ProdPilot |
| Sprint Retrospective | Fridays at 15:00 UTC | ProdPilot |

## Getting Started

```bash
paperclipai company import --from agents/devlaunch-studio
```

Or from GitHub:

```bash
paperclipai company import --from https://github.com/paperclipai/paperclip/tree/main/agents/devlaunch-studio
```

### Required Secrets

| Agent | Secret | Requirement |
|---|---|---|
| ArchLead, BackendAce, FrontForge, TestGuard, DeployDriven, DocScribe | `GH_TOKEN` | Required — GitHub Actions and code access |
| DeployDriven | `VERCEL_TOKEN` | Optional — Frontend deployment |
| DeployDriven | `AWS_ACCESS_KEY_ID` | Optional — Backend cloud infrastructure |
| DeployDriven | `AWS_SECRET_ACCESS_KEY` | Optional — Backend cloud infrastructure |
| FrontForge, PixelCraft | `FIGMA_API_KEY` | Optional — Design file access |
| ProdPilot | `LINEAR_API_KEY` | Optional — Linear project management integration |

## References

- [Agent Companies Specification](https://agentcompanies.io/specification)
- [Paperclip](https://github.com/paperclipai/paperclip)
