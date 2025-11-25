import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  phone?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  lastLogin?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${API_URL}/refresh-token`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        }
      );

      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        return accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      return null;
    }
  }
};
