import { AuthProvider } from '../authProvider';
import { apiFetch } from '../../../../core/api/api';
import { AuthUser } from '../../types';

/** Real API authentication — calls NestJS backend */
export const apiAuthProvider: AuthProvider = {
  async login(email: string, password: string) {
    const res = await apiFetch<{
      success: boolean;
      data: {
        access_token: string;
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
          salesRole?: string;
          department?: string;
          teamId?: string;
          teamName?: string;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.success) throw new Error('Email hoặc mật khẩu không đúng');

    const u = res.data.user;
    const user: AuthUser = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: (u.role as AuthUser['role']) || 'employee',
      modules: u.role === 'admin'
        ? ['exec', 'biz', 'mkt', 'agency', 'shomes', 'project', 'hr', 'finance', 'legal']
        : ['biz', 'project'],
      salesRole: u.salesRole,
      department: u.department,
      teamId: u.teamId,
      teamName: u.teamName,
    };

    return { user, token: res.data.access_token };
  },
  async logout() {
    // Backend doesn't have a logout endpoint yet; just clear token client-side
  },
};
