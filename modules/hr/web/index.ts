// ═══════════════════════════════════════════════════════════
// @modules/hr — Public API
//
// This is the ONLY file that the web-shell imports from this module.
// Everything else is internal to the module.
//
// Usage in module-registry:
//   import { HRShell } from '@modules/hr';
// ═══════════════════════════════════════════════════════════

// ── Shell (entry points) ──
export { HRShell } from './HRShell';
export { HRSidebar } from './HRSidebar';

// ── Screens ──
export { HRDashboard } from './screens/HRDashboard';
export { StaffDirectoryScreen } from './screens/StaffDirectoryScreen';
export { EmployeeProfileScreen } from './screens/EmployeeProfileScreen';
export { LeavesScreen } from './screens/LeavesScreen';
export { PayrollScreen } from './screens/PayrollScreen';
export { TimekeepingScreen } from './screens/TimekeepingScreen';
export { PerformanceScreen } from './screens/PerformanceScreen';
export { RecruitmentScreen } from './screens/RecruitmentScreen';
export { OrgConfigScreen } from './screens/OrgConfigScreen';
export { BenefitsScreen } from './screens/BenefitsScreen';
export { TrainingScreen } from './screens/TrainingScreen';
export { PoliciesScreen } from './screens/PoliciesScreen';

// ── Components ──
export { EmployeeCard } from './components/EmployeeCard';
export { EmployeeFormModal } from './components/EmployeeFormModal';
export { EmployeeListView } from './components/EmployeeListView';
export { EmployeeGridView } from './components/EmployeeGridView';
export { EmployeeKanbanBoard } from './components/EmployeeKanbanBoard';
export { StaffStatsCard } from './components/StaffStatsCard';
export { HRErrorBoundary } from './components/ErrorBoundary';

// ── Hooks (re-export all granular hooks) ──
export * from './hooks/useHR';
export { useHRRoute } from './hooks/useHRRoute';

// ── API ──
export { hrApi } from './api/hrApi';

// ── Types ──
export type * from './types/index';
