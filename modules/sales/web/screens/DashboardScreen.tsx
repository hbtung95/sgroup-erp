import React from 'react';
import { useSalesRole } from '../components/shared/RoleContext';
import { StaffDashboard } from './dashboards/StaffDashboard';
import { ManagerDashboard } from './dashboards/ManagerDashboard';
import { DirectorDashboard } from './dashboards/DirectorDashboard';

// ═══════════════════════════════════════════════════════════
// DASHBOARD SCREEN — Role-Based Router
// Neo-Glassmorphism v2.2
// ═══════════════════════════════════════════════════════════

export function DashboardScreen() {
  const { role } = useSalesRole();

  if (role === 'sales_staff') return <StaffDashboard />;
  if (role === 'sales_manager') return <ManagerDashboard />;
  
  return <DirectorDashboard />;
}
