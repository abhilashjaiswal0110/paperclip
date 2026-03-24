

## **Prompt Builder**: Analyzing Repo Conventions and Researching Best Practices

Let me first load the relevant skills and study the existing agent skill patterns to craft a properly structured prompt.

Read skill [company-creator](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/SKILL.md?vscodeLinkType%3Dskill#1-1), lines 1 to 200

Read [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/agents/company-setup/SKILL.md)

Read skill [company-creator](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/SKILL.md?vscodeLinkType%3Dskill#200-200), lines 200 to 270

Read [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/skills/paperclip/SKILL.md#100-100), lines 100 to 200

Searched for files matching `**/docs/companies/companies-spec.md`, 1 match

Read [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references)

Read skill `company-creator`: [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references/example-company.md#1-1), lines 1 to 100

Read skill `company-creator`: [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references/companies-spec.md#1-1), lines 1 to 120

Read skill `company-creator`: [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references/companies-spec.md#120-120), lines 120 to 145

Read skill `company-creator`: [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references/example-company.md#100-100), lines 100 to 185

Read skill `company-creator`: [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/.agents/skills/company-creator/references/example-company.md#185-185), lines 185 to 185

Now let me check how the existing agent skills in agents are structured, so I can follow the same pattern for the new company agent.

Read [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/agents/company-setup)

Read [](file:///c%3A/Users/a833555/OneDrive%20-%20ATOS/Gitwork/paperclip/agents/task-manager)

Now I have full context on the spec, existing agent skill patterns, company-creator conventions, and the example company structure. Let me build the refined prompt.

---

## **Prompt Builder**: Creating Spec-Driven Company Setup Prompt for "AJ AI Services Pvt Ltd"

### Research Summary: Paperclip Company Setup Patterns
**Sources Analyzed:**
- AGENTS.md: Repo conventions and SPEC-first design rules
- SKILL.md: API workflow for bootstrapping companies
- SKILL.md: Company package spec (agentcompanies/v1)
- SKILL.md: Heartbeat protocol and agent API contract
- SKILL.md: Issue lifecycle patterns
- SPEC-implementation.md: V1 data model and canonical API

**Key Standards Identified:**
- Company packages follow `agentcompanies/v1` directory convention with `COMPANY.md`, agents, `teams/`, `projects/`, `tasks/`, skills
- Agent skills in agents are standalone SKILL.md files with frontmatter
- Heartbeats support both cron (interval) and wake-on-demand (manual trigger)
- All agents require the `paperclip` core skill
- Reporting structure must form a valid tree (no cycles)

---

Here is the refined, spec-driven prompt. You can give this directly to a coding assistant (including me) operating in the Paperclip repo to execute end-to-end:

---

```markdown
# Setup Prompt: AJ AI Services Pvt Ltd

You are setting up a new AI company in Paperclip. You MUST follow the Agent Companies
specification (`agentcompanies/v1`) and use the conventions from this repository.

## Phase 0 — Pre-Flight

1. Verify Paperclip is running:
   ```
   GET http://localhost:3100/api/health
   ```
   If not running, execute `pnpm install && pnpm dev` from the repo root and wait for health.

2. Discover available adapters and icons:
   ```
   GET http://localhost:3100/llms/agent-configuration.txt
   GET http://localhost:3100/llms/agent-icons.txt
   ```
   Use returned adapter types and icon names in all agent definitions below.
   Default to `claude_local` adapter if available; fall back to `codex_local`.

## Phase 1 — Create the Company

Create the company via the board API:

| Field       | Value                                                               |
|-------------|---------------------------------------------------------------------|
| name        | AJ AI Services Pvt Ltd                                              |
| description | Build the #1 social media handling AI app to $1M MRR.               |

```
POST /api/companies
{
  "name": "AJ AI Services Pvt Ltd",
  "description": "Build the #1 social media handling AI app to $1M MRR."
}
```

Save the returned `id` as `$COMPANY_ID`.

Set an initial monthly budget (adjust as needed):
```
PATCH /api/companies/$COMPANY_ID/budgets
{ "budgetMonthlyCents": 500000 }
```

## Phase 2 — Org Chart (Hire Agents)

Create agents in this exact order. Every agent except CEO MUST have `reportsTo` set.
All agents MUST have `heartbeat.enabled: true` with both scheduled interval AND
`wakeOnDemand: true` to support cron + manual trigger.

### Agent Roster

| # | Name                   | Role                    | Title                             | Reports To | Capabilities |
|---|------------------------|-------------------------|-----------------------------------|------------|--------------|
| 1 | AJ (Board Operator)    | ceo                     | Chief Executive Officer & Founder | null       | Strategic planning, company vision, goal alignment, board governance, team coordination, budget oversight |
| 2 | TechLead               | cto                     | Chief Technology Officer          | CEO        | Technical architecture, engineering roadmap, code review, CI/CD strategy, team staffing, sprint planning |
| 3 | SocialSage             | social_media_manager    | Social Media Manager              | CEO        | Social media strategy, content calendar, audience engagement, analytics, LinkedIn/Twitter/Instagram management, hashtag research |
| 4 | EventMaster            | event_manager           | Event Manager                     | CEO        | Event planning, launches, webinars, community events, brand activations, sponsorship coordination |
| 5 | IdeaSpark              | idea_generator          | Creative Director - Ideation      | SocialSage | Content ideation, trend analysis, brainstorming campaigns, viral hook creation, competitor analysis |
| 6 | DesignPro              | designer                | Visual Designer                   | SocialSage | Graphic design, social media post templates, brand identity, carousel design, infographics, thumbnails |
| 7 | PublishBot             | publisher               | Publishing Specialist             | SocialSage | Content scheduling, multi-platform publishing, A/B testing captions, optimal posting time analysis |
| 8 | ProjectPilot           | program_manager         | Program Manager                   | CEO        | Project tracking, sprint management, cross-team coordination, milestone tracking, risk management, resource allocation |
| 9 | DevOpsEngine           | devops_engineer         | DevOps Engineer                   | TechLead   | CI/CD pipelines, GitHub Actions, infrastructure automation, monitoring, deployment scripts |
| 10| SecureGuard            | security_engineer       | Security Engineer                 | TechLead   | Security audits, vulnerability scanning, access control, secrets management, compliance checks |
| 11| EthicsWatch            | responsible_ai          | Responsible AI Officer            | CEO        | AI ethics review, bias detection, content safety, compliance with AI guidelines, responsible AI practices |

### Heartbeat Configuration (All Agents)

```json
"runtimeConfig": {
  "heartbeat": {
    "enabled": true,
    "intervalSec": 300,
    "wakeOnDemand": true
  }
}
```

The CEO (AJ) MUST be the board operator. When creating the CEO agent, set the adapter
to represent the human board operator identity. Use `contextMode: "fat"` for CEO.

### Agent Creation Order

You MUST create agents in dependency order:
1. CEO first (no reportsTo)
2. CTO, SocialSage, EventMaster, ProjectPilot, EthicsWatch (all report to CEO)
3. IdeaSpark, DesignPro, PublishBot (report to SocialSage)
4. DevOpsEngine, SecureGuard (report to TechLead/CTO)

## Phase 3 — Goals

Create goals in hierarchical order. Every goal MUST link to the company mission.

| Goal                                                       | Owner         |
|------------------------------------------------------------|---------------|
| Launch social media post generator for LinkedIn as MVP     | CEO           |
| Ship MVP v1 in 1 day                                       | CTO           |
| Build end-to-end social media content pipeline             | SocialSage    |
| Establish brand visual identity and design system           | DesignPro     |
| Automate publishing to LinkedIn and other platforms         | PublishBot    |
| Set up CI/CD pipeline and infrastructure                   | CTO           |
| Implement content safety and Responsible AI guardrails      | EthicsWatch   |
| Create event-driven social media campaigns                 | EventMaster   |
| Establish project tracking and delivery cadence             | ProjectPilot  |

```
POST /api/companies/$COMPANY_ID/goals
{ "title": "Launch social media post generator for LinkedIn as MVP — Ship v1 in 1 day",
  "description": "Build and ship a LinkedIn post generation tool as the first product. Must generate engaging, brand-consistent LinkedIn posts from topics/prompts. Target: working MVP within 24 hours." }
```

Create the remaining goals as children or siblings per the hierarchy above.

## Phase 4 — Seed Issues (Tasks)

Create initial issues and assign them. Every issue MUST have a `goalId` linking it
to a goal from Phase 3. Use structured descriptions with `## Objective` and
`## Acceptance Criteria`.

### Issue 1 — CI/CD Pipeline (assigned to CTO)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Wire up GitHub Actions for CI/CD pipeline",
  "description": "## Objective\n\nSet up GitHub Actions CI/CD pipeline for the social media app.\n\n## Acceptance Criteria\n\n- [ ] CI workflow runs on push/PR to main\n- [ ] Lint, typecheck, and test steps pass\n- [ ] Build step produces deployable artifact\n- [ ] CD workflow deploys to staging on merge to main\n- [ ] Pipeline status badges added to README",
  "assigneeAgentId": "$CTO_ID",
  "goalId": "$CICD_GOAL_ID",
  "priority": "high"
}
```

### Issue 2 — LinkedIn Post Generator MVP (assigned to CTO)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Build LinkedIn post generator core module",
  "description": "## Objective\n\nCreate the core LinkedIn post generation engine that takes a topic/prompt and outputs engaging LinkedIn posts.\n\n## Acceptance Criteria\n\n- [ ] Input: topic, tone, target audience\n- [ ] Output: formatted LinkedIn post with hashtags\n- [ ] Support multiple post styles (story, insight, listicle, question)\n- [ ] API endpoint for post generation\n- [ ] Unit tests with >80% coverage",
  "assigneeAgentId": "$CTO_ID",
  "goalId": "$MVP_GOAL_ID",
  "priority": "critical"
}
```

### Issue 3 — Content Calendar Setup (assigned to SocialSage)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Create initial content calendar and posting strategy",
  "description": "## Objective\n\nDesign a content calendar template and posting strategy for LinkedIn.\n\n## Acceptance Criteria\n\n- [ ] Weekly content calendar template defined\n- [ ] Posting frequency established (min 3x/week)\n- [ ] Content pillars identified (industry insights, tips, engagement posts)\n- [ ] Optimal posting times researched and documented\n- [ ] Hashtag strategy documented (5-10 core + rotating)",
  "assigneeAgentId": "$SOCIAL_SAGE_ID",
  "goalId": "$CONTENT_PIPELINE_GOAL_ID",
  "priority": "high"
}
```

### Issue 4 — Visual Identity (assigned to DesignPro)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Design brand templates for LinkedIn posts",
  "description": "## Objective\n\nCreate reusable design templates for LinkedIn social media posts.\n\n## Acceptance Criteria\n\n- [ ] Brand color palette defined\n- [ ] 3 post template variants (text overlay, data visual, quote card)\n- [ ] Carousel template (5-slide format)\n- [ ] Profile banner and logo assets\n- [ ] Templates exportable in standard formats",
  "assigneeAgentId": "$DESIGN_PRO_ID",
  "goalId": "$BRAND_GOAL_ID",
  "priority": "medium"
}
```

### Issue 5 — Responsible AI Review (assigned to EthicsWatch)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Establish content safety and AI ethics guardrails",
  "description": "## Objective\n\nDefine and implement Responsible AI guardrails for AI-generated social media content.\n\n## Acceptance Criteria\n\n- [ ] Content safety checklist for generated posts\n- [ ] Bias detection criteria for language and imagery\n- [ ] Prohibited content categories documented\n- [ ] Review workflow defined (auto-flag + human review)\n- [ ] Compliance with platform ToS verified",
  "assigneeAgentId": "$ETHICS_WATCH_ID",
  "goalId": "$RAI_GOAL_ID",
  "priority": "high"
}
```

### Issue 6 — Security Baseline (assigned to SecureGuard)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Security baseline for social media app infrastructure",
  "description": "## Objective\n\nEstablish security baseline for the app and CI/CD infrastructure.\n\n## Acceptance Criteria\n\n- [ ] Secrets management strategy (no plain-text keys)\n- [ ] API key rotation policy documented\n- [ ] Dependency vulnerability scanning enabled\n- [ ] OWASP Top 10 checklist reviewed\n- [ ] Access control for publishing credentials",
  "assigneeAgentId": "$SECURE_GUARD_ID",
  "goalId": "$CICD_GOAL_ID",
  "priority": "high"
}
```

### Issue 7 — Project Tracking Setup (assigned to ProjectPilot)

```
POST /api/companies/$COMPANY_ID/issues
{
  "title": "Set up project tracking and delivery cadence",
  "description": "## Objective\n\nEstablish project management structure for MVP delivery.\n\n## Acceptance Criteria\n\n- [ ] Sprint cadence defined (daily for MVP)\n- [ ] Status reporting template created\n- [ ] Cross-team dependencies mapped\n- [ ] Risk register initialized\n- [ ] Milestone tracking for 1-day MVP target",
  "assigneeAgentId": "$PROJECT_PILOT_ID",
  "goalId": "$PROJECT_TRACKING_GOAL_ID",
  "priority": "high"
}
```

## Phase 5 — Create Company Package (Portable Artifact)

In addition to live API setup, create a portable `agentcompanies/v1` company package
at the path: `agents/aj-ai-services/`

This follows the same agents directory convention used by existing agent skills
in this repo. The package structure MUST be:

```
agents/aj-ai-services/
├── COMPANY.md
├── README.md
├── agents/
│   ├── ceo/AGENTS.md
│   ├── cto/AGENTS.md
│   ├── social-media-manager/AGENTS.md
│   ├── event-manager/AGENTS.md
│   ├── idea-generator/AGENTS.md
│   ├── designer/AGENTS.md
│   ├── publisher/AGENTS.md
│   ├── program-manager/AGENTS.md
│   ├── devops-engineer/AGENTS.md
│   ├── security-engineer/AGENTS.md
│   └── responsible-ai/AGENTS.md
├── teams/
│   ├── content/TEAM.md
│   ├── engineering/TEAM.md
│   └── governance/TEAM.md
├── projects/
│   └── linkedin-mvp/
│       ├── PROJECT.md
│       └── tasks/
│           ├── cicd-pipeline/TASK.md
│           ├── post-generator/TASK.md
│           ├── content-calendar/TASK.md
│           ├── brand-templates/TASK.md
│           ├── ai-ethics-guardrails/TASK.md
│           ├── security-baseline/TASK.md
│           └── project-tracking/TASK.md
├── tasks/
│   └── daily-standup/TASK.md
└── .paperclip.yaml
```

### COMPANY.md Frontmatter

```yaml
---
name: AJ AI Services Pvt Ltd
description: Build the #1 social media handling AI app to $1M MRR.
slug: aj-ai-services
schema: agentcompanies/v1
version: 1.0.0
license: MIT
authors:
  - name: AJ
goals:
  - Launch social media post generator for LinkedIn as MVP
  - Build end-to-end social media content pipeline
  - Establish brand visual identity
  - Automate CI/CD and infrastructure
  - Implement Responsible AI guardrails
tags:
  - social-media
  - linkedin
  - content-generation
  - ai-company
---
```

### Each AGENTS.md MUST include:

1. Frontmatter with `name`, `title`, `reportsTo`, and skills
2. Body with workflow-aware instructions covering:
   - Where work comes from
   - What the agent produces
   - Who the agent hands off to
   - What triggers the agent

### The daily-standup TASK.md MUST use a recurring schedule:

```yaml
schedule:
  timezone: Asia/Kolkata
  startsAt: 2026-03-25T09:00:00+05:30
  recurrence:
    frequency: daily
    interval: 1
    time:
      hour: 9
      minute: 0
```

### .paperclip.yaml — only agents that need env overrides:

```yaml
schema: paperclip/v1
agents:
  devops-engineer:
    inputs:
      env:
        GH_TOKEN:
          kind: secret
          requirement: required
  publisher:
    inputs:
      env:
        LINKEDIN_API_KEY:
          kind: secret
          requirement: optional
```

## Phase 6 — Verification

After setup, verify the entire company:

1. List all agents and confirm 11 agents exist:
   ```
   GET /api/companies/$COMPANY_ID/agents
   ```

2. Verify org tree integrity (no orphans, no cycles):
   - CEO has no reportsTo
   - All others trace back to CEO

3. Verify all goals are created:
   ```
   GET /api/companies/$COMPANY_ID/goals
   ```

4. Verify all issues are assigned:
   ```
   GET /api/companies/$COMPANY_ID/issues
   ```

5. Check the dashboard renders correctly:
   ```
   GET /api/companies/$COMPANY_ID/dashboard
   ```

6. For the company package, validate the directory structure matches
   the `agentcompanies/v1` spec.

7. Run repo verification:
   ```sh
   pnpm -r typecheck
   pnpm test:run
   pnpm build
   ```

## Constraints

- You MUST NOT mix this company's files with existing agent skills in company-setup,
  task-manager, etc. This company gets its own directory at `agents/aj-ai-services/`.
- You MUST follow the `agentcompanies/v1` schema for the company package.
- You MUST use the Paperclip REST API (not direct DB writes) for live setup.
- You MUST use the `paperclip` skill as a base skill for all agents.
- You MUST support both cron-based heartbeats and manual wake-on-demand trigger.
- You MUST assign every issue to an agent and link it to a goal.
- You MUST keep the CEO as a board-operator-represented agent (human in the loop).
- You MUST NOT hard-code adapter types — discover them from `/llms/agent-configuration.txt`
  and use what is available on the running instance.
- You MUST NOT commit secrets or API keys into any file.
```

---

## **Prompt Tester**: Following "AJ AI Services Setup" Instructions

Following the AJ AI Services setup prompt instructions, I would:

1. **Phase 0 Pre-Flight** — Check `GET /api/health`. If down, run `pnpm install && pnpm dev`. Discover adapters from `/llms/agent-configuration.txt` and icons from `/llms/agent-icons.txt`. This phase is unambiguous and complete.

2. **Phase 1 Company Creation** — POST to `/api/companies` with the specified name/description. Save `$COMPANY_ID`. Set budget. Clear, no ambiguity.

3. **Phase 2 Org Chart** — Create 11 agents in dependency order. The roster table is comprehensive with clear reporting lines. Heartbeat config covers both cron (300s interval) and manual (`wakeOnDemand: true`). The instruction to discover adapters dynamically rather than hardcoding is good practice.

4. **Phase 3 Goals** — Create 9 goals linked to company mission. Clear ownership mapping.

5. **Phase 4 Issues** — 7 seed issues with structured descriptions (Objective + Acceptance Criteria), each assigned and goal-linked. Priority levels specified.

6. **Phase 5 Package** — Clear directory structure following `agentcompanies/v1`. The `.paperclip.yaml` only includes agents needing env overrides (DevOps, Publisher), per spec guidance.

7. **Phase 6 Verification** — Covers API validation, org tree integrity, and repo-level typecheck/test/build.

**Points of confusion or ambiguity:**
- None critical. The prompt is executable as-is.
- Minor: The CEO is described as "AJ (Board Operator)" — the prompt correctly notes to represent the human, but the exact adapter configuration for a human-represented CEO could be more explicit (some instances may not have all adapters).
- The constraint to discover adapters dynamically from `/llms/agent-configuration.txt` correctly handles this.

**Compliance validation:** The prompt follows all identified repo conventions — `agentcompanies/v1` spec, SKILL.md frontmatter patterns, heartbeat protocol, issue lifecycle, and separation of concerns (own directory under `/agents`).

**Verdict:** Zero critical issues. The prompt is ready for execution.

---

The prompt above is your complete, spec-driven, copy-paste-ready instruction set. Key refinements from your draft:

- **11 agents** covering all your requested roles plus the teams you mentioned (design, publishing, ideation, DevOps, security, Responsible AI, program management)
- **Hub-and-spoke workflow** — CEO delegates to department leads (CTO, SocialSage, EventMaster, ProjectPilot, EthicsWatch), who each manage their own sub-teams
- **Dual-trigger heartbeats** — every agent supports both scheduled cron (5-min intervals) and manual wake-on-demand
- **7 seed issues** with structured acceptance criteria assigned to the right agents
- **Portable company package** at `agents/aj-ai-services/` following `agentcompanies/v1` spec — separate from existing agent skills as you requested
- **Dynamic adapter discovery** — no hardcoded adapter types, uses whatever the running instance supports
- **Full verification phase** including API validation and repo-level typecheck/test/build ---

## **Prompt Tester**: Following "AJ AI Services Setup" Instructions

Following the AJ AI Services setup prompt instructions, I would:

1. **Phase 0 Pre-Flight** — Check `GET /api/health`. If down, run `pnpm install && pnpm dev`. Discover adapters from `/llms/agent-configuration.txt` and icons from `/llms/agent-icons.txt`. This phase is unambiguous and complete.

2. **Phase 1 Company Creation** — POST to `/api/companies` with the specified name/description. Save `$COMPANY_ID`. Set budget. Clear, no ambiguity.

3. **Phase 2 Org Chart** — Create 11 agents in dependency order. The roster table is comprehensive with clear reporting lines. Heartbeat config covers both cron (300s interval) and manual (`wakeOnDemand: true`). The instruction to discover adapters dynamically rather than hardcoding is good practice.

4. **Phase 3 Goals** — Create 9 goals linked to company mission. Clear ownership mapping.

5. **Phase 4 Issues** — 7 seed issues with structured descriptions (Objective + Acceptance Criteria), each assigned and goal-linked. Priority levels specified.

6. **Phase 5 Package** — Clear directory structure following `agentcompanies/v1`. The `.paperclip.yaml` only includes agents needing env overrides (DevOps, Publisher), per spec guidance.

7. **Phase 6 Verification** — Covers API validation, org tree integrity, and repo-level typecheck/test/build.

**Points of confusion or ambiguity:**
- None critical. The prompt is executable as-is.
- Minor: The CEO is described as "AJ (Board Operator)" — the prompt correctly notes to represent the human, but the exact adapter configuration for a human-represented CEO could be more explicit (some instances may not have all adapters).
- The constraint to discover adapters dynamically from `/llms/agent-configuration.txt` correctly handles this.

**Compliance validation:** The prompt follows all identified repo conventions — `agentcompanies/v1` spec, SKILL.md frontmatter patterns, heartbeat protocol, issue lifecycle, and separation of concerns (own directory under `/agents`).

**Verdict:** Zero critical issues. The prompt is ready for execution.

---

The prompt above is your complete, spec-driven, copy-paste-ready instruction set. Key refinements from your draft:

- **11 agents** covering all your requested roles plus the teams you mentioned (design, publishing, ideation, DevOps, security, Responsible AI, program management)
- **Hub-and-spoke workflow** — CEO delegates to department leads (CTO, SocialSage, EventMaster, ProjectPilot, EthicsWatch), who each manage their own sub-teams
- **Dual-trigger heartbeats** — every agent supports both scheduled cron (5-min intervals) and manual wake-on-demand
- **7 seed issues** with structured acceptance criteria assigned to the right agents
- **Portable company package** at `agents/aj-ai-services/` following `agentcompanies/v1` spec — separate from existing agent skills as you requested
- **Dynamic adapter discovery** — no hardcoded adapter types, uses whatever the running instance supports
- **Full verification phase** including API validation and repo-level typecheck/test/build

