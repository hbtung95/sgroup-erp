# SGROUP ERP UI Flow Matrix

## Scope

This matrix reflects the new shared UI architecture for all business modules:

- Sales (`biz`)
- Marketing (`mkt`)
- HR (`hr`)
- Agency (`agency`)
- S-Homes (`shomes`)
- Project (`project`)
- Finance (`finance`)
- Legal (`legal`)

Each module now uses the same flow structure and layout system.

## Shared Layout Layers

1. Module top bar: back navigation + module context + primary action.
2. KPI layer: 4 headline KPI cards per module.
3. Flow switcher: tabbed business flows.
4. Flow summary layer: per-flow summary cards.
5. Main work area:
   - left: operation table
   - right: focus cards + activity timeline

## Standard Business Flows (Per Module)

1. `overview`
   - module overview, bottlenecks, top priorities
2. `operations`
   - active queue, SLA, execution tracking
3. `approval`
   - pending approvals, escalations, control points
4. `reporting`
   - report generation, variance, forecast confidence
5. `settings`
   - policy/rules/workflow configuration and governance

## Reusable Engine

Core files:

- `src/features/workspace/moduleHub/types.ts`
- `src/features/workspace/moduleHub/moduleConfigs.ts`
- `src/features/workspace/moduleHub/ModuleBusinessScreen.tsx`

Module screens now act as wrappers:

- `src/features/sales/screens/SalesScreen.tsx`
- `src/features/marketing/screens/MarketingScreen.tsx`
- `src/features/hr/screens/HRScreen.tsx`
- `src/features/agency/screens/AgencyScreen.tsx`
- `src/features/shomes/screens/SHomesScreen.tsx`
- `src/features/project/screens/ProjectScreen.tsx`
- `src/features/finance/screens/FinanceScreen.tsx`
- `src/features/legal/screens/LegalScreen.tsx`

## Next Expansion

If you want each flow to become separate route-level pages (instead of in-page tabs),
we can split `overview/operations/approval/reporting/settings` into dedicated navigation routes
without changing the UI component architecture.
