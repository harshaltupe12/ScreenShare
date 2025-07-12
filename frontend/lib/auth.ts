interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  name: string;
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
    };
    aiVoiceEnabled: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadTokensFromStorage();
    this.setupTokenRefresh();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedTokens = localStorage.getItem('jerry_tokens');
      const storedUser = localStorage.getItem('jerry_user');

      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }

      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuth();
    }
  }

  // Save tokens to localStorage
  private saveTokensToStorage(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('jerry_tokens', JSON.stringify(tokens));
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  // Save user to localStorage
  private saveUserToStorage(user: User): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('jerry_user', JSON.stringify(user));
      this.user = user;
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  // Clear all auth data
  private clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('jerry_tokens');
    localStorage.removeItem('jerry_user');
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  // Setup automatic token refresh
  private setupTokenRefresh(): void {
    if (!this.accessToken) return;

    try {
      const decoded = this.decodeToken(this.accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        
        // Refresh token 5 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
        
        this.tokenRefreshTimeout = setTimeout(() => {
          this.refreshAccessToken();
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }

  // Decode JWT token without verification
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // Make authenticated API request
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${endpoint}`;
      
      const headers = {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...(options.headers || {}),
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // If token is expired, try to refresh
        if (response.status === 401 && this.refreshToken) {
          const refreshResult = await this.refreshAccessToken();
          if (refreshResult.success) {
            // Retry the original request with new token
            return this.makeAuthenticatedRequest(endpoint, options);
          } else {
            // Refresh failed, user needs to login again
            this.logout();
            return {
              success: false,
              error: 'Session expired. Please login again.',
              code: 'SESSION_EXPIRED'
            };
          }
        }

        return {
          success: false,
          error: data.error || 'Request failed',
          code: data.code
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  // Register new user
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/register`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
          code: data.code
        };
      }

      // Save tokens and user data
      this.saveTokensToStorage(data.tokens);
      this.saveUserToStorage(data.user);
      this.setupTokenRefresh();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Login user
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
          code: data.code
        };
      }

      // Save tokens and user data
      this.saveTokensToStorage(data.tokens);
      this.saveUserToStorage(data.user);
      this.setupTokenRefresh();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    if (!this.refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      };
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/refresh-token`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Token refresh failed',
          code: data.code
        };
      }

      // Save new tokens
      this.saveTokensToStorage(data.tokens);
      this.setupTokenRefresh();

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  // Logout user
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      if (this.accessToken) {
        await this.makeAuthenticatedRequest('/api/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuth();
    }

    return {
      success: true,
      data: { message: 'Logout successful' }
    };
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.makeAuthenticatedRequest('/api/auth/profile');
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User; message: string }>> {
    return this.makeAuthenticatedRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Change password
  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> {
    return this.makeAuthenticatedRequest('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    });
  }

  // Verify token
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    if (!this.accessToken) {
      return {
        success: true,
        data: { valid: false }
      };
    }

    return this.makeAuthenticatedRequest('/api/auth/verify-token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.user);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    if (!this.accessToken) return true;

    try {
      const decoded = this.decodeToken(this.accessToken);
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      return true;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export type { User, AuthTokens, AuthResponse, ApiResponse }; 