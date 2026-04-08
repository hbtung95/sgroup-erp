export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'employee';
  modules: string[];
  salesRole?: string;
  department?: string;
  teamId?: string;
  teamName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
