import React, { useState } from 'react'
import { X, PiggyBank } from 'lucide-react'
import type { Goal } from '../../types/finance'
import { useFinance } from '../../hooks/useFinance'

interface GoalContributeModalProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  onContribute: (goalId: string, amount: number) => void
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

const GoalContributeModal: React.FC<GoalContributeModalProps> = ({
  isOpen,
  goal,
  onClose,
  onContribute,
}) => {
  const { user, formatAmount } = useFinance()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !goal) return null

  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive contribution amount')
      return
    }

    onContribute(goal.id, num)
    setAmount('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PiggyBank size={20} className="modal-icon" />
            <h3 className="modal-title">Contribute to {goal.title}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="goal-deposit-summary">
            <div className="deposit-stat">
              <span className="deposit-label">Current Progress:</span>
              <span className="deposit-val">{formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}</span>
            </div>
            <div className="deposit-stat">
              <span className="deposit-label">Needed to Complete:</span>
              <span className="deposit-val text-accent">{formatAmount(remaining)}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contribution-amount" className="form-label">
              Contribution Amount ({user.currency}) <span className="required">*</span>
            </label>
            <input
              id="contribution-amount"
              type="number"
              step="50"
              min="1"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          {/* Quick preset amount buttons */}
          <div className="quick-amount-presets">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                className="btn-preset-chip"
                onClick={() => {
                  setAmount(amt.toString())
                  setError('')
                }}
              >
                +{user.currency}{amt}
              </button>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Deposit Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalContributeModal
