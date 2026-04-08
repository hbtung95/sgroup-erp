# KB: Module Placement — Correct Directory Structure

**Date Logged**: 2026-04-08
**Context**: SGROUP ERP Monorepo Vertical Slice Architecture.

## The Bug
Agent placed feature modules inside `core/web-host/src/features/`, creating a monolith. 
The correct placement is `modules/{name}/web/src/` — each module as an independent NPM workspace package (`@sgroup/{name}`).

## The Rules (Permanent)
1. **`core/web-host/`** is ONLY for: App Router, Layouts, Error Boundaries, Auth/Portal pages. Nothing else.
2. **`packages/ui/`** is for shared horizontal layers: `@sgroup/ui` (design system components, theme, utils).
3. **`modules/{name}/web/`** is where ALL domain feature code lives. Each module MUST have its own `package.json` with name `@sgroup/{name}`.
4. **`modules/{name}/api/`** is for Go microservice code, each with its own `go.mod`.
5. **`modules/{name}/app/`** is for React Native module-specific mobile screens.
6. **App.tsx imports** must use workspace package names: `import { X } from '@sgroup/module-name'`, NEVER `./features/`.

## Evidence
```json
// package.json workspaces prove the architecture:
"workspaces": [
    "core/*",              // Shell + Gateway
    "modules/*/web",       // Feature module frontends HERE
    "modules/*/app",       // Feature module mobile apps
    "packages/*"           // Shared packages (@sgroup/ui, go-common)
]
```

## Pre-Flight Check
Before writing ANY frontend feature file, verify: "Am I writing into `modules/{name}/web/src/`?" If not, STOP.
Before writing ANY backend file, verify: "Am I writing into `modules/{name}/api/`?" If not, STOP.
