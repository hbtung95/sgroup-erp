// ═══════════════════════════════════════════════════════════
// ERP MOCK BFF — Centralized Data Hub
// Acts as a simulated API Gateway/BFF that aggregates mock data 
// from independent modules to prevent cross-module frontend coupling.
// ═══════════════════════════════════════════════════════════

import { mockHRData } from '../../../../modules/hr/web/api/hrMocks';
import { MOCK_RE_PROJECTS, MOCK_RE_PRODUCTS } from '../../../../modules/project/web/hooks/useProjects';

// Simulated central cache for all modules to consume
export const erpMockBFF = {
  hr: {
    teams: mockHRData.getTeams.data,
    employees: mockHRData.getEmployees.data,
  },
  project: {
    projects: MOCK_RE_PROJECTS,
    products: MOCK_RE_PRODUCTS,
  }
};
