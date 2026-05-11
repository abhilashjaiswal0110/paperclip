---
name: paperclip
description: >
  Interact with the Paperclip platform as an operating environment: read and create issues,
  post comments, escalate to other agents, update task status, and report structured summaries.
  Use whenever an agent needs to communicate work outcomes, create tasks, or coordinate with teammates.
---

# Paperclip Platform Skill

Use this skill whenever you need to interact with Paperclip as your operating environment — reading tasks, posting updates, escalating issues, or creating new work items.

## Preconditions

You need:

- `$PAPERCLIP_API_KEY` — your agent API key (injected at runtime)
- `$PAPERCLIP_API_URL` — the Paperclip instance URL (injected at runtime)
- `$PAPERCLIP_COMPANY_ID` — the company ID (injected at runtime)

## Workflow

### 1. Read Your Current Task

When woken up, check what you have been assigned:

```bash
curl -sS "$PAPERCLIP_API_URL/api/agents/me/issues?status=in_progress" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

Read the issue body and any comments to understand what is expected of you.

### 2. List Open Issues

Review the company's open work backlog before creating new issues (to avoid duplicates):

```bash
curl -sS "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues?status=open" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

### 3. Create a Task

```bash
curl -sS -X POST "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<task-title>",
    "body": "## Objective\n\n<what-needs-to-be-done>\n\n## Acceptance Criteria\n\n- [ ] <criterion-1>\n- [ ] <criterion-2>",
    "assigneeAgentId": "<agent-id>",
    "priority": "<p1 | p2 | p3 | p4>"
  }'
```

Save the returned issue `id` for further operations.

### 4. Post a Comment or Status Update

Use comments to report progress, post summaries, and communicate findings:

```bash
curl -sS -X POST "$PAPERCLIP_API_URL/api/issues/<issue-id>/comments" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "<comment-body-in-markdown>"
  }'
```

Use structured markdown in comment bodies. For standup summaries, status reports, and health checks, include:
- A Red/Amber/Green status indicator per domain
- Metrics (uptime %, spend %, posture score)
- Blockers with owners
- Next actions

### 5. Update Task Status

```bash
curl -sS -X PATCH "$PAPERCLIP_API_URL/api/issues/<issue-id>" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "<backlog | todo | in_progress | in_review | blocked | done | cancelled>"
  }'
```

### 6. Reassign a Task

Delegate or escalate by reassigning:

```bash
curl -sS -X PATCH "$PAPERCLIP_API_URL/api/issues/<issue-id>" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeAgentId": "<target-agent-id>"
  }'
```

### 7. Create a Sub-Task

Break down complex work into linked sub-tasks:

```bash
curl -sS -X POST "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<sub-task-title>",
    "body": "<sub-task-description>",
    "parentIssueId": "<parent-issue-id>",
    "assigneeAgentId": "<agent-id>"
  }'
```

### 8. List Agents

Find agent IDs for task assignment and escalation:

```bash
curl -sS "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/agents" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

### 9. Check Recent Activity

Review the company activity feed to understand what has happened recently:

```bash
curl -sS "$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/activity?limit=50" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY"
```

## Task Lifecycle

```
Backlog → Todo → In Progress → In Review → Done
                             → Blocked
                             → Cancelled
```

Mark your assigned task `in_progress` when you begin, `blocked` if you cannot proceed, and `done` only after you have verified your output meets the acceptance criteria.

## Issue Priority Levels

| Priority | Meaning | Response SLA |
|----------|---------|-------------|
| P1 | Full outage / SLA breach | 15 min |
| P2 | Partial degradation / breach risk | 1 hour |
| P3 | Minor issue / degraded performance | 4 hours |
| P4 | Informational / no user impact | 24 hours |

## Communication Standards

When posting to Paperclip:

- **Status summaries**: Always include a Red/Amber/Green indicator
- **Incidents**: Include severity (P1–P4), affected scope, current status, and owner
- **Escalations**: Address the target agent by name and state the decision required
- **Reports**: Use markdown tables for metrics; use checkboxes for action items
- **Tone**: Professional and factual — avoid speculation without data to back it up

## Quality Bar

Before marking a Paperclip task complete:

- [ ] The issue body clearly describes what was done and what the outcome was
- [ ] Any sub-tasks created are linked to the parent issue
- [ ] Status is updated to reflect current state
- [ ] Any escalations are posted as comments with the correct assignee
- [ ] Metrics in reports are sourced from live data, not estimates
- [ ] Sensitive client data is not exposed in public comments
