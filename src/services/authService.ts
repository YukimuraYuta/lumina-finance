import apiClient from './api'
import type { UserProfile } from '../types/finance'

export const AUTH_TOKEN_KEY = 'lumina_auth_token'
export const AUTH_USER_KEY = 'lumina_auth_user'

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
    currency: string
    theme: 'dark' | 'light' | 'system'
    createdAt: string
  }
  token: string
}

export const authService = {
  /**
   * Register a new user account
   */
  register: async (data: {
    name: string
    email: string
    password: string
    role?: string
    currency?: string
    theme?: string
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      data
    )
    if (res.data.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.data.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data.user))
    }
    return res.data.data
  },

  /**
   * Authenticate user with email and password
   */
  login: async (credentials: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      credentials
    )
    if (res.data.data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.data.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data.user))
    }
    return res.data.data
  },

  /**
   * Log out user and purge stored token/user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }
  },

  /**
   * Fetch current authenticated user from server
   */
  getMe: async (): Promise<AuthResponse['user']> => {
    const res = await apiClient.get<{ success: boolean; data: AuthResponse['user'] }>(
      '/auth/me'
    )
    if (res.data.data) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data))
    }
    return res.data.data
  },

  /**
   * Update user profile attributes
   */
  updateProfile: async (profile: Partial<UserProfile>): Promise<AuthResponse['user']> => {
    const res = await apiClient.patch<{
      success: boolean
      data: AuthResponse['user']
    }>('/auth/profile', profile)
    if (res.data.data) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data))
    }
    return res.data.data
  },

  /**
   * Change user password securely
   */
  changePassword: async (passwords: {
    currentPassword: string
    newPassword: string
  }): Promise<void> => {
    await apiClient.patch('/auth/change-password', passwords)
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  /**
   * Get stored cached user
   */
  getStoredUser: (): AuthResponse['user'] | null => {
    const userStr = localStorage.getItem(AUTH_USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
}
