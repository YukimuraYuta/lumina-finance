import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import TransactionForm from '../components/transactions/TransactionForm'
import BudgetForm from '../components/budgets/BudgetForm'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    getStoredUser: vi.fn(() => null),
  },
}))

describe('Lumina Finance Frontend Security & QA Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('28. Login Form Validation', () => {
    it('shows validation error when submitted with empty fields', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(
        await screen.findByText(/Please provide both your email and password/i)
      ).toBeDefined()
    })

    it('submits successfully when valid email and password are provided', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: {
          id: 'user-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'Student',
          currency: '₹',
          theme: 'dark',
          createdAt: new Date().toISOString(),
        },
      })

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'jane@example.com',
          password: 'ValidPass123!',
        })
      })
    })
  })

  describe('29. Registration Form Validation & Password Checklist', () => {
    it('disables submit button and validates rules checklist', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toHaveProperty('disabled', true)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Jane Student' } })
        fireEvent.change(emailInput, { target: { value: 'student@uni.edu' } })
        fireEvent.change(passwordInput, { target: { value: 'Weak1' } }) // Less than 8 chars
        fireEvent.change(confirmInput, { target: { value: 'Weak1' } })
      })

      // Still disabled because length < 8
      expect(submitButton).toHaveProperty('disabled', true)

      // Enter valid password meeting all criteria
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'SecurePass99!' } })
        fireEvent.change(confirmInput, { target: { value: 'SecurePass99!' } })
      })

      // Now enabled
      expect(submitButton).toHaveProperty('disabled', false)
    })
  })

  describe('30. Protected Route Behavior', () => {
    it('redirects unauthenticated users to /login', async () => {
      // Mock session verification to return error (unauthenticated)
      vi.mocked(authService.getMe).mockRejectedValueOnce(new Error('Unauthorized'))

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>Login Page Mock</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('Login Page Mock')).toBeDefined()
    })

    it('renders protected child component when user is authenticated', async () => {
      vi.mocked(authService.getMe).mockResolvedValueOnce({
        id: 'auth-user-id',
        name: 'Authenticated User',
        email: 'auth@lumina.test',
        role: 'Student',
        currency: '₹',
        theme: 'dark',
        createdAt: new Date().toISOString(),
      })

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>Login Page Mock</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('Protected Dashboard Content')).toBeDefined()
    })
  })

  describe('31. Loading and Error States', () => {
    it('displays loading screen during session verification', () => {
      // Return a pending promise that never resolves during initial render
      vi.mocked(authService.getMe).mockReturnValue(new Promise(() => {}))

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Dashboard</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )

      expect(screen.getByText(/verifying your session/i)).toBeDefined()
    })
  })

  describe('32. Transaction Form Behavior', () => {
    it('validates description and positive amount on submit', async () => {
      const handleSubmit = vi.fn()
      const handleClose = vi.fn()

      render(
        <TransactionForm
          isOpen={true}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /add transaction/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(screen.getByText(/description is required/i)).toBeDefined()
      expect(screen.getByText(/amount must be a positive number/i)).toBeDefined()
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  describe('33. Budget Form Behavior', () => {
    it('validates budget limit greater than 0', async () => {
      const handleSubmit = vi.fn()
      const handleClose = vi.fn()

      render(
        <BudgetForm
          isOpen={true}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /create budget/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(screen.getByText(/budget limit must be greater than 0/i)).toBeDefined()
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  describe('34. Logout Behavior', () => {
    const TestLogoutComponent = () => {
      const { user, isAuthenticated, logout } = useAuth()
      return (
        <div>
          <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
          {user && <div data-testid="user-name">{user.name}</div>}
          <button onClick={logout}>Sign Out</button>
        </div>
      )
    }

    it('clears user context and unauthenticates session on logout', async () => {
      vi.mocked(authService.getMe).mockResolvedValueOnce({
        id: 'user-logout',
        name: 'Logout Person',
        email: 'logout@test.com',
        role: 'Student',
        currency: '₹',
        theme: 'system',
        createdAt: new Date().toISOString(),
      })
      vi.mocked(authService.logout).mockResolvedValueOnce()

      render(
        <AuthProvider>
          <TestLogoutComponent />
        </AuthProvider>
      )

      expect(await screen.findByText('Logged In')).toBeDefined()
      expect(screen.getByTestId('user-name').textContent).toBe('Logout Person')

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await act(async () => {
        fireEvent.click(signOutButton)
      })

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled()
        expect(screen.getByTestId('auth-status').textContent).toBe('Logged Out')
      })
    })
  })
})
