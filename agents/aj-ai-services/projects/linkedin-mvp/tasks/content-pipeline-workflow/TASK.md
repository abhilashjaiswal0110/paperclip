---
name: Content pipeline end-to-end workflow integration
assignee: social-media-manager
project: linkedin-mvp
---

## Objective

Wire the five-stage content pipeline so every post flows through a governed, sequential handoff chain from brief to publish. No post bypasses EthicsWatch before PublishBot distributes it.

## Pipeline Stages

```
SocialSage (Brief) → IdeaSpark (Ideas) → DesignPro (Assets) → EthicsWatch (Review) → PublishBot (Publish)
```

## Acceptance Criteria

- [ ] SocialSage creates a campaign brief issue as a parent task; all pipeline stages are child issues under it
- [ ] IdeaSpark is assigned the ideation child task and comments back a structured idea package (topic, hook, format, hashtags)
- [ ] DesignPro is assigned the design child task and delivers visual asset specs as a task comment
- [ ] EthicsWatch is assigned the review child task and posts a binary pass/fail decision with checklist
- [ ] PublishBot is assigned the publish child task only after EthicsWatch marks review as done
- [ ] PublishBot posts publishing confirmation with platform, timestamp, and initial metrics link
- [ ] All five child tasks link to the parent campaign brief task via `#identifier` syntax

## Security Gate

- EthicsWatch review is a **hard gate** — PublishBot must not be assigned until review status is `done`
- If EthicsWatch marks `blocked`, the pipeline pauses; SocialSage must resolve before unblocking
- No shortcuts: do not bypass the ethics gate under time pressure
