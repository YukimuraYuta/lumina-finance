import React, { useState, useEffect } from 'react'
import {
  User,
  Coins,
  Palette,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Info,
  Shield,
  Key,
  AlertCircle,
} from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useAuth } from '../context/AuthContext'

const CURRENCY_OPTIONS = [
  { symbol: '₹', name: 'INR (Indian Rupee)' },
  { symbol: '$', name: 'USD (US Dollar)' },
  { symbol: '€', name: 'EUR (Euro)' },
  { symbol: '£', name: 'GBP (British Pound)' },
  { symbol: '¥', name: 'JPY (Japanese Yen)' },
  { symbol: 'C$', name: 'CAD (Canadian Dollar)' },
  { symbol: 'A$', name: 'AUD (Australian Dollar)' },
]

const Settings: React.FC = () => {
  const {
    user,
    updateUserProfile,
    resetToDemoData,
    exportDataAsJSON,
    exportTransactionsCSV,
    transactions,
    budgets,
    goals,
    showToast,
  } = useFinance()

  const { user: authUser, updateUser, changePassword } = useAuth()

  const [name, setName] = useState(authUser?.name || user.name)
  const [role, setRole] = useState(authUser?.role || user.role)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)
  const [isChangingPw, setIsChangingPw] = useState(false)

  useEffect(() => {
    if (authUser) {
      setName(authUser.name)
      setRole(authUser.role)
    }
  }, [authUser])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim() || 'User'
    const trimmedRole = role.trim() || 'Student'
    try {
      await updateUser({ name: trimmedName, role: trimmedRole })
      updateUserProfile({ name: trimmedName, role: trimmedRole })
      showToast('Profile updated successfully', 'success')
    } catch {
      updateUserProfile({ name: trimmedName, role: trimmedRole })
    }
  }

  const handleCurrencyChange = async (sym: string) => {
    try {
      await updateUser({ currency: sym })
      updateUserProfile({ currency: sym })
    } catch {
      updateUserProfile({ currency: sym })
    }
  }

  const handleThemeChange = async (theme: 'dark' | 'light' | 'system') => {
    try {
      await updateUser({ theme })
      updateUserProfile({ theme })
    } catch {
      updateUserProfile({ theme })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(null)

    if (!currentPassword) {
      setPwError('Please enter your current password.')
      return
    }

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match.')
      return
    }

    try {
      setIsChangingPw(true)
      await changePassword(currentPassword, newPassword)
      setPwSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      showToast('Password changed successfully', 'success')
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password. Please check your current password.')
    } finally {
      setIsChangingPw(false)
    }
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings & Preferences</h1>
          <p className="page-subtitle">Customize your profile, security, currencies, theme, and data.</p>
        </div>
      </header>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap">
                <User size={18} />
              </div>
              <div>
                <h3 className="chart-title">User Profile</h3>
                <p className="chart-subtitle">Personalize your student identity and email</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="user-name" className="form-label">
                  Your Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arnav"
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="user-role" className="form-label">
                  Role / Status
                </label>
                <input
                  id="user-role"
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Student, Scholar, Intern"
                />
              </div>
            </div>

            {authUser?.email && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={authUser.email}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={16} />
              <span>Update Profile</span>
            </button>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <Shield size={18} />
              </div>
              <div>
                <h3 className="chart-title">Security & Password</h3>
                <p className="chart-subtitle">Keep your personal finance account protected</p>
              </div>
            </div>
          </div>

          {pwError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          {pwSuccess && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#34d399',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="current-pw" className="form-label">
                Current Password
              </label>
              <input
                id="current-pw"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="new-pw" className="form-label">
                  New Password
                </label>
                <input
                  id="new-pw"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="confirm-new-pw" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-pw"
                  type="password"
                  className="form-input"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary btn-sm" disabled={isChangingPw}>
              <Key size={16} />
              <span>{isChangingPw ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </form>
        </div>

        {/* Currency Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap">
                <Coins size={18} />
              </div>
              <div>
                <h3 className="chart-title">Currency Symbol</h3>
                <p className="chart-subtitle">Choose your preferred currency symbol</p>
              </div>
            </div>
          </div>

          <div className="currency-selector-grid">
            {CURRENCY_OPTIONS.map((c) => {
              const currentSym = authUser?.currency || user.currency
              const isSelected = currentSym === c.symbol
              return (
                <button
                  key={c.symbol}
                  type="button"
                  className={`currency-option-card ${isSelected ? 'currency-option-active' : ''}`}
                  onClick={() => handleCurrencyChange(c.symbol)}
                >
                  <span className="curr-sym">{c.symbol}</span>
                  <span className="curr-name">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Theme & Appearance Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap">
                <Palette size={18} />
              </div>
              <div>
                <h3 className="chart-title">Appearance Theme</h3>
                <p className="chart-subtitle">Select your preferred viewing theme</p>
              </div>
            </div>
          </div>

          <div className="theme-toggle-row">
            <button
              type="button"
              className={`theme-card-btn ${user.theme === 'dark' ? 'theme-card-active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={20} />
              <div className="theme-card-text">
                <span className="theme-name">Dark Mode</span>
                <span className="theme-desc">Modern sleek dark background</span>
              </div>
            </button>

            <button
              type="button"
              className={`theme-card-btn ${user.theme === 'light' ? 'theme-card-active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={20} />
              <div className="theme-card-text">
                <span className="theme-name">Light Mode</span>
                <span className="theme-desc">Clean white bright background</span>
              </div>
            </button>

            <button
              type="button"
              className={`theme-card-btn ${user.theme === 'system' ? 'theme-card-active' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              <Laptop size={20} />
              <div className="theme-card-text">
                <span className="theme-name">System Default</span>
                <span className="theme-desc">Follow OS system preference</span>
              </div>
            </button>
          </div>
        </div>

        {/* Data Storage & Management Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap">
                <Database size={18} />
              </div>
              <div>
                <h3 className="chart-title">Data Storage & Export</h3>
                <p className="chart-subtitle">
                  Currently tracking {transactions.length} transactions, {budgets.length} budgets, and {goals.length} goals in PostgreSQL
                </p>
              </div>
            </div>
          </div>

          <div className="data-actions-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportDataAsJSON}
              title="Export all data to JSON"
            >
              <Download size={16} />
              <span>Export Full Backup (JSON)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportTransactionsCSV}
              title="Export transactions table to CSV"
            >
              <Download size={16} />
              <span>Export Transactions (CSV)</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={() => setIsResetConfirmOpen(true)}
              title="Reset data to initial demo state"
            >
              <RotateCcw size={16} />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>

        {/* About Card */}
        <div className="chart-card settings-section-card">
          <div className="chart-card-header settings-header">
            <div className="settings-header-left">
              <div className="settings-icon-wrap">
                <Info size={18} />
              </div>
              <div>
                <h3 className="chart-title">About Lumina Finance</h3>
                <p className="chart-subtitle">Student Edition v1.0.0 • Secure Authentication Enabled</p>
              </div>
            </div>
          </div>

          <div className="about-details">
            <p className="about-text">
              Lumina Finance is designed specifically for students to effortlessly master personal finance, monitor categorical budgets, reach milestone savings goals, and understand spending habits through rich dynamic visual analytics.
            </p>
            <div className="tech-stack-badges">
              <span className="tech-badge">React 19</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">JWT & Bcrypt</span>
              <span className="tech-badge">Node Express</span>
              <span className="tech-badge">PostgreSQL & Prisma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <RotateCcw size={20} className="modal-icon text-danger" />
                <h3 className="modal-title">Reset to Demo Data?</h3>
              </div>
            </div>
            <div className="modal-body">
              <p className="delete-modal-text">
                This will reset all your active transactions, budgets, goals, and user preferences back to the initial pre-loaded demo state.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  resetToDemoData()
                  setIsResetConfirmOpen(false)
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
