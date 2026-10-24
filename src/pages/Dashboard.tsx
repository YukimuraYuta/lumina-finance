import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  ArrowRight,
  Target,
  WalletCards,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import BalanceCard from '../components/dashboard/BalanceCard'
import IncomeCard from '../components/dashboard/IncomeCard'
import ExpenseCard from '../components/dashboard/ExpenseCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import CategoryChart from '../components/dashboard/CategoryChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import TransactionForm from '../components/transactions/TransactionForm'
import { useFinance } from '../hooks/useFinance'
import { analyticsService } from '../services/analyticsService'
import type { AnalyticsOverview } from '../types/analytics'

const Dashboard: React.FC = () => {
  const {
    summary,
    transactions,
    categorySpending,
    spendingTrends,
    user,
    budgets,
    goals,
    addTransaction,
    formatAmount,
    error,
    refreshData,
  } = useFinance()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)

  // Fetch live month-over-month overview for dashboard comparisons
  useEffect(() => {
    analyticsService
      .getOverview({ period: 'month' })
      .then(setOverview)
      .catch((err) => {
        console.warn('Dashboard overview fetch fallback:', err)
      })
  }, [transactions, budgets, goals])

  // Up to 6 recent transactions for dashboard
  const recentTransactions = transactions.slice(0, 6)

  // Dynamic budget utilization calculations
  const budgetUtilization = useMemo(() => {
    const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0)
    const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0)
    const remaining = Math.max(0, totalLimit - totalSpent)
    const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0
    return { totalLimit, totalSpent, remaining, pct, count: budgets.length }
  }, [budgets])

  // Dynamic savings goals progress calculations
  const goalMetrics = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0)
    const totalCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0)
    const pct = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0
    return { totalTarget, totalCurrent, pct, count: goals.length }
  }, [goals])

  // Dynamic savings rate
  const savingsRate = useMemo(() => {
    if (summary.income <= 0) return 0
    return Number(((summary.balance / summary.income) * 100).toFixed(1))
  }, [summary.income, summary.balance])

  const handleSaveTransaction = (
    txData: Parameters<typeof addTransaction>[0]
  ) => {
    addTransaction(txData)
    setIsFormOpen(false)
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user.name} 👋</p>
          <p className="dashboard-secondary-text">
            Here's your live financial overview for this month.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsFormOpen(true)}
            aria-label="Add New Transaction"
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#f87171',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
            onClick={() => refreshData()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards Section (Net Balance, Income, Expenses, Savings Rate) */}
      <section className="dashboard-summary-grid" aria-label="Financial Summary Cards">
        <BalanceCard amount={summary.balance} currency={summary.currency} />
        <IncomeCard amount={summary.income} currency={summary.currency} />
        <ExpenseCard amount={summary.expenses} currency={summary.currency} />

        {/* Dynamic Savings Rate Card */}
        <div className="stat-card balance-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Savings Rate</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <Percent size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount">
              {savingsRate}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="stat-card-subtitle">Retained earnings</span>
              {overview?.changes && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: overview.changes.incomeChange >= 0 ? '#10b981' : '#ef4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {overview.changes.incomeChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {overview.changes.incomeChange}% income MoM
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation & Active Utilization Cards */}
      <section className="dashboard-quick-cards" aria-label="Quick Highlights">
        <div className="quick-highlight-card">
          <div className="quick-card-left">
            <div className="quick-icon-wrap icon-wallet">
              <WalletCards size={20} />
            </div>
            <div>
              <h4 className="quick-card-title">
                Monthly Budgets {budgetUtilization.count > 0 ? `(${budgetUtilization.pct}% used)` : ''}
              </h4>
              <p className="quick-card-sub">
                {budgetUtilization.count > 0
                  ? `${formatAmount(budgetUtilization.remaining)} remaining of ${formatAmount(budgetUtilization.totalLimit)}`
                  : 'Track categorical limits & spending'}
              </p>
            </div>
          </div>
          <Link to="/budgets" className="quick-card-link" aria-label="Manage Budgets">
            <span>Manage Budgets</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="quick-highlight-card">
          <div className="quick-card-left">
            <div className="quick-icon-wrap icon-target">
              <Target size={20} />
            </div>
            <div>
              <h4 className="quick-card-title">
                Savings Milestones {goalMetrics.count > 0 ? `(${goalMetrics.pct}% saved)` : ''}
              </h4>
              <p className="quick-card-sub">
                {goalMetrics.count > 0
                  ? `${formatAmount(goalMetrics.totalCurrent)} of ${formatAmount(goalMetrics.totalTarget)} achieved`
                  : `${goals.length} active goals in progress`}
              </p>
            </div>
          </div>
          <Link to="/goals" className="quick-card-link" aria-label="View Goals">
            <span>View Goals</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts-grid" aria-label="Financial Analytics Charts">
        <SpendingChart data={spendingTrends} />
        <CategoryChart data={categorySpending} />
      </section>

      {/* Recent Transactions Section */}
      <section className="dashboard-transactions-section" aria-label="Recent Transactions">
        <RecentTransactions transactions={recentTransactions} />
      </section>

      {/* Transaction Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveTransaction}
      />
    </div>
  )
}

export default Dashboard
