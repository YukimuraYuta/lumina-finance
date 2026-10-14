import React, { useState } from 'react'
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
} from 'lucide-react'
import { useFinance } from '../hooks/useFinance'

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
  } = useFinance()

  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({ name: name.trim() || 'User', role: role.trim() || 'Student' })
  }

  const handleCurrencyChange = (sym: string) => {
    updateUserProfile({ currency: sym })
  }

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    updateUserProfile({ theme })
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings & Preferences</h1>
          <p className="page-subtitle">Customize your profile, currencies, theme, and data.</p>
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
                <p className="chart-subtitle">Personalize your student identity and role</p>
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

            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle2 size={16} />
              <span>Update Profile</span>
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
              const isSelected = user.currency === c.symbol
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
                  Currently tracking {transactions.length} transactions, {budgets.length} budgets, and {goals.length} goals in local storage
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
                <p className="chart-subtitle">Student Edition v1.0.0</p>
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
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Recharts</span>
              <span className="tech-badge">Lucide Icons</span>
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
