import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { Transaction, TransactionType } from '../../types/finance'

interface TransactionFormProps {
  isOpen: boolean
  initialData?: Transaction | null
  onClose: () => void
  onSubmit: (transactionData: Omit<Transaction, 'id'> & { id?: string }) => void
}

interface FormErrors {
  description?: string
  amount?: string
  category?: string
  date?: string
}

const CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Income',
  'Other',
]

const TransactionFormContent: React.FC<
  Omit<TransactionFormProps, 'isOpen'>
> = ({ initialData, onClose, onSubmit }) => {
  const [type, setType] = useState<TransactionType>(
    initialData?.type || 'expense'
  )
  const [description, setDescription] = useState(
    initialData?.description || ''
  )
  const [amount, setAmount] = useState<string>(
    initialData ? initialData.amount.toString() : ''
  )
  const [category, setCategory] = useState(initialData?.category || 'Food')
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = Boolean(initialData)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!description.trim()) {
      newErrors.description = 'Description is required.'
    }

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number greater than 0.'
    }

    if (!category.trim()) {
      newErrors.category = 'Please select a valid category.'
    }

    if (!date.trim()) {
      newErrors.date = 'Date is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit({
      id: initialData?.id,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      type,
      date,
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
        aria-labelledby="form-modal-title"
      >
        <div className="modal-header">
          <h2 id="form-modal-title" className="modal-title">
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
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
          {/* Transaction Type Segmented Switch */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div
              className="segmented-switch"
              role="radiogroup"
              aria-label="Transaction Type"
            >
              <button
                type="button"
                className={`switch-btn ${
                  type === 'expense' ? 'switch-btn-expense' : ''
                }`}
                onClick={() => {
                  setType('expense')
                  if (category === 'Income') setCategory('Food')
                }}
                role="radio"
                aria-checked={type === 'expense'}
              >
                Expense
              </button>
              <button
                type="button"
                className={`switch-btn ${
                  type === 'income' ? 'switch-btn-income' : ''
                }`}
                onClick={() => {
                  setType('income')
                  setCategory('Income')
                }}
                role="radio"
                aria-checked={type === 'income'}
              >
                Income
              </button>
            </div>
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="tx-description" className="form-label">
              Description <span className="required-star">*</span>
            </label>
            <input
              id="tx-description"
              type="text"
              className={`form-input ${errors.description ? 'input-error' : ''}`}
              placeholder="e.g. Textbooks, Coffee, Allowance"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }))
              }}
            />
            {errors.description && (
              <span className="field-error-text">{errors.description}</span>
            )}
          </div>

          {/* Amount & Category Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="tx-amount" className="form-label">
                Amount (₹) <span className="required-star">*</span>
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount)
                    setErrors((prev) => ({ ...prev, amount: undefined }))
                }}
              />
              {errors.amount && (
                <span className="field-error-text">{errors.amount}</span>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="tx-category" className="form-label">
                Category <span className="required-star">*</span>
              </label>
              <select
                id="tx-category"
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
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label htmlFor="tx-date" className="form-label">
              Date <span className="required-star">*</span>
            </label>
            <input
              id="tx-date"
              type="date"
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                if (errors.date)
                  setErrors((prev) => ({ ...prev, date: undefined }))
              }}
            />
            {errors.date && (
              <span className="field-error-text">{errors.date}</span>
            )}
          </div>

          {/* Optional Notes */}
          <div className="form-group">
            <label htmlFor="tx-notes" className="form-label">
              Notes <span className="optional-text">(Optional)</span>
            </label>
            <textarea
              id="tx-notes"
              rows={2}
              className="form-textarea"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const TransactionForm: React.FC<TransactionFormProps> = (props) => {
  if (!props.isOpen) return null
  const key = props.initialData ? props.initialData.id : 'new-tx'
  return <TransactionFormContent key={key} {...props} />
}

export default TransactionForm
