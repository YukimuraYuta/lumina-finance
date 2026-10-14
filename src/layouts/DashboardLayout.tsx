import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import Toast from '../components/common/Toast'

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="layout-container">
      {/* Overlay backdrop for mobile drawer navigation */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <div className="layout-main">
        <Navbar onToggleSidebar={handleToggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  )
}

export default DashboardLayout
