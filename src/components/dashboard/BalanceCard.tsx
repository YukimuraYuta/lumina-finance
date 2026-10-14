import React from 'react'
import { Wallet } from 'lucide-react'
import { formatCurrency } from '../../utils/mockData'

interface BalanceCardProps {
  amount: number
  currency?: string
}

const BalanceCard: React.FC<BalanceCardProps> = ({ amount, currency = '₹' }) => {
  return (
    <div className="stat-card balance-card">
      <div className="stat-card-header">
        <span className="stat-card-title">Total Balance</span>
        <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
          <Wallet size={20} />
        </div>
      </div>

      <div className="stat-card-content">
        <div className="stat-card-amount">{formatCurrency(amount, currency)}</div>
        <div className="stat-card-subtitle">Available student funds</div>
      </div>
    </div>
  )
}

export default BalanceCard
