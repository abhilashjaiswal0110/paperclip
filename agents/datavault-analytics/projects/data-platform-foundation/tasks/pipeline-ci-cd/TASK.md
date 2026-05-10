---
name: Pipeline CI/CD setup
assignee: dataops-engineer
project: data-platform-foundation
---

## Objective

Implement CI/CD for all data pipelines so every change is tested before reaching production.

## Acceptance Criteria

- [ ] dbt CI: `dbt build --select state:modified+` runs on every PR targeting the main branch
- [ ] dbt schema tests run on CI: all not_null, unique, and accepted_values tests pass before merge
- [ ] Airflow DAG validation: DAG import errors caught on CI before deployment
- [ ] Environment promotion: dev to staging to prod with manual promotion gate at staging to prod
- [ ] No pipeline change merges to main without at least one DataOps review approval
- [ ] CI secrets (warehouse credentials for testing) use ephemeral service accounts with read-only access to dev schema only
