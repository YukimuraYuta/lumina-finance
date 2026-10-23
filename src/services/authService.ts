import apiClient from './api'
import type { UserProfile } from '../types/finance'

export const AUTH_USER_KEY = 'lumina_auth_user'

export interface SafeUser {
  id: string
  name: string
  email: string
  role: string
  currency: string
  theme: 'dark' | 'light' | 'system'
  createdAt: string
}

export interface AuthResponse {
  user: SafeUser
  token?: string
}

export const authService = {
  /**
   * Register a new user account (sets HTTP-only cookie on server)
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
    if (res.data.data.user) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data.user))
    }
    return res.data.data
  },

  /**
   * Authenticate user with email and password (sets HTTP-only cookie on server)
   */
  login: async (credentials: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      credentials
    )
    if (res.data.data.user) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data.user))
    }
    return res.data.data
  },

  /**
   * Log out user and invalidate server session cookie
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    } finally {
      sessionStorage.removeItem(AUTH_USER_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }
  },

  /**
   * Fetch current authenticated user from server using active session cookie
   */
  getMe: async (): Promise<SafeUser> => {
    const res = await apiClient.get<{ success: boolean; data: SafeUser }>('/auth/me')
    if (res.data.data) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data))
    }
    return res.data.data
  },

  /**
   * Update user profile attributes
   */
  updateProfile: async (profile: Partial<UserProfile>): Promise<SafeUser> => {
    const res = await apiClient.patch<{
      success: boolean
      data: SafeUser
    }>('/auth/profile', profile)
    if (res.data.data) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.data.data))
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
   * Get cached session user (non-sensitive profile information)
   */
  getStoredUser: (): SafeUser | null => {
    const userStr =
      sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
}
