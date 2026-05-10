---
name: Complete data classification audit across all portfolio sources
assignee: data-steward
project: data-platform-foundation
---

## Objective

Audit and classify every data asset in the portfolio before new pipelines begin ingesting production data.

## Acceptance Criteria

- [ ] All known data sources from portfolio companies inventoried (AJ AI Services, CloudOps Pro, Support Genius, CyberShield AI, DevLaunch Studio, APIConnect Services)
- [ ] Each data asset classified: public, internal, confidential, or restricted
- [ ] PII fields identified and documented in the PII inventory
- [ ] Classification decisions reviewed and approved by DataChief
- [ ] Any unclassified asset is blocked from production pipeline ingestion until classified
