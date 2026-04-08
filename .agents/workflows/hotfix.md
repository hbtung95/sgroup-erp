---
description: How to deploy an emergency hotfix to production
---

# /hotfix {description}

AGENT FLOW: Javis → Domain Agent → Quinn (regression) → Atlas
SLA: Fix deployed within 30 minutes.

## Step 1 — JAVIS: Classify + route
Identify affected domain + agent. P0 priority.

## Step 2 — DOMAIN AGENT: Minimal fix
```powershell
cd "D:\SGROUP ERP"
git checkout main ; git pull origin main
git checkout -b hotfix/{agent}-{description}
```
Fix the specific bug. MAX 50 lines. NO refactoring. NO features.
Write regression test. Self-check per AGENT.md checklist.

## Step 3 — QUINN: Regression test
Run existing tests to ensure no regression:
```powershell
cd "D:\SGROUP ERP"
npx vitest run
```
If backend was changed:
```powershell
cd "D:\SGROUP ERP\modules\{affected-module}\api"
go test ./... -race -count=1
```

## Step 4 — ATLAS: Build + deploy
```powershell
cd "D:\SGROUP ERP"
npx turbo run build
git checkout main ; git merge hotfix/{agent}-{description}
git push origin main
```

## Step 5 — Monitor 30 min
Stable → close. Regression → `git revert HEAD ; git push`.

## Step 6 — Post-mortem (if SEV1/SEV2)
Use templates/post-mortem.md. Blameless. Action items with owner + deadline.
