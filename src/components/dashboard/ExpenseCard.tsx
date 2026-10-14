import React from 'react'
import { TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../utils/mockData'

interface ExpenseCardProps {
  amount: number
  currency?: string
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ amount, currency = '₹' }) => {
  return (
    <div className="stat-card expense-card">
      <div className="stat-card-header">
        <span className="stat-card-title">Expenses</span>
        <div className="stat-card-icon-wrap expense-icon-wrap" aria-hidden="true">
          <TrendingDown size={20} />
        </div>
      </div>

      <div className="stat-card-content">
        <div className="stat-card-amount text-danger">
          {formatCurrency(amount, currency)}
        </div>
        <div className="stat-card-subtitle">Total outgoing expenses</div>
      </div>
    </div>
  )
}

export default ExpenseCard
