---
name: Data catalogue setup and initial asset registration
assignee: data-steward
project: data-platform-foundation
---

## Objective

Stand up the data catalogue and register all existing data assets from portfolio companies.

## Acceptance Criteria

- [ ] Catalogue tool selected and deployed (options: DataHub, Amundsen, or lightweight YAML-based catalogue in git)
- [ ] Catalogue schema defined: asset name, owner company, classification, PII status, retention period, schema definition
- [ ] At least one asset registered per active portfolio company
- [ ] Classification levels documented: public, internal, confidential, restricted — with examples for each
- [ ] Access to the catalogue is authenticated — no anonymous read access for confidential/restricted entries
