import React from 'react'
import {
  Utensils,
  Car,
  BookOpen,
  ArrowDownLeft,
  Coffee,
  Film,
  Receipt,
  Pencil,
  Trash2,
  SearchX,
  Plus,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatCurrency } from '../../utils/mockData'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onAddNew?: () => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

const getCategoryIcon = (iconName?: string, category?: string) => {
  const props: LucideProps = { size: 16 }
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

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onClearFilters,
  hasActiveFilters = false,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="table-card empty-table-container">
        <div className="empty-state">
          <SearchX size={44} className="empty-icon" />
          <h3 className="empty-title">No transactions found</h3>
          <p className="empty-description">
            {hasActiveFilters
              ? 'Try changing your search keywords or resetting your active filters.'
              : 'You have not added any transactions yet.'}
          </p>
          <div className="empty-actions">
            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            )}
            {onAddNew && (
              <button type="button" className="btn btn-primary" onClick={onAddNew}>
                <Plus size={16} />
                <span>Add Transaction</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-card">
      {/* Desktop & Tablet Table */}
      <div className="table-responsive">
        <table className="transactions-table" aria-label="Transactions table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Category</th>
              <th scope="col">Type</th>
              <th scope="col" className="text-right">Amount</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income'
              return (
                <tr key={tx.id} className="table-row">
                  <td className="td-date">{tx.date}</td>
                  <td className="td-description">
                    <div className="desc-cell">
                      <div
                        className={`tx-type-badge ${
                          isIncome ? 'badge-income' : 'badge-expense'
                        }`}
                        aria-hidden="true"
                      >
                        {getCategoryIcon(tx.iconName, tx.category)}
                      </div>
                      <div>
                        <div className="desc-text">{tx.description}</div>
                        {tx.notes && <div className="desc-notes">{tx.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill">{tx.category}</span>
                  </td>
                  <td>
                    <span
                      className={`type-tag ${
                        isIncome ? 'tag-income' : 'tag-expense'
                      }`}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={`td-amount text-right ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="td-actions text-right">
                    <div className="actions-group">
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => onEdit(tx)}
                        aria-label={`Edit ${tx.description}`}
                        title="Edit Transaction"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => onDelete(tx)}
                        aria-label={`Delete ${tx.description}`}
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionTable
