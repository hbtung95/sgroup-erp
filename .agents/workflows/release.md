---
description: How to release and deploy to production
---

# /release {version}

AGENT FLOW: Javis (verify) → Atlas (deploy) → Quinn (smoke test)

## Step 1 — JAVIS: Pre-release checklist
- [ ] All PRs merged, code freeze
- [ ] `cd "D:\SGROUP ERP" ; npx turbo run build` passes
- [ ] All tests passing (frontend + backend)
- [ ] Migrations reviewed (no destructive changes)
- [ ] Rollback plan documented (see sop/environment-management.md)
- [ ] i18n: en.json + vi.json complete
- [ ] Financial calculations verified on staging
- [ ] Chairman approval obtained

## Step 2 — ATLAS: Tag + deploy
```powershell
cd "D:\SGROUP ERP"
git tag -a v{version} -m "Release {version}"
git push origin v{version}
```
Frontend: Push main → Vercel auto-deploys.
Backend: GitHub Actions → Docker build per module → Viettel IDC deploy.

## Step 3 — QUINN: Smoke test
Run E2E: Login → Dashboard → Booking flow → Commission view → BDH Dashboard.

## Step 4 — Monitor 1h
Stable → close release.
Issue → rollback per sop/environment-management.md (< 5 min).
