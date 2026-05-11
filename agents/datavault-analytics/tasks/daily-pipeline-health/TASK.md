---
name: Daily Pipeline Health Check
assignee: dataops-engineer
recurring: true
project: data-platform-foundation
---

Run the daily pipeline health check for all active data pipelines.

## Checklist

1. Check Airflow DAG run statuses from the past 24 hours: any failures, long-running tasks, or missed schedules?
2. Verify data freshness SLAs: all pipelines delivered data within their SLA window (e.g. daily pipelines fresher than 25 hours)
3. Check data quality test results: any dbt test failures in the past 24 hours?
4. Review warehouse resource utilisation: any queries consuming excessive compute (top 5 by cost)?
5. Check model serving health: all deployed ML inference endpoints responding within SLA?
6. Post health summary as task comment: GREEN (all clear), YELLOW (degraded, non-critical), RED (pipeline down, SLA breach)
7. For any RED status: create an incident task immediately and assign to the affected pipeline owner

## Output

Health summary comment with: pipeline run count, failure count, SLA compliance percentage, data quality test pass rate, model endpoint status.
