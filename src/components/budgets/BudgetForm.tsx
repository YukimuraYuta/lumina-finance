import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { Budget, BudgetPeriod } from '../../types/finance'

interface BudgetFormProps {
  isOpen: boolean
  initialData?: Budget | null
  onClose: () => void
  onSubmit: (
    budgetData: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }
  ) => void
}

interface FormErrors {
  category?: string
  limit?: string
  period?: string
  startDate?: string
  endDate?: string
}

const CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Other',
]

const BudgetFormContent: React.FC<Omit<BudgetFormProps, 'isOpen'>> = ({
  initialData,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState(initialData?.category || 'Food')
  const [limit, setLimit] = useState<string>(
    initialData ? initialData.limit.toString() : ''
  )
  const [period, setPeriod] = useState<BudgetPeriod>(
    initialData?.period || 'monthly'
  )
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = Boolean(initialData)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!category.trim()) {
      newErrors.category = 'Please select a category.'
    }

    const numLimit = parseFloat(limit)
    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      newErrors.limit = 'Budget limit must be greater than 0.'
    }

    if (!period) {
      newErrors.period = 'Please select a budget period.'
    }

    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required.'
    }

    if (period === 'custom') {
      if (!endDate.trim()) {
        newErrors.endDate = 'End date is required for custom periods.'
      } else if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = 'End date cannot be earlier than start date.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit({
      id: initialData?.id,
      category,
      limit: parseFloat(limit),
      spent: initialData?.spent ?? 0,
      period,
      startDate,
      endDate: period === 'custom' ? endDate : undefined,
      notes: notes.trim() || undefined,
    })

    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div className="modal-header">
          <h2 id="budget-modal-title" className="modal-title">
            {isEditing ? 'Edit Budget' : 'Create New Budget'}
          </h2>
          <button
            type="button"
            className="icon-btn modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form" noValidate>
          {/* Category Selection */}
          <div className="form-group">
            <label htmlFor="budget-category" className="form-label">
              Category <span className="required-star">*</span>
            </label>
            <select
              id="budget-category"
              className={`form-select ${errors.category ? 'input-error' : ''}`}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                if (errors.category)
                  setErrors((prev) => ({ ...prev, category: undefined }))
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error-text">{errors.category}</span>
            )}
          </div>

          {/* Budget Limit & Period Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="budget-limit" className="form-label">
                Budget Limit (₹) <span className="required-star">*</span>
              </label>
              <input
                id="budget-limit"
                type="number"
                step="100"
                min="1"
                className={`form-input ${errors.limit ? 'input-error' : ''}`}
                placeholder="e.g. 5000"
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value)
                  if (errors.limit)
                    setErrors((prev) => ({ ...prev, limit: undefined }))
                }}
              />
              {errors.limit && (
                <span className="field-error-text">{errors.limit}</span>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="budget-period" className="form-label">
                Period <span className="required-star">*</span>
              </label>
              <select
                id="budget-period"
                className={`form-select ${errors.period ? 'input-error' : ''}`}
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value as BudgetPeriod)
                  if (errors.period)
                    setErrors((prev) => ({ ...prev, period: undefined }))
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              {errors.period && (
                <span className="field-error-text">{errors.period}</span>
              )}
            </div>
          </div>

          {/* Date Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="budget-start-date" className="form-label">
                Start Date <span className="required-star">*</span>
              </label>
              <input
                id="budget-start-date"
                type="date"
                className={`form-input ${errors.startDate ? 'input-error' : ''}`}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (errors.startDate)
                    setErrors((prev) => ({ ...prev, startDate: undefined }))
                }}
              />
              {errors.startDate && (
                <span className="field-error-text">{errors.startDate}</span>
              )}
            </div>

            {period === 'custom' && (
              <div className="form-group flex-1">
                <label htmlFor="budget-end-date" className="form-label">
                  End Date <span className="required-star">*</span>
                </label>
                <input
                  id="budget-end-date"
                  type="date"
                  className={`form-input ${errors.endDate ? 'input-error' : ''}`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    if (errors.endDate)
                      setErrors((prev) => ({ ...prev, endDate: undefined }))
                  }}
                />
                {errors.endDate && (
                  <span className="field-error-text">{errors.endDate}</span>
                )}
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div className="form-group">
            <label htmlFor="budget-notes" className="form-label">
              Notes <span className="optional-text">(Optional)</span>
            </label>
            <textarea
              id="budget-notes"
              rows={2}
              className="form-textarea"
              placeholder="Budget notes or savings goals..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const BudgetForm: React.FC<BudgetFormProps> = (props) => {
  if (!props.isOpen) return null
  const key = props.initialData ? props.initialData.id : 'new-budget'
  return <BudgetFormContent key={key} {...props} />
}

export default BudgetForm
