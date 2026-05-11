---
name: TDD Sprint Gate — Test-Before-Code Verification
assignee: qa-engineer
recurring: true
project: mvp-factory
---

Verify that the current sprint follows test-driven development discipline before any feature implementation begins. This gate runs at sprint kickoff.

## TDD Verification Checklist

1. Confirm that all sprint stories have acceptance criteria written in testable form (Given/When/Then or equivalent)
2. Verify that TestGuard has created failing test stubs for each acceptance criterion before BackendAce or FrontForge begin implementation
3. Check that test file skeletons exist in the repository for all sprint tasks (even if tests are marked skip at this point)
4. Confirm coverage baseline from the prior sprint is documented — this sprint must not regress below it
5. Post TDD gate status as a comment: GREEN (all stories have test stubs), YELLOW (some missing, list them), RED (no tests created — sprint is blocked)

## Gate Rules

- **GREEN**: Sprint proceeds. Implementation may begin.
- **YELLOW**: Implementation may begin only for stories with test stubs. Missing stubs must be created within 24 hours or the story moves to the next sprint.
- **RED**: Sprint is blocked. No implementation until test stubs are created. Escalate to ArchLead immediately.

## Why This Exists

Test-first discipline catches scope ambiguity early, ensures coverage does not slip below 80%, and prevents the sprint from accumulating test debt that blocks the release gate.
