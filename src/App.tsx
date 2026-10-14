import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { FinanceProvider } from './context/FinanceContext'
import './App.css'

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  )
}

export default App
