---
name: DataVault Analytics
description: Turn raw data into strategic advantage — data pipelines, ML models, and BI dashboards that make every company in the portfolio smarter.
slug: datavault-analytics
schema: agentcompanies/v1
version: 1.0.0
license: MIT
authors:
  - name: DataVault Analytics Team
goals:
  - Deliver production-grade data pipelines within 7 days of project kickoff
  - Achieve data quality score of 95% or above across all managed pipelines (completeness + accuracy + freshness)
  - Ship ML models with documented accuracy baselines and drift monitoring from day one
  - Provide self-service BI dashboards to all portfolio companies within 30 days of onboarding
  - Enforce data governance: 100% of PII data assets classified and access-controlled
  - Zero uncontrolled PII exposure — all sensitive fields encrypted, masked, or tokenised
  - Board approvals gate all data access requests involving PII or sensitive business data
tags:
  - data-engineering
  - machine-learning
  - business-intelligence
  - data-governance
  - analytics
  - etl
  - mlops
requirements:
  secrets:
    required:
      - GH_TOKEN
    optional:
      - OPENAI_API_KEY
      - SNOWFLAKE_ACCOUNT
      - SNOWFLAKE_USER
      - SNOWFLAKE_PASSWORD
      - DBT_PROFILES_DIR
      - AIRFLOW_API_KEY
      - DATADOG_API_KEY
      - MLFLOW_TRACKING_URI
      - SLACK_WEBHOOK_URL
---

DataVault Analytics is the data intelligence arm of the portfolio — it transforms raw, siloed data from every company into clean, governed, and analytically valuable assets. It delivers data pipelines, ML models, and BI dashboards that are consumed by AJ AI Services, CyberShield AI, APIConnect Services, and the other portfolio companies.

The company operates a data-first governance model: no data asset may be produced, shared, or used without a registered entry in the data catalogue. The Chief Data Officer (DataChief) owns the governance framework; DataGuard (Data Steward) enforces data classification and access controls.

## Org Model

DataChief (CDO) leads two functional pillars:
1. **Engineering Pillar** — PipelineBot (Data Engineer) + DataOpsBot (DataOps Engineer): data ingestion, transformation, and delivery
2. **Intelligence Pillar** — ModelForge (ML Engineer) + InsightCraft (BI Developer): predictive models and self-service analytics

DataGuard (Data Steward) reports directly to DataChief to ensure governance independence.

## Workflow

Work flows from portfolio company data requests through DataChief to functional leads:

1. **DataChief (CDO)** receives data platform goals from the board and data requests from portfolio CEOs; sets data governance policies and approves all cross-company data sharing
2. **DataGuard (Data Steward)** classifies all data assets, enforces retention policies, manages access requests, and is the mandatory approver for any task touching PII
3. **PipelineBot (Data Engineer)** designs and implements ELT pipelines: ingestion, transformation, data quality validation
4. **DataOpsBot (DataOps Engineer)** owns pipeline infrastructure: orchestration, monitoring, CI/CD for data pipelines, incident response for pipeline failures
5. **ModelForge (ML Engineer)** trains, evaluates, and deploys ML models; owns the MLflow experiment tracking and model registry
6. **InsightCraft (BI Developer)** builds self-service BI dashboards and semantic layers consumed by portfolio companies

## Data Security Principles

- All PII data assets are classified before ingestion begins — no unclassified PII in any pipeline
- Sensitive fields (names, emails, financial data) are encrypted at rest and masked in non-production environments
- Data access follows role-based access control — no agent has access to data beyond its operational scope
- Cross-company data sharing requires DataChief approval and a documented data sharing agreement
- Data retention: pipelines enforce client-specified retention periods; automated deletion jobs enforce expiry
