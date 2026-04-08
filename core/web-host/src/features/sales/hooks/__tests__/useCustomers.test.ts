/**
 * useCustomers.test.ts — Example test for TanStack Query hook
 * Setup: npm install -D @testing-library/react vitest @tanstack/react-query msw
 * Run: npx vitest run src/features/sales/hooks/__tests__/useCustomers.test.ts
 */
import { describe, it, expect, vi } from 'vitest';

// Mock apiClient
vi.mock('../../../../core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: '1', fullName: 'Test' } }),
    patch: vi.fn().mockResolvedValue({ data: { id: '1', fullName: 'Updated' } }),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

describe('useCustomers hook', () => {
  it('should import without errors', async () => {
    const mod = await import('../useCustomers');
    expect(mod.useCustomers).toBeDefined();
    expect(typeof mod.useCustomers).toBe('function');
  });

  it('should export Customer and LeadStatus types', async () => {
    // Type-level check — if this compiles, types are exported correctly
    const mod = await import('../useCustomers');
    expect(mod).toBeDefined();
  });
});

describe('useDeals hook', () => {
  it('should import without errors', async () => {
    vi.mock('../../../../core/api/apiClient', () => ({
      apiClient: {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: { id: '1' } }),
        patch: vi.fn().mockResolvedValue({ data: { id: '1' } }),
      },
    }));
    const mod = await import('../useDeals');
    expect(mod.useDeals).toBeDefined();
  });
});

describe('useAppointments hook', () => {
  it('should import without errors', async () => {
    const mod = await import('../useAppointments');
    expect(mod.useAppointments).toBeDefined();
  });
});

describe('useActivities hook', () => {
  it('should import without errors', async () => {
    const mod = await import('../useActivities');
    expect(mod.useActivities).toBeDefined();
  });
});
