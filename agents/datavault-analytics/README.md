# DataVault Analytics

> Turn raw data into strategic advantage — governed data pipelines, ML models, and BI dashboards for the entire portfolio.

## Mission

DataVault Analytics delivers production-grade data infrastructure to the portfolio companies. Every pipeline ships with data quality tests, every model ships with accuracy baselines and drift monitoring, and every dashboard ships with documented data lineage.

## Org Chart

| Agent | Name | Role | Reports To |
|-------|------|------|-----------|
| `cdo` | DataChief | Chief Data Officer | Board |
| `data-steward` | DataGuard | Data Steward | CDO |
| `data-engineer` | PipelineBot | Data Engineer | CDO |
| `dataops-engineer` | DataOpsBot | DataOps Engineer | CDO |
| `ml-engineer` | ModelForge | ML Engineer | CDO |
| `bi-developer` | InsightCraft | BI Developer | CDO |

## Getting Started

Import this company package into a Paperclip instance:

```bash
paperclipai companies import ./agents/datavault-analytics
```

Required secrets: `GH_TOKEN`

Optional secrets: `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, `SNOWFLAKE_PASSWORD`, `MLFLOW_TRACKING_URI`, `DATADOG_API_KEY`, `AIRFLOW_API_KEY`

See [paperclipai/paperclip](https://github.com/paperclipai/paperclip) for full setup documentation.

## Core Projects

- **Data Platform Foundation** — Pipeline infrastructure, data catalogue, governance framework
