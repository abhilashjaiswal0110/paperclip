---
name: Engineering Team
description: Cloud architecture, IaC implementation, CI/CD automation, and site reliability for all managed client environments
slug: engineering
manager: ../../agents/cto/AGENTS.md
includes:
  - ../../agents/cto/AGENTS.md
  - ../../agents/cloud-architect/AGENTS.md
  - ../../agents/devops-engineer/AGENTS.md
  - ../../agents/sre/AGENTS.md
  - ../../agents/platform-engineer/AGENTS.md
tags:
  - engineering
  - infrastructure
  - iac
  - devops
  - sre
  - reliability
---

The Engineering Team is responsible for designing, building, and operating the cloud infrastructure that underpins 99.9% uptime and zero-touch deployment commitments.

CloudCTO leads the team across four disciplines:
- **ArchBot (Cloud Architect)** designs multi-cloud IaC templates and enforces infrastructure-as-code as the single source of truth
- **PlatformForge (Platform Engineer)** implements and maintains Terraform and Pulumi modules, runs drift detection, and ensures all infrastructure changes flow through code-reviewed pull requests
- **DeployBot (DevOps Engineer)** operates the CI/CD platform and enforces zero-touch deployment policy with automated rollback
- **UptimeGuard (SRE)** monitors all environments continuously, executes automated incident runbooks, and tracks SLI/SLO/SLA compliance

**Core mandate:** Deliver infrastructure changes with zero downtime, zero manual intervention, and full auditability at every layer.
