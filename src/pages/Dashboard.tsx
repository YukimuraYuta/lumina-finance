import React, { useState } from 'react'
import { Plus, ArrowRight, Target, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import BalanceCard from '../components/dashboard/BalanceCard'
import IncomeCard from '../components/dashboard/IncomeCard'
import ExpenseCard from '../components/dashboard/ExpenseCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import CategoryChart from '../components/dashboard/CategoryChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import TransactionForm from '../components/transactions/TransactionForm'
import { useFinance } from '../hooks/useFinance'

const Dashboard: React.FC = () => {
  const {
    summary,
    transactions,
    categorySpending,
    spendingTrends,
    user,
    goals,
    addTransaction,
  } = useFinance()

  const [isFormOpen, setIsFormOpen] = useState(false)

  // Use up to 6 recent transactions for dashboard
  const recentTransactions = transactions.slice(0, 6)

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
          <p className="dashboard-secondary-text">Here's your live financial overview.</p>
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

      {/* Summary Cards Section */}
      <section className="dashboard-summary-grid" aria-label="Financial Summary Cards">
        <BalanceCard amount={summary.balance} currency={summary.currency} />
        <IncomeCard amount={summary.income} currency={summary.currency} />
        <ExpenseCard amount={summary.expenses} currency={summary.currency} />
      </section>

      {/* Quick Navigation Cards */}
      <section className="dashboard-quick-cards" aria-label="Quick Highlights">
        <div className="quick-highlight-card">
          <div className="quick-card-left">
            <div className="quick-icon-wrap icon-wallet">
              <WalletCards size={20} />
            </div>
            <div>
              <h4 className="quick-card-title">Monthly Budgets</h4>
              <p className="quick-card-sub">Track categorical limits & spending</p>
            </div>
          </div>
          <Link to="/budgets" className="quick-card-link">
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
              <h4 className="quick-card-title">Savings Milestones</h4>
              <p className="quick-card-sub">
                {goals.length} active goal{goals.length !== 1 ? 's' : ''} in progress
              </p>
            </div>
          </div>
          <Link to="/goals" className="quick-card-link">
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
