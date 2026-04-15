// ═══════════════════════════════════════════════════════════
// Module Registry — Type Definitions
// Each vertical module exports a ModuleConfig that the shell
// uses to render routes, sidebar, and error boundaries.
// ═══════════════════════════════════════════════════════════

import type { ComponentType, LazyExoticComponent } from 'react';
import type { ActiveAppModuleId } from '@sgroup/platform';

/** Navigation item rendered in the module's sidebar */
export interface ModuleSidebarItem {
  readonly key: string;
  readonly label: string;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  readonly section: string;
}

/**
 * Configuration contract every feature module must implement.
 *
 * The shell uses this to:
 *  1. Register routes with per-module Error Boundaries
 *  2. Render the Workspace module-picker tiles
 *  3. Gate access based on user roles
 */
export interface ModuleConfig {
  /** Unique module identifier (e.g. 'hr', 'project', 'sales') */
  readonly id: ActiveAppModuleId;
  /** Display name shown in workspace and error fallbacks */
  readonly name: string;
  /** Short description for workspace tile */
  readonly description: string;
  /** Lucide icon component */
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  /** Route prefix (must start with '/') */
  readonly basePath: string;
  /** The module's root shell component — lazy-loaded */
  readonly Shell: LazyExoticComponent<ComponentType>;
  /** Roles allowed to access this module (empty = all roles) */
  readonly requiredRoles: string[];
  /** Accent color CSS class for the workspace tile */
  readonly accentColor: string;
}
