---
name: Test suite and QA sign-off
assignee: qa-engineer
project: mvp-factory
priority: high
---

## Scope

Build and execute the full test suite. Produce the QA sign-off report that gates the sprint release.

## Deliverables

1. End-to-end test suite covering all acceptance criteria from ProdPilot
2. Regression test suite for all critical user paths
3. API contract tests validating backend against OpenAPI spec
4. Performance tests: verify p99 latency ≤ 200ms on all endpoints
5. Bug report with all open issues classified by severity (P1–P4)
6. Final QA sign-off report: coverage %, zero P1 bugs, release recommendation

## Success Criteria

- E2E tests pass for 100% of user stories in acceptance criteria
- Combined test coverage (backend + frontend) ≥ 80%
- Zero open P1 bugs at sign-off
- All P2 bugs documented with workarounds and remediation timeline
- QA sign-off report delivered to ArchLead before CEO approval gate
