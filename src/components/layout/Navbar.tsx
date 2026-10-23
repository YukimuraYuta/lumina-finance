import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  UserCircle,
  Sun,
  Moon,
  CheckCircle2,
  LogOut,
} from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import { useAuth } from '../../context/AuthContext'

interface NavbarProps {
  onToggleSidebar?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, updateUserProfile, transactions } = useFinance()
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleTheme = () => {
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark'
    updateUserProfile({ theme: nextTheme })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Display authenticated user details
  const displayName = authUser?.name || user.name
  const displayRole = authUser?.role || user.role

  // Generate lightweight notification list from latest activity
  const recentAlerts = transactions.slice(0, 3)

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div className="navbar-context">
          <span className="context-app-name">Lumina Finance</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Theme Toggle */}
        <button
          type="button"
          className="icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${user.theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${user.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {user.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Popover */}
        <div className="notifications-wrapper" style={{ position: 'relative' }}>
          <button
            type="button"
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="notification-indicator" aria-hidden="true" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Recent Activity</span>
                <button
                  type="button"
                  className="notifications-clear"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
              <div className="notifications-list">
                {recentAlerts.map((tx) => (
                  <div key={tx.id} className="notification-item">
                    <div className="notification-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="notification-body">
                      <p className="notification-text">
                        {tx.type === 'income' ? 'Received' : 'Spent'} {user.currency}{tx.amount} on {tx.description}
                      </p>
                      <span className="notification-time">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge (Links to Settings) */}
        <Link
          to="/settings"
          className="user-profile-badge"
          aria-label="User Profile & Settings"
          title="Profile & Settings"
        >
          <UserCircle size={28} className="profile-avatar-icon" />
          <div className="profile-details">
            <span className="profile-name">{displayName}</span>
            <span className="profile-role">{displayRole}</span>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          className="icon-btn"
          onClick={handleLogout}
          aria-label="Log Out"
          title="Log Out of Lumina Finance"
          style={{
            marginLeft: '0.25rem',
            color: '#94a3b8',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

export default Navbar
