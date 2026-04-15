// ═══════════════════════════════════════════════════════════
// @modules/project — Public API
//
// This is the ONLY file that the web-shell imports from this module.
// Everything else is internal to the module.
//
// Usage in module-registry:
//   import { ProjectShell } from '@modules/project';
// ═══════════════════════════════════════════════════════════

// ── Shell (entry points) ──
export { ProjectShell } from './ProjectShell';
export { ProjectSidebar } from './components/ProjectSidebar';

// ── Screens ──
export { ProjectDashboardScreen } from './screens/ProjectDashboardScreen';
export { ProjectListScreen } from './screens/ProjectListScreen';
export { SingleProjectHub } from './screens/SingleProjectHub';
export { InventoryGrid } from './screens/InventoryGrid';
export { LegalKanbanScreen } from './screens/LegalKanbanScreen';
export { ReportsScreen } from './screens/ReportsScreen';

// ── Components ──
export { ProjectFormModal } from './components/ProjectFormModal';

// ── Inventory sub-components ──
export { UnitDrawer } from './components/inventory/UnitDrawer';
export { UnitGridView } from './components/inventory/UnitGridView';
export { InventoryFilter } from './components/inventory/InventoryFilter';
export { FloorPlanView } from './components/inventory/FloorPlanView';
export { LockModal } from './components/inventory/LockModal';
export { BulkActionBar } from './components/inventory/BulkActionBar';

// ── Hub sub-components ──
export { ProjectDetails } from './components/hub/ProjectDetails';
export { ProjectHero } from './components/hub/ProjectHero';
export { ProjectManager } from './components/hub/ProjectManager';
export { ProjectStats } from './components/hub/ProjectStats';

// ── Hooks ──
export { useProjects } from './hooks/useProjects';

// ── API ──
export * from './api/projectApi';
export * from './api/projectMocks';

// ── Types ──
export type * from './types';
