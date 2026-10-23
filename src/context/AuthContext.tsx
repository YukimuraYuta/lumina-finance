import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, type AuthResponse } from '../services/authService'
import type { UserProfile } from '../types/finance'

interface AuthContextType {
  user: AuthResponse['user'] | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (profile: Partial<UserProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(() => authService.getStoredUser())
  const [token, setToken] = useState<string | null>(() => authService.getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Verify and hydrate current user on mount if token exists
  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const savedToken = authService.getToken()
      if (!savedToken) {
        if (isMounted) {
          setUser(null)
          setToken(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const verifiedUser = await authService.getMe()
        if (isMounted) {
          setUser(verifiedUser)
          setToken(savedToken)
        }
      } catch (err) {
        console.warn('Session verification failed, clearing credentials:', err)
        if (isMounted) {
          await authService.logout()
          setUser(null)
          setToken(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    setUser(res.user)
    setToken(res.token)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password })
    setUser(res.user)
    setToken(res.token)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback(async (profile: Partial<UserProfile>) => {
    const updated = await authService.updateProfile(profile)
    setUser(updated)
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await authService.changePassword({ currentPassword, newPassword })
    },
    []
  )

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
