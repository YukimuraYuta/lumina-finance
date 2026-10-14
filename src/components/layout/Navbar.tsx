import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Menu, UserCircle, Sun, Moon, CheckCircle2 } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'

interface NavbarProps {
  onToggleSidebar?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, updateUserProfile, transactions } = useFinance()
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleTheme = () => {
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark'
    updateUserProfile({ theme: nextTheme })
  }

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
            <span className="profile-name">{user.name}</span>
            <span className="profile-role">{user.role}</span>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Navbar
