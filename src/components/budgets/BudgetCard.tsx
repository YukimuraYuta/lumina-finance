import React from 'react'
import {
  Utensils,
  Car,
  BookOpen,
  Film,
  ShoppingBag,
  WalletCards,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { Budget, BudgetStatus } from '../../types/finance'
import { formatCurrency } from '../../utils/mockData'
import { calculateBudgetMetrics } from '../../utils/budgetCalculations'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
}

const getCategoryIcon = (category: string) => {
  const props: LucideProps = { size: 18 }
  switch (category.toLowerCase()) {
    case 'food':
      return <Utensils {...props} />
    case 'transport':
      return <Car {...props} />
    case 'education':
      return <BookOpen {...props} />
    case 'entertainment':
      return <Film {...props} />
    case 'shopping':
      return <ShoppingBag {...props} />
    default:
      return <WalletCards {...props} />
  }
}

const getStatusBadge = (status: BudgetStatus) => {
  const props: LucideProps = { size: 14 }
  switch (status) {
    case 'Healthy':
      return (
        <span className="status-badge badge-healthy">
          <CheckCircle2 {...props} />
          <span>Healthy</span>
        </span>
      )
    case 'Near Limit':
      return (
        <span className="status-badge badge-warning">
          <AlertCircle {...props} />
          <span>Near Limit</span>
        </span>
      )
    case 'Almost Reached':
      return (
        <span className="status-badge badge-orange">
          <AlertTriangle {...props} />
          <span>Almost Reached</span>
        </span>
      )
    case 'Over Budget':
      return (
        <span className="status-badge badge-danger">
          <ShieldAlert {...props} />
          <span>Over Budget</span>
        </span>
      )
  }
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const { remaining, usagePercentage, displayPercentage, status, isOverBudget } =
    calculateBudgetMetrics(budget)

  return (
    <div className={`budget-card ${isOverBudget ? 'card-over-budget' : ''}`}>
      <div className="budget-card-header">
        <div className="budget-category-wrap">
          <div className="budget-icon-badge" aria-hidden="true">
            {getCategoryIcon(budget.category)}
          </div>
          <div>
            <h3 className="budget-category-title">{budget.category}</h3>
            <span className="budget-period-tag">{budget.period}</span>
          </div>
        </div>

        <div className="budget-actions">
          {getStatusBadge(status)}
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={() => onEdit(budget)}
            aria-label={`Edit ${budget.category} budget`}
            title="Edit Budget"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={() => onDelete(budget)}
            aria-label={`Delete ${budget.category} budget`}
            title="Delete Budget"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="budget-card-body">
        <div className="budget-amounts-row">
          <span className="spent-amount">{formatCurrency(budget.spent)}</span>
          <span className="limit-amount">of {formatCurrency(budget.limit)} limit</span>
        </div>

        {/* Progress Bar Component */}
        <div className="progress-bar-wrap">
          <div
            className={`progress-bar-track ${
              status === 'Over Budget'
                ? 'track-danger'
                : status === 'Almost Reached'
                ? 'track-orange'
                : status === 'Near Limit'
                ? 'track-warning'
                : 'track-healthy'
            }`}
            role="progressbar"
            aria-valuenow={displayPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${budget.category} budget progress: ${usagePercentage}% used`}
            style={{ width: `${displayPercentage}%` }}
          />
        </div>

        <div className="budget-footer-row">
          <span className={`usage-percentage ${isOverBudget ? 'text-danger-bold' : ''}`}>
            {usagePercentage}% used
          </span>
          <span className={`remaining-amount ${isOverBudget ? 'text-danger' : 'text-muted'}`}>
            {isOverBudget
              ? `${formatCurrency(Math.abs(remaining))} over limit`
              : `${formatCurrency(remaining)} remaining`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BudgetCard
