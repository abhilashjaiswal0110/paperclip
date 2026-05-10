---
name: LinkedIn Analytics API integration
assignee: cto
project: analytics-dashboard
---

## Objective

Integrate the LinkedIn Analytics API to enable automated performance data ingestion for all published posts.

## Acceptance Criteria

- [ ] OAuth 2.0 flow documented; `LINKEDIN_API_KEY` stored as Paperclip secret (not plain text)
- [ ] API client reads impressions, clicks, engagement, follower delta per post
- [ ] Rate limit handling: exponential backoff on 429 responses
- [ ] Graceful degradation: when API is unavailable, AnalyticsEngine outputs a clearly labelled "data unavailable" digest
- [ ] No raw API responses persisted to disk; process in-memory only
- [ ] Integration test with mock API responses to validate parsing logic

## Security Requirements

- [ ] API key accessed via environment injection only — never logged, never echoed to stdout
- [ ] Request scope: read-only analytics endpoints only (no write or publish scopes)
- [ ] API errors logged with status code only — no auth token fragments in logs
