import { AuthUser } from '../types';

export interface AuthProvider {
  login(email: string, password: string): Promise<{ user: AuthUser; token: string }>;
  logout(): Promise<void>;
}
