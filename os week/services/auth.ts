/// <reference types="vite/client" />

const API_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:4001';

export interface AuthUser {
  id: string | number;
  email: string;
  username: string;
}

export interface AuthToken {
  token: string;
  user: AuthUser;
}

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken) {
      this.token = storedToken;
    }
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  private saveToStorage(token: string, user: AuthUser) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  public clearStorage() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.token = null;
    this.user = null;
  }

  async register(email: string, username: string, password: string): Promise<AuthToken> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    this.saveToStorage(data.token, data.user);
    return data;
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    this.saveToStorage(data.token, data.user);
    return data;
  }

  logout() {
    this.clearStorage();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getAuthHeader(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }
}

export const authService = new AuthService();

export default authService;
