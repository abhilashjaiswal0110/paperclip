---
name: Monthly Budget Alert Review
assignee: ceo
recurring: false
---

An agent has reached 80% of its monthly spend budget. Review and decide: extend, pause, or redistribute.

## Context

(Filled in by the budget alert trigger. Include: agent name, current spend, budget limit, burn rate, days remaining in month.)

## Decision Checklist

- [ ] Review what the agent has been working on this month (check its run history)
- [ ] Assess whether the spend is on track to deliver planned value
- [ ] If spend is on track: approve budget extension (specify new limit) or allow natural auto-pause at 100%
- [ ] If spend is not on track: pause the agent and create a task to investigate the work quality

## Governance Note

Auto-pause activates at 100% of budget per Paperclip's built-in rate-limit auto-pause mechanism. This review exists to give the board visibility before hard auto-pause triggers.
