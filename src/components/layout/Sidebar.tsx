import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  Target,
  ChartNoAxesCombined,
  Settings,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string; size?: number }>
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budgets', path: '/budgets', icon: WalletCards },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Analytics', path: '/analytics', icon: ChartNoAxesCombined },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      aria-label="Application Sidebar"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <WalletCards size={24} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Lumina</span>
            <span className="brand-badge">Finance</span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close Navigation Sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Main Navigation">
        <div className="nav-section-label">Main Menu</div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path} className="nav-item-wrapper">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon className="nav-icon" size={20} />
                  <span className="nav-text">{item.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="student-badge-card">
          <div className="badge-dot"></div>
          <div className="badge-info">
            <span className="badge-title">Student Edition</span>
            <span className="badge-sub">Free Tier</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
