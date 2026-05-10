---
name: Automated weekly analytics digest delivery
assignee: analytics-engine
project: analytics-dashboard
---

## Objective

Automate the Monday morning analytics digest so SocialSage and the CEO receive actionable performance data at the start of every week.

## Acceptance Criteria

- [ ] Digest delivered every Monday by 09:00 IST via Paperclip task comment
- [ ] Content: top/bottom 3 posts, engagement rate trend, follower growth, active A/B test status
- [ ] Recommendations section: 2-3 data-backed content suggestions for the coming week
- [ ] Anomaly flag: any post with engagement rate more than 3x or less than 0.3x the 30-day average is called out explicitly
- [ ] Digest @-mentions SocialSage, IdeaSpark, and AJ (CEO)
- [ ] Routine registered in `.paperclip.yaml` on the `analytics-engine` routine schedule
