import React from 'react'
import {
  Utensils,
  Car,
  BookOpen,
  ArrowDownLeft,
  Coffee,
  Film,
  Receipt,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatCurrency } from '../../utils/mockData'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

// Icon mapping helper
const getTransactionIcon = (iconName?: string, category?: string) => {
  const props: LucideProps = { size: 18 }
  const name = iconName || category

  switch (name) {
    case 'Utensils':
    case 'Food':
      return <Utensils {...props} />
    case 'Car':
    case 'Transport':
      return <Car {...props} />
    case 'BookOpen':
    case 'Education':
      return <BookOpen {...props} />
    case 'ArrowDownLeft':
    case 'Income':
      return <ArrowDownLeft {...props} />
    case 'Coffee':
      return <Coffee {...props} />
    case 'Film':
    case 'Entertainment':
      return <Film {...props} />
    default:
      return <Receipt {...props} />
  }
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card transactions-card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
        </div>
        <div className="empty-state">
          <Receipt size={36} className="empty-icon" />
          <p className="empty-title">No transactions recorded yet</p>
          <p className="empty-description">
            Your recent spending and income activity will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card transactions-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Transactions</h3>
          <p className="card-subtitle">Your latest financial activity</p>
        </div>
        <button
          type="button"
          className="btn-link"
          aria-label="View all transactions"
        >
          View all
        </button>
      </div>

      <div className="transactions-list" role="list" aria-label="Transaction history">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income'
          return (
            <div key={tx.id} className="transaction-item" role="listitem">
              <div className="tx-left">
                <div
                  className={`tx-icon-badge ${
                    isIncome ? 'tx-icon-income' : 'tx-icon-expense'
                  }`}
                  aria-hidden="true"
                >
                  {getTransactionIcon(tx.iconName, tx.category)}
                </div>
                <div className="tx-details">
                  <span className="tx-description">{tx.description}</span>
                  <div className="tx-meta">
                    <span className="tx-category">{tx.category}</span>
                    <span className="tx-dot">•</span>
                    <span className="tx-date">{tx.date}</span>
                  </div>
                </div>
              </div>

              <div className={`tx-amount ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecentTransactions
