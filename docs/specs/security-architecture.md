---
title: "Security Architecture"
description: "Security model, authentication flows, threat boundaries, secrets management, and company-level security controls"
---

# Security Architecture

This document covers Paperclip's security architecture from an architect's perspective — authentication model, authorization boundaries, secrets management, per-company security controls, and threat mitigation patterns.

---

## 1. Security Model Overview

Paperclip operates a **multi-tenant control plane** where each company is a fully isolated security domain. The security model enforces three guarantees:

1. **Company isolation** — agents cannot access entities outside their company (enforced at the API layer)
2. **Least-privilege agent access** — agents receive scoped, short-lived credentials per heartbeat run
3. **Secrets never leave the server** — credentials are encrypted at rest and injected into agent processes only at runtime

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARIES                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  TRUSTED ZONE: Paperclip Server                              │   │
│  │  ┌─────────────┐  ┌────────────┐  ┌───────────────────────┐ │   │
│  │  │ Auth Engine  │  │ Secret     │  │ Company Scope         │ │   │
│  │  │ Better Auth  │  │ Vault      │  │ Enforcement           │ │   │
│  │  │ JWT issuer   │  │ AES-256    │  │ Every route           │ │   │
│  │  └─────────────┘  └────────────┘  └───────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                    Secret injection                                  │
│                    (runtime only)                                    │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  SEMI-TRUSTED ZONE: Agent Runtimes                           │   │
│  │  Agents execute with scoped JWT + injected secrets           │   │
│  │  Agents can only call APIs within their company scope        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                    Outbound API calls                                │
│                    (agent-initiated)                                 │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  UNTRUSTED ZONE: External Services                           │   │
│  │  Cloud providers · GitHub · LLM APIs · PagerDuty · Slack     │   │
│  │  Agents interact with external services using injected keys  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Architecture

### 2.1 Authentication Flows

Paperclip supports three authentication methods depending on the caller type:

```
┌──────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOWS                            │
│                                                                  │
│  Board Operator (Browser)                                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Login   │───►│ Better   │───►│ Session  │───► Full access   │
│  │  Form    │    │ Auth     │    │ Cookie   │    (all companies  │
│  └──────────┘    └──────────┘    └──────────┘    operator owns)  │
│                                                                  │
│  Agent (Heartbeat Run)                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ Heartbeat│───►│ Server   │───►│ Run JWT  │───► Scoped access │
│  │ trigger  │    │ issues   │    │ (short-  │    (own company   │
│  └──────────┘    │ JWT      │    │  lived)  │     only)         │
│                  └──────────┘    └──────────┘                   │
│                                                                  │
│  Agent (Persistent Key)                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ POST     │───►│ Key      │───►│ Bearer   │───► Scoped access │
│  │ /keys    │    │ created  │    │ API key  │    (own company    │
│  └──────────┘    │ (hashed) │    │ (long-   │     only)         │
│                  └──────────┘    │  lived)  │                   │
│                                  └──────────┘                   │
│                                                                  │
│  Local Trusted Mode                                              │
│  ┌──────────┐                    ┌──────────┐                   │
│  │ Any      │───────────────────►│ Auto     │───► Full access   │
│  │ request  │                    │ board    │    (no auth       │
│  └──────────┘                    │ identity │     required)     │
│                                  └──────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Authentication Method Comparison

| Method | Caller | Lifetime | Scope | Storage |
|--------|--------|----------|-------|---------|
| Better Auth session | Board operator (browser) | Session-length | All owned companies | HTTP-only cookie |
| Run JWT | Agent (heartbeat) | Single heartbeat run | Agent's company only | `PAPERCLIP_API_KEY` env var |
| API key | Agent (persistent) | Until revoked | Agent's company only | Hashed at rest in DB |
| No auth | Local trusted mode | N/A | All (single operator) | N/A |

### 2.3 Board Claim Flow

When transitioning from `local_trusted` to `authenticated` mode:

```
Server starts ──► Emits one-time claim URL
                  /board-claim/<token>?code=<code>
                          │
                  Signed-in user visits URL
                          │
                  ┌───────▼───────┐
                  │ Promote user  │
                  │ to admin      │
                  │ Demote local  │
                  │ board user    │
                  │ Ensure company│
                  │ membership    │
                  └───────────────┘
```

---

## 3. Authorization Model

### 3.1 Company Scope Enforcement

Every API request is validated against company boundaries at the middleware layer:

```
Incoming Request
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Authenticate │────►│ Extract      │────►│ Verify       │
│ caller       │     │ target       │     │ company      │
│ (JWT/session │     │ company ID   │     │ membership   │
│  /API key)   │     │ from route   │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                         ┌────────▼────────┐
                                    Yes  │ Caller belongs  │  No
                                    ┌────┤ to company?     ├────┐
                                    │    └─────────────────┘    │
                                    ▼                           ▼
                             Process request              403 Forbidden
```

### 3.2 Actor Permission Matrix

| Action | Board Operator | Agent (own company) | Agent (other company) |
|--------|---------------|--------------------|-----------------------|
| Read company entities | Yes | Yes | **No (403)** |
| Create/update issues | Yes | Yes | **No (403)** |
| Checkout task | Yes | Yes (atomic) | **No (403)** |
| Invoke agent | Yes | No | No |
| Approve/reject | Yes | No | No |
| Pause/terminate agent | Yes | No | No |
| Create/read secrets | Yes | Read (injected) | **No (403)** |
| View activity log | Yes | Yes (own company) | **No (403)** |

---

## 4. Secrets Management

### 4.1 Encryption Architecture

```
┌───────────────────────────────────────────────────────────┐
│                SECRETS LIFECYCLE                          │
│                                                          │
│  Create Secret                                            │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────┐   │
│  │ Plaintext │───►│ AES-256       │───►│ Ciphertext   │   │
│  │ value     │    │ encrypt with  │    │ stored in    │   │
│  │           │    │ master key    │    │ database     │   │
│  └──────────┘    └───────────────┘    └──────────────┘   │
│                                                          │
│  Resolve at Runtime                                       │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────┐   │
│  │ Agent    │    │ Server reads  │    │ Decrypted    │   │
│  │ heartbeat│───►│ secret_ref,   │───►│ value set as │   │
│  │ starts   │    │ decrypts with │    │ env var in   │   │
│  │          │    │ master key    │    │ agent process│   │
│  └──────────┘    └───────────────┘    └──────────────┘   │
│                                                          │
│  Master Key Storage                                       │
│  ~/.paperclip/instances/default/secrets/master.key        │
│  Never leaves the host machine  ·  Auto-created on setup  │
│  Override: PAPERCLIP_SECRETS_MASTER_KEY env var            │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Secret Reference Model

Instead of storing credentials in agent config as plaintext, agents reference encrypted secrets:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": {
      "type": "secret_ref",
      "secretId": "8f884973-c29b-44e4-8ea3-6413437f8081",
      "version": "latest"
    }
  }
}
```

The server resolves and decrypts at runtime — the plaintext value never appears in the database, UI, agent config, or API responses.

### 4.3 Strict Mode

When `PAPERCLIP_SECRETS_STRICT_MODE=true`, sensitive env keys matching `*_API_KEY`, `*_TOKEN`, `*_SECRET` patterns **must** use secret references. Inline plaintext values are rejected. Recommended for any deployment beyond `local_trusted`.

---

## 5. Agent Company Security Controls

Each agent company implements domain-specific security layers. The controls below are defined in the company specification and enforced by the agent hierarchy.

### 5.1 CloudOps Pro — Defence-in-Depth

CloudOps Pro enforces seven security layers for cloud infrastructure:

```
┌────────────────────────────────────────────────────────────────┐
│                CLOUDOPS PRO SECURITY LAYERS                   │
│                                                                │
│  Layer 1: IaC Layer                                            │
│  ├── All infra defined in code (Terraform/OpenTofu)            │
│  ├── Manual terraform apply outside CI/CD = P2 incident        │
│  └── Owner: ArchBot (Cloud Architect)                          │
│                                                                │
│  Layer 2: Pipeline Layer                                        │
│  ├── OIDC-based cloud auth (no long-lived keys in CI)          │
│  ├── Signed container images only                              │
│  └── Owner: DeployBot (DevOps Engineer)                        │
│                                                                │
│  Layer 3: Runtime Layer                                         │
│  ├── Continuous CSPM every 15 minutes                          │
│  ├── Any drift = security incident                             │
│  └── Owner: DriftGuard (Security Ops)                          │
│                                                                │
│  Layer 4: Identity Layer                                        │
│  ├── Least-privilege IAM policies                              │
│  ├── Quarterly entitlement review                              │
│  ├── 90-day inactivity flag and revocation                     │
│  └── Owner: DriftGuard (Security Ops)                          │
│                                                                │
│  Layer 5: Secret Layer                                          │
│  ├── Vault-backed secrets with auto-rotation (90 days)         │
│  ├── detect-secrets pre-commit hook                            │
│  └── Owner: DriftGuard (Security Ops)                          │
│                                                                │
│  Layer 6: Network Layer                                         │
│  ├── No 0.0.0.0/0 ingress on sensitive ports                  │
│  ├── VPC flow logs enabled by default                          │
│  └── Owner: ArchBot (Cloud Architect)                          │
│                                                                │
│  Layer 7: Compliance Layer                                      │
│  ├── CIS Benchmark L2 continuous (15 min)                      │
│  ├── SOC 2 Type II daily                                       │
│  ├── NIST CSF weekly                                           │
│  └── Owner: DriftGuard (Security Ops)                          │
└────────────────────────────────────────────────────────────────┘
```

#### Three-Gate Deployment Security

```
   Code Change
       │
       ▼
┌──────────────┐
│ Gate 1:      │     checkov: zero HIGH/CRITICAL
│ SECURITY     │     tfsec: zero HIGH/CRITICAL
│ (DriftGuard) │     No credential exposure in YAML
└──────┬───────┘
       │ PASS
       ▼
┌──────────────┐
│ Gate 2:      │     Spend delta ≤ approved threshold
│ COST         │     No active cost anomaly
│ (CostSage)   │
└──────┬───────┘
       │ PASS
       ▼
┌──────────────┐
│ Gate 3:      │     No active P1/P2 incidents
│ SLA          │     Error budget not exhausted
│ (UptimeGuard)│     30-day availability ≥ 99.9%
└──────┬───────┘
       │ PASS
       ▼
┌──────────────┐
│ DEPLOY       │     Pipeline-only (no manual apply)
│              │     Post-deploy health check (5 min)
│              │     FAIL → Auto-rollback + P2 incident
└──────────────┘
```

### 5.2 SupportGenius — Data Protection Controls

SupportGenius enforces security controls focused on data privacy and escalation governance:

```
┌────────────────────────────────────────────────────────────────┐
│             SUPPORTGENIUS SECURITY LAYERS                     │
│                                                                │
│  Layer 1: Data Layer                                           │
│  ├── PII anonymised before KB articles, reports, CSAT data     │
│  └── Owner: KnowledgeKeeper, CSATInsight                       │
│                                                                │
│  Layer 2: Access Layer                                          │
│  ├── Each agent: minimum ticket scope (least privilege)        │
│  └── Owner: SupportDirector                                    │
│                                                                │
│  Layer 3: Escalation Gate                                       │
│  ├── L3→Engineering/Vendor requires SupportDirector sign-off   │
│  ├── CEO awareness mandatory for external escalations          │
│  └── Owner: SupportDirector, SupportCEO                        │
│                                                                │
│  Layer 4: Knowledge Gate                                        │
│  ├── No KB article published without quality review             │
│  ├── PII-clean check mandatory (no names, emails, ticket IDs)  │
│  └── Owner: KnowledgeKeeper                                    │
│                                                                │
│  Layer 5: SLA Authority                                         │
│  ├── SLAGuard is sole authoritative breach arbiter              │
│  ├── No manual override without CEO approval                   │
│  └── Owner: SLAGuard, SupportCEO                               │
│                                                                │
│  Layer 6: Audit Layer                                           │
│  ├── Every action logged: triage, escalation, KB publish, CSAT │
│  └── Owner: Paperclip activity trail (automatic)               │
│                                                                │
│  Layer 7: Secret Layer                                          │
│  ├── All API keys/tokens in Paperclip secrets manager           │
│  ├── Never in agent output, KB articles, or runbook content     │
│  └── Owner: SupportCEO                                          │
└────────────────────────────────────────────────────────────────┘
```

#### Ticket Escalation Security

```
Inbound Ticket
       │
       ▼
┌──────────────┐
│ L1: TriageBot│     KB match ≥90% → Auto-close → CSAT survey
│              │     KB match 70-89% → Suggest → 24h auto-close
│              │     No match / <70% → Escalate L2
└──────┬───────┘
       │ Escalate
       ▼
┌──────────────┐
│ L2: Diagnos  │     Runbook resolves → Close → KB proposal
│    Bot       │     Unknown / systemic → Escalate L3
└──────┬───────┘
       │ Escalate
       ▼
┌──────────────┐
│ L3: RootCause│     RCA + fix → Post-mortem → KB article
│    Bot       │     Vendor needed → SupportDirector sign-off
│              │                  → CEO awareness
└──────────────┘     (Escalation gate enforced)
```

### 5.3 AJ AI Services — Content Safety Controls

```
┌────────────────────────────────────────────────────────────────┐
│             AJ AI SERVICES SECURITY CONTROLS                  │
│                                                                │
│  Content Safety Gate                                            │
│  ├── All AI-generated content reviewed by EthicsWatch           │
│  ├── Bias detection and safety guardrails before publish        │
│  └── Owner: EthicsWatch (Responsible AI Officer)                │
│                                                                │
│  Pipeline Security                                              │
│  ├── CI/CD via GitHub Actions; no manual deploys                │
│  ├── Security baselines for social media infra                  │
│  └── Owner: SecureGuard (Security Engineer)                     │
│                                                                │
│  Secret Management                                              │
│  ├── GH_TOKEN for DevOpsEngine: CI/CD access                   │
│  ├── LINKEDIN_API_KEY for PublishBot: social API                │
│  ├── All secrets stored in Paperclip secrets manager            │
│  └── Owner: TechLead (CTO)                                     │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Incident Response Architecture

### 6.1 CloudOps Pro Incident Severity Matrix

| Priority | Definition | Auto-Remediate | Escalation Timeline |
|----------|-----------|---------------|---------------------|
| P1 | Full outage / SLA breach | No | 5 min → CloudCTO, 15 min → CloudCEO |
| P2 | Partial degradation > 50% | No | 15 min → CloudCTO |
| P3 | Minor degradation < 50% | Yes (runbook) | Notify SLAPilot |
| P4 | No user impact | Yes (runbook) | Log only |

### 6.2 SupportGenius Escalation SLAs

| Priority | First Response | Resolution Target | Breach Alert Threshold |
|----------|---------------|-------------------|----------------------|
| P1 | 15 minutes | 4 hours | 10 min / 3 hr elapsed |
| P2 | 30 minutes | 8 hours | 24 min / 6.4 hr elapsed |
| P3 | 2 hours | 24 hours | 96 min / 19.2 hr elapsed |
| P4 | 4 hours | 72 hours | 3.2 hr / 57.6 hr elapsed |

---

## 7. Compliance and Audit

### 7.1 Activity Audit Trail

Every mutating API call is logged:

| Field | Description |
|-------|------------|
| Timestamp | UTC time of the action |
| Actor | Board operator or agent ID |
| Action | Create, update, delete, checkout, approve, reject |
| Entity | Company, agent, issue, approval, secret, cost event |
| Payload | Relevant fields changed |

The audit trail is queryable via `GET /api/companies/{id}/activity` and visible in the UI Activity Log.

### 7.2 CloudOps Pro Compliance Frameworks

| Framework | Scope | Frequency | Owner |
|-----------|-------|-----------|-------|
| CIS Benchmark Level 2 | All environments (AWS/Azure/GCP) | Every 15 minutes | DriftGuard |
| SOC 2 Type II | Production | Daily | DriftGuard |
| NIST CSF | Enterprise | Weekly | DriftGuard |
| PCI DSS | Card-data environments (if applicable) | Continuous | DriftGuard |

---

## 8. Security Best Practices Summary

| Practice | Implementation |
|----------|---------------|
| Secrets encrypted at rest | AES-256 with local master key; `secret_ref` model |
| Short-lived agent credentials | Run JWTs scoped to single heartbeat |
| Company isolation | Middleware enforces company boundary on every request |
| API key hashing | Agent API keys stored as one-way hashes; plaintext shown only at creation |
| Strict mode | Enforce `secret_ref` for all sensitive env vars (`*_API_KEY`, `*_TOKEN`, `*_SECRET`) |
| Audit trail | Every mutation logged with actor, action, entity, and timestamp |
| Budget hard-stop | Agent auto-paused at 100% budget; prevents runaway cost |
| Atomic checkout | `409 Conflict` on concurrent task claim; prevents duplicate work |
| Approval gates | Hiring, strategy, and governed actions require board approval |
| No manual deploys | CloudOps Pro: manual `terraform apply` = P2 incident; pipeline-only deployments |
| PII protection | SupportGenius: PII stripped from KB articles, reports, and CSAT data |
| Content safety | AJ AI Services: EthicsWatch reviews all AI-generated content before publish |
