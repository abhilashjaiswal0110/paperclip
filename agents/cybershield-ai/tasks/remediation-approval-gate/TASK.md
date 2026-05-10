---
name: Remediation Approval Gate
assignee: ceo
recurring: false
---

## Purpose

This is the mandatory board approval gate for all recommended security remediations. No agent may file a ticket, push a change, or initiate automated remediation until ShieldCEO approves this task.

## Remediation Under Review

(Filled in by ChiefGuard when creating this task. Include: CVE ID or incident ID, affected systems, proposed remediation action, estimated impact, estimated cost, urgency classification.)

## Approval Checklist

- [ ] Remediation scope clearly defined — no ambiguity about what will change
- [ ] Impact assessment reviewed — potential service disruption acknowledged
- [ ] Cost within approved remediation budget
- [ ] Compliance requirement confirmed (if applicable)
- [ ] Rollback plan documented

## Decision

ShieldCEO posts approval decision as a comment on this task:
- **APPROVED**: ChiefGuard may proceed with remediation assignment
- **REJECTED**: ChiefGuard documents rejection reason; issue moved to backlog for future sprint
- **DEFERRED**: Specify the conditions under which this will be re-reviewed

## Security Note

This approval gate exists because compliance frameworks (SOC 2, ISO 27001, GDPR) require human-in-the-loop control over automated remediation actions. Bypassing this gate constitutes a governance violation that must be logged as a nonconformity.
