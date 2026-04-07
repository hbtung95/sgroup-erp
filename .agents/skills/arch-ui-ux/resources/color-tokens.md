# SGDS Color Token Reference

> Source: `src/shared/theme/theme.ts`
> Access: `const colors = useTheme();`

## Palette (Raw Colors)

| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | — |
| `black` | `#000000` | — |
| `gray50` | `#F8FAFC` | Lightest neutral |
| `gray100` | `#F1F5F9` | Light bg |
| `gray200` | `#E2E8F0` | Dividers (light) |
| `gray300` | `#CBD5E1` | Disabled (light) |
| `gray400` | `#94A3B8` | Muted text (dark) |
| `gray500` | `#64748B` | Placeholder text |
| `gray600` | `#475569` | Secondary text (light) |
| `gray700` | `#334155` | — |
| `gray800` | `#1E293B` | — |
| `gray900` | `#0F172A` | Dark text (light theme) |
| `brand500` | `#3B82F6` | Base blue |
| `accentBlue` | `#0ea5e9` | ★ Primary brand |
| `accentCyan` | `#06b6d4` | Cyan accent |
| `accentIndigo` | `#6366f1` | Indigo |
| `accentPurple` | `#a855f7` | Purple |
| `green400` | `#22C55E` | Success |
| `red400` | `#EF4444` | Danger |
| `orange400` | `#EAB308` | Warning |
| `darkDeep` | `#080a0f` | App background (dark) |

## Dark Theme Tokens

| Token | Value | CSS Var |
|---|---|---|
| `bg` | `#080a0f` | `--sg-bg-base` |
| `bgSecondary` | `rgba(20,24,35,0.6)` | `--sg-bg-glass` |
| `bgTertiary` | `rgba(28,32,45,0.8)` | `--sg-bg-glass-heavy` |
| `bgCard` | `rgba(255,255,255,0.04)` | — |
| `bgCardHover` | `rgba(35,40,55,0.7)` | `--sg-bg-glass-hover` |
| `bgInput` | `rgba(255,255,255,0.06)` | — |
| `bgOverlay` | `rgba(0,0,0,0.4)` | `--sg-bg-overlay` |
| `bgElevated` | `rgba(28,32,45,0.9)` | — |
| `bgGlow` | `rgba(14,165,233,0.06)` | — |
| `text` | `#FFFFFF` | `--sg-text-primary` |
| `textSecondary` | `#94A3B8` | `--sg-text-secondary` |
| `textTertiary` | `#64748B` | `--sg-text-tertiary` |
| `textDisabled` | `#475569` | `--sg-text-disabled` |
| `border` | `rgba(255,255,255,0.08)` | `--sg-border-subtle` |
| `borderStrong` | `rgba(255,255,255,0.15)` | `--sg-border-strong` |
| `borderFocus` | `#0ea5e9` | — |
| `brand` | `#0ea5e9` | `--sg-accent-blue` |
| `brandLight` | `#38bdf8` | — |
| `glass` | `rgba(20,24,35,0.6)` | — |
| `glassHeavy` | `rgba(28,32,45,0.8)` | — |
| `glassBorder` | `rgba(255,255,255,0.08)` | — |
| `success` | `#22C55E` | `--sg-status-success` |
| `successBg` | `rgba(34,197,94,0.12)` | — |
| `warning` | `#EAB308` | `--sg-status-warning` |
| `warningBg` | `rgba(234,179,8,0.12)` | — |
| `danger` | `#EF4444` | `--sg-status-danger` |
| `dangerBg` | `rgba(239,68,68,0.12)` | — |
| `shadow` | `rgba(0,0,0,0.4)` | — |
| `shadowGlow` | `rgba(14,165,233,0.25)` | — |

## Light Theme Tokens

| Token | Value |
|---|---|
| `bg` | `#f8fafc` |
| `bgSecondary` | `rgba(255,255,255,0.7)` |
| `bgCard` | `#FFFFFF` |
| `bgInput` | `#F1F5F9` |
| `text` | `#0f172a` |
| `textSecondary` | `#475569` |
| `textTertiary` | `#94a3b8` |
| `border` | `rgba(0,0,0,0.06)` |
| `borderStrong` | `rgba(0,0,0,0.12)` |
| `brand` | `#0284c7` |
| `glass` | `rgba(255,255,255,0.7)` |
| `glassBorder` | `rgba(0,0,0,0.06)` |
| `success` | `#16a34a` |
| `warning` | `#d97706` |
| `danger` | `#dc2626` |

## Gradients

| Token | Dark | Light |
|---|---|---|
| `gradientBrand` | `#0ea5e9 → #06b6d4` | `#0ea5e9 → #06b6d4` |
| `gradientGold` | `#F59E0B → #FBBF24` | `#D97706 → #F59E0B` |
| `gradientSuccess` | `#22c55e → #4ade80` | `#16a34a → #22c55e` |
| `gradientDanger` | `#ef4444 → #f87171` | `#dc2626 → #ef4444` |
| `gradientPurple` | `#6366f1 → #a855f7` | `#7c3aed → #a855f7` |

## Aurora Colors

| Index | Dark | Light |
|---|---|---|
| 0 | `rgba(14,165,233,0.15)` | `rgba(14,165,233,0.08)` |
| 1 | `rgba(99,102,241,0.15)` | `rgba(99,102,241,0.06)` |
| 2 | `rgba(6,182,212,0.1)` | `rgba(6,182,212,0.05)` |
