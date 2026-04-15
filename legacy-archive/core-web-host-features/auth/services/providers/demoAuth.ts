import { AuthProvider } from '../authProvider';
import { DEMO_USERS } from '../../mocks/demoUsers';

export const demoAuthProvider: AuthProvider = {
  async login(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 800));
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error('Email hoặc mật khẩu không đúng');
    return { user: found.user, token: 'demo-token-' + found.user.id };
  },
  async logout() {
    await new Promise((r) => setTimeout(r, 300));
  },
};
