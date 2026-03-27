---
name: CI/CD pipeline and cloud deployment
assignee: devops-engineer
project: mvp-factory
priority: high
---

## Scope

Set up the full CI/CD pipeline and cloud infrastructure for the project. Enable automated testing on every PR and zero-downtime production deployment after CEO sprint gate approval.

## Deliverables

1. GitHub Actions pipeline: build, lint, test on every PR
2. Staging environment: auto-deploy on merge to main branch
3. Production environment: deploy on CEO sprint gate approval only
4. Docker containerisation for backend services
5. Frontend deployment to Vercel (or equivalent CDN)
6. Automated rollback: production rollback to previous version within 5 minutes
7. Secrets management: all credentials via secrets manager, zero plain-text keys

## Success Criteria

- Every PR triggers CI in under 10 minutes
- Staging auto-deployment working for BackendAce and FrontForge testing
- Production deployment manual-trigger only (after CEO approval)
- Rollback procedure tested and documented
- No credentials in code, CI YAML, or environment files
- OIDC-based cloud authentication (no long-lived access keys)
