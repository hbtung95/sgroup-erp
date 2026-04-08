---
description: How to add a new shared UI component to @sgroup/ui package
---
// turbo-all

# /new-component {Name}

AGENT: NOVA (single agent, no handoff needed)

## Step 1 — Create files
```powershell
$name = "{Name}"
$base = "D:\SGROUP ERP\packages\ui\src\components\$name"
New-Item -ItemType Directory -Force -Path $base
New-Item -Force "$base\$name.tsx","$base\types.ts","$base\index.ts"
```

## Step 2 — Implement component
Use design tokens from shared/design-tokens.md. **Neo-Corporate Premium (Light mode DEFAULT).**

Card:  `bg-white/70 border border-[--border-subtle] rounded-xl shadow-soft backdrop-blur-sm`
Hover: `hover:border-indigo-500/30 hover:shadow-md transition-all duration-200`
Focus: `focus-visible:ring-2 focus-visible:ring-indigo-500`

Dark mode support via `.dark` class (optional, NOT default):
Dark Card: `dark:bg-slate-900/60 dark:border-slate-700/50`

MUST use:
- `cn()` for className merging
- CSS variables for colors (`--bg-primary`, `--text-primary`)
- `focus-visible` on all interactive elements
- `prefers-reduced-motion` for animations

## Step 3 — Export from package
Add to `packages/ui/src/index.ts`

## Step 4 — Build verify
```powershell
cd "D:\SGROUP ERP" ; npx turbo run build --filter=@sgroup/ui
```
