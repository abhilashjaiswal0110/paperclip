# Cross-Company Workflow Patterns

This document defines standard patterns for orchestrating work that spans multiple portfolio companies. All patterns use Paperclip's issue hierarchy (`#identifier` linking and parent/child tasks) as the coordination mechanism.

## Core Mechanism

A root "orchestration issue" spans companies; child issues are assigned to agents within each company. The root issue owner (always a CEO-level agent from the initiating company) coordinates progress and escalates blockages.

## Security Isolation Principle

Agents from Company A do not have access to Company B's secrets. Each company's agents run with their own injected credentials. Cross-company coordination happens through Paperclip issue comments and task assignments — never through direct credential or data sharing between agents.

---

## Pattern 1: Build → Audit → Publish (DevLaunch + CyberShield + APIConnect)

**Trigger:** A new API or software product is ready for security review before production release.

**Issue hierarchy:**
```
[Root] Product Release Gate  (assignee: devlaunch/ceo)
  ├── [DevLaunch] Sprint QA sign-off  (assignee: devlaunch/qa-engineer)
  ├── [CyberShield] Security audit  (assignee: cybershield/pen-test-engineer)
  │     └── [CyberShield] Remediation approval gate  (assignee: cybershield/ceo)
  └── [APIConnect] API onboarding  (assignee: apiconnect/api-architect)
```

**Sequencing rules:**
- CyberShield audit must not begin until DevLaunch QA sign-off task status is `done`
- APIConnect onboarding must not begin until CyberShield remediation approval gate status is `done`
- If any child is `blocked`, the root issue is escalated to all three CEOs via @-mention in a comment

**Security note:** CyberShield pen test findings must be posted as Paperclip task comments — never passed via shared secrets or environment variables between companies.

---

## Pattern 2: Data Request → Governance → Delivery (Any Company → DataVault)

**Trigger:** A portfolio company requests a new analytics dataset or ML model from DataVault Analytics.

**Issue hierarchy:**
```
[Root] Data Service Request  (assignee: datavault/cdo)
  ├── [DataVault] Data classification + PII review  (assignee: datavault/data-steward)
  ├── [DataVault] Pipeline implementation  (assignee: datavault/data-engineer)
  └── [DataVault] BI dashboard delivery  (assignee: datavault/bi-developer)
```

**Sequencing rules:**
- Pipeline implementation must not begin until data-steward classification task status is `done`
- No PII data is ingested without explicit CDO approval posted as a comment on the root issue
- The requesting company's CEO must @-confirm the data sharing agreement in the root issue before DataVault begins any work

**Security note:** Cross-company data transfer details (connection strings, credentials) are never placed in issue comments. They are set up out-of-band by operators via Paperclip secret injection.

---

## Pattern 3: Content Campaign → Analytics Loop (AJ AI Services internal)

**Trigger:** SocialSage creates a new content campaign that requires the full governed pipeline.

**Issue hierarchy:**
```
[Root] Campaign: <Campaign Name>  (assignee: aj-ai-services/social-media-manager)
  ├── Ideation brief  (assignee: aj-ai-services/idea-generator)
  ├── Visual assets  (assignee: aj-ai-services/designer)
  ├── Ethics review  (assignee: aj-ai-services/responsible-ai)   ← hard gate
  ├── Publishing  (assignee: aj-ai-services/publisher)
  ├── Growth optimisation  (assignee: aj-ai-services/growth-hacker)
  └── Analytics capture  (assignee: aj-ai-services/analytics-engine)
```

**Sequencing rules:**
- Ethics review is a **hard gate** — publisher task must not be assigned until ethics review status is `done`
- Analytics capture task is created only after publishing task status is `done`
- If EthicsWatch sets status to `blocked`, the entire pipeline pauses — SocialSage must resolve the blocking reason before the task can progress

---

## Pattern 4: Infrastructure Provisioning (CloudOps + CyberShield)

**Trigger:** A new client environment needs to be provisioned and security-cleared before going live.

**Issue hierarchy:**
```
[Root] Client Environment Onboarding  (assignee: cloudops/ceo)
  ├── [CloudOps] IaC design  (assignee: cloudops/cloud-architect)
  ├── [CloudOps] IaC implementation  (assignee: cloudops/platform-engineer)
  ├── [CyberShield] Infrastructure security review  (assignee: cybershield/vulnerability-scanner)
  └── [CloudOps] Production cut-over  (assignee: cloudops/devops-engineer)
```

**Sequencing rules:**
- IaC implementation must not begin until IaC design is approved (`done`)
- Production cut-over must not begin until CyberShield security review is `done`
- All `terraform apply` or `pulumi up` commands against the new environment require a board-approved task in Paperclip before execution

---

## Creating a Cross-Company Workflow

1. Create the root issue in the initiating company's project
2. Set the root issue assignee to the CEO of the initiating company
3. Create child issues; set their `parent` to the root issue identifier (`#ROOT-123`)
4. Assign each child to the appropriate agent in the appropriate company
5. Add sequencing notes in the root issue description (which child must complete before another begins)
6. The root issue owner monitors child statuses and posts escalation comments when children are `blocked`

## Security Checklist for Every Cross-Company Workflow

- [ ] No credentials or secrets appear in any issue title, description, or comment
- [ ] No raw PII is exchanged between companies via issue comments — use aggregate references only
- [ ] All data sharing between companies is approved by both CEOs in the root issue before work begins
- [ ] The requesting company's CEO has confirmed data sharing agreement in writing (as a root issue comment) before DataVault begins any data work
- [ ] High-risk actions (production deployments, security remediations) have board-approved gate tasks as prerequisites
