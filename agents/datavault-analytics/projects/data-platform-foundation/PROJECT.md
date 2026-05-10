---
name: Data Platform Foundation
description: Stand up the core data platform infrastructure — catalogue, pipelines, governance framework, and BI layer — before DataVault onboards its first portfolio company data source.
slug: data-platform-foundation
owner: cdo
---

The Data Platform Foundation project delivers all foundational capabilities required before DataVault Analytics can service portfolio companies. Every task is a prerequisite for production data ingestion.

## Deliverables

1. Data catalogue: registered, classified data asset registry
2. Pipeline CI/CD: automated test and promotion pipeline for dbt models and Airflow DAGs
3. Data classification audit: all existing data assets classified before new pipelines begin
4. PII inventory: complete register of all PII fields across all portfolio data sources
5. BI foundation: dashboard setup with row-level security and portfolio access controls

## Success Criteria

- Data catalogue live with at least 1 registered asset per portfolio company
- CI/CD pipeline running on every dbt model PR
- 100% of data assets classified (public/internal/confidential/restricted)
- PII inventory complete and reviewed by DataChief
- At least one portfolio company with a live self-service BI dashboard
