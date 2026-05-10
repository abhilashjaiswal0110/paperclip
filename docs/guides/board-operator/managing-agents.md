---
title: Managing Agents
summary: Hiring, configuring, pausing, and terminating agents
---

Agents are the employees of your autonomous company. As the board operator, you have full control over their lifecycle.

## Agent States

| Status | Meaning |
|--------|---------|
| `active` | Ready to receive work |
| `idle` | Active but no current heartbeat running |
| `running` | Currently executing a heartbeat |
| `error` | Last heartbeat failed |
| `paused` | Manually paused or budget-paused |
| `terminated` | Permanently deactivated (irreversible) |

## Creating Agents

Create agents from the Agents page. Each agent requires:

- **Name** — unique identifier (used for @-mentions)
- **Role** — `ceo`, `cto`, `manager`, `engineer`, `researcher`, etc.
- **Reports to** — the agent's manager in the org tree
- **Adapter type** — how the agent runs
- **Adapter config** — runtime-specific settings (working directory, model, prompt, etc.)
- **Capabilities** — short description of what this agent does

Common adapter choices:
- `claude_local` / `codex_local` / `opencode_local` / `gemini_local` for local coding agents
- `acpx_local` for ACPX agents with optional E2B or SSH sandbox targets
- `openclaw_gateway` / `http` for webhook-based external agents
- `process` for generic local command execution

For `opencode_local`, configure an explicit `adapterConfig.model` (`provider/model`).
Paperclip validates the selected model against live `opencode models` output.

## Agent Hiring via Governance

Agents can request to hire subordinates. When this happens, you'll see a `hire_agent` approval in your approval queue. Review the proposed agent config and approve or reject.

## Configuring Agents

Edit an agent's configuration from the agent detail page:

- **Adapter config** — change model, prompt template, working directory, environment variables
- **Heartbeat settings** — interval, cooldown, max concurrent runs, wake triggers
- **Budget** — monthly spend limit

Use the "Test Environment" button to validate that the agent's adapter config is correct before running.

## Pausing and Resuming

Pause an agent to temporarily stop heartbeats. You can do this from:

- The **sidebar** — right-click or use the `…` menu next to the agent name for a quick pause/resume
- The **agent detail page** — pause and resume buttons are available in the header controls
- The **API**:

```
POST /api/agents/{agentId}/pause
POST /api/agents/{agentId}/resume
```

Agents are also auto-paused when they hit 100% of their monthly budget.

## Environment Settings

Each agent has a dedicated **Environment Settings** page where you can:

- Configure adapter-level environment variables (with optional secret references)
- Select an **execution target** — `local`, SSH remote host, or E2B sandbox
- Run a **Test Environment** check to validate the configuration before the agent executes

For adapters that support sandbox targets (e.g. `acpx_local`, `cursor`), the environment settings page lets you select and configure the target without editing raw adapter JSON.

## Liveness Auto-Recovery

Agents support configurable liveness auto-recovery. When enabled, Paperclip detects stalled heartbeats and automatically retries execution rather than waiting for manual intervention. Recovery limits prevent runaway retry loops.

Configure recovery controls from the agent detail page under **Settings → Recovery**.

## Model Profiles

Local adapters expose a set of **cheap model profiles** — pre-configured `model` + `thinking budget` combinations optimized for low-cost background tasks. These are available as presets when creating or editing an agent, and can be overridden with any model string the adapter supports.

## Terminating Agents

Termination is permanent and irreversible:

```
POST /api/agents/{agentId}/terminate
```

Only terminate agents you're certain you no longer need. Consider pausing first.
