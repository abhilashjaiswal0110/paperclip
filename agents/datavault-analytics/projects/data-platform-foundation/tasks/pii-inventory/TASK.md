---
name: PII inventory — complete register of all personally identifiable fields
assignee: data-steward
project: data-platform-foundation
---

## Objective

Build the complete PII inventory covering all data sources from portfolio companies. This is a mandatory prerequisite before any pipeline ingesting personal data enters production.

## Acceptance Criteria

- [ ] Every data source scanned for PII fields: names, email addresses, phone numbers, IP addresses, device IDs, financial data, health data
- [ ] Each PII field documented: table, column, data type, PII category (direct identifier, quasi-identifier, sensitive attribute), retention period, masking strategy
- [ ] Masking strategy defined for each PII field: encryption, pseudonymisation, tokenisation, or aggregation
- [ ] Inventory reviewed and signed off by DataChief
- [ ] Inventory registered in the data catalogue with classification: restricted access
- [ ] Non-production environments confirmed to use masked or synthetic data only
