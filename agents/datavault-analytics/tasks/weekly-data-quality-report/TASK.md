---
name: Weekly Data Quality Report
assignee: data-steward
recurring: true
project: data-platform-foundation
---

Deliver the weekly data quality scorecard covering all production pipelines.

## Checklist

1. Pull dbt test results for all pipelines from the past 7 days
2. Calculate per-pipeline data quality scores: completeness percentage, uniqueness percentage, freshness compliance percentage, schema validity percentage
3. Identify pipelines with quality score below 95% — these require root cause analysis
4. Check PII masking compliance: run automated scan to verify no unmasked PII in non-production environments
5. Review retention policy compliance: any data assets exceeding their retention date?
6. For retention violations: create a DataOpsBot task for immediate deletion
7. Post quality scorecard as task comment with all metrics and a GREEN/YELLOW/RED status per pipeline
8. Flag any RED pipelines to DataChief for prioritisation

## Output

Data quality scorecard: per-pipeline quality score, overall platform score, PII compliance status, retention compliance status.
