import { api } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function login(email: string, password: string) {
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function register(name: string, email: string, password: string) {
  return api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export function adminLogin(email: string, password: string) {
  return api<AuthResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function getMe() {
  return api<{ user: AuthUser }>('/api/auth/me');
}
