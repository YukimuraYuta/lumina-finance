import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, type SafeUser } from '../services/authService'
import type { UserProfile } from '../types/finance'

interface AuthContextType {
  user: SafeUser | null
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
  const [user, setUser] = useState<SafeUser | null>(() => authService.getStoredUser())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Verify and hydrate current user on mount via secure HTTP-only cookie
  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      try {
        const verifiedUser = await authService.getMe()
        if (isMounted) {
          setUser(verifiedUser)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifySession()

    const handleAuthExpired = () => {
      setUser(null)
    }

    window.addEventListener('lumina-auth-expired', handleAuthExpired)

    return () => {
      isMounted = false
      window.removeEventListener('lumina-auth-expired', handleAuthExpired)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    setUser(res.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password })
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
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
    isAuthenticated: Boolean(user),
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
