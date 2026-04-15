// ═══════════════════════════════════════════════════════════
// Module Registry — Registration
// Central list of all available feature modules.
//
// Each module exports a Shell component via its index.ts barrel.
// The shell uses lazy() to code-split each module into its own chunk.
// ═══════════════════════════════════════════════════════════

import { lazy } from 'react';
import { Users, Briefcase, TrendingUp } from 'lucide-react';
import {
  ACTIVE_APP_MODULE_IDS,
  getAppModuleById,
  type ActiveAppModuleId,
} from '@sgroup/platform';
import type { ModuleConfig } from './types';

/**
 * Icon mapping per module.
 */
const moduleIcons: Record<ActiveAppModuleId, ModuleConfig['icon']> = {
  hr: Users,
  project: Briefcase,
  sales: TrendingUp,
};

/**
 * Gradient accent per module — used in workspace tiles and headers.
 */
const moduleAccents: Record<ActiveAppModuleId, string> = {
  hr: 'from-sg-red to-sg-red-dark',
  project: 'from-cyan-500 to-blue-600',
  sales: 'from-emerald-500 to-teal-600',
};

/**
 * Lazy-loaded Shell components.
 *
 * Each module's `index.ts` barrel exports a `{Module}Shell` component.
 * This is the ONLY import path from web-shell into a module.
 */
const moduleShells: Record<ActiveAppModuleId, ModuleConfig['Shell']> = {
  hr: lazy(() =>
    import('@modules/hr').then((m) => ({ default: m.HRShell })),
  ),
  project: lazy(() =>
    import('@modules/project').then((m) => ({ default: m.ProjectShell })),
  ),
  sales: lazy(() =>
    import('@modules/sales').then((m) => ({ default: m.SalesShell })),
  ),
};

/**
 * All registered modules.
 * Order here determines display order in the Workspace screen.
 */
export const registeredModules: readonly ModuleConfig[] = ACTIVE_APP_MODULE_IDS.map((moduleId) => {
  const moduleDefinition = getAppModuleById(moduleId);

  if (!moduleDefinition?.basePath) {
    throw new Error(`Missing module shell configuration for ${moduleId}`);
  }

  return {
    id: moduleId,
    name: moduleDefinition.name,
    description: moduleDefinition.description,
    icon: moduleIcons[moduleId],
    basePath: moduleDefinition.basePath,
    Shell: moduleShells[moduleId],
    requiredRoles: [...(moduleDefinition.requiredRoles ?? [])],
    accentColor: moduleAccents[moduleId],
  };
});

/** Lookup a module config by its id */
export function getModuleById(id: string): ModuleConfig | undefined {
  return registeredModules.find(m => m.id === id);
}
