import React from 'react'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '../../utils/mockData'

interface IncomeCardProps {
  amount: number
  currency?: string
}

const IncomeCard: React.FC<IncomeCardProps> = ({ amount, currency = '₹' }) => {
  return (
    <div className="stat-card income-card">
      <div className="stat-card-header">
        <span className="stat-card-title">Income</span>
        <div className="stat-card-icon-wrap income-icon-wrap" aria-hidden="true">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="stat-card-content">
        <div className="stat-card-amount text-success">
          {formatCurrency(amount, currency)}
        </div>
        <div className="stat-card-subtitle">Monthly earnings & allowances</div>
      </div>
    </div>
  )
}

export default IncomeCard
