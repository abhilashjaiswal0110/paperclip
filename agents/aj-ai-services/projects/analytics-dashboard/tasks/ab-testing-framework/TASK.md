---
name: A/B testing framework for content optimisation
assignee: ab-tester
project: analytics-dashboard
---

## Objective

Design and document the A/B testing framework that ABTester uses to run controlled experiments on LinkedIn content.

## Acceptance Criteria

- [ ] Framework document: hypothesis template, variant design rules, success metric definition, minimum sample size formula
- [ ] Statistical significance threshold: p < 0.05, minimum n = 30 per variant — documented and enforced
- [ ] Variant isolation: no post appears in two experiments simultaneously
- [ ] Experiment lifecycle: draft → running → completed → winner promoted
- [ ] Integration with PublishBot: ABTester provides scheduling brief; PublishBot executes variant ordering
- [ ] Ethics gate: all experiment briefs reviewed by EthicsWatch before launch if they involve emotionally sensitive framing
- [ ] Experiment results documented as task comments with raw numbers, p-value, and winner declaration
