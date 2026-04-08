import { AuthUser } from '../types';

export const DEMO_USERS: { email: string; password: string; user: AuthUser }[] = [
  {
    email: 'admin@sgroup.vn',
    password: '123456',
    user: {
      id: '1',
      email: 'admin@sgroup.vn',
      name: 'Nguyễn Admin',
      role: 'admin',
      modules: ['exec', 'biz', 'mkt', 'agency', 'shomes', 'project', 'hr', 'finance', 'legal'],
    },
  },
  {
    email: 'hr@sgroup.vn',
    password: '123456',
    user: {
      id: '2',
      email: 'hr@sgroup.vn',
      name: 'Trần HR',
      role: 'hr',
      modules: ['hr'],
    },
  },
  {
    email: 'sales@sgroup.vn',
    password: '123456',
    user: {
      id: '3',
      email: 'sales@sgroup.vn',
      name: 'Lê Sales',
      role: 'employee',
      modules: ['biz', 'project'],
    },
  },
];
