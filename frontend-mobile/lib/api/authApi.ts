import type { User } from './types';
import { apiPostJson } from './client';

export type LoginResponse = { token: string; user: User };

export function loginRequest(email: string, password: string) {
  return apiPostJson<LoginResponse>('/login', { email, password });
}

export function registerRequest(username: string, email: string, password: string) {
  return apiPostJson<unknown>('/register', { username, email, password });
}
