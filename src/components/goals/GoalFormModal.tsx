import React, { useState } from 'react'
import { X, Target } from 'lucide-react'
import type { Goal } from '../../types/finance'

interface GoalFormModalProps {
  isOpen: boolean
  initialData?: Goal | null
  onClose: () => void
  onSubmit: (goal: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }) => void
}

const GOAL_CATEGORIES = [
  'Savings',
  'Electronics',
  'Education',
  'Travel',
  'Emergency',
  'Vehicle',
  'Other',
]

const COLOR_OPTIONS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Cyan', hex: '#06b6d4' },
]

const GoalFormModalContent: React.FC<Omit<GoalFormModalProps, 'isOpen'>> = ({
  initialData,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [targetAmount, setTargetAmount] = useState(
    initialData ? initialData.targetAmount.toString() : ''
  )
  const [currentAmount, setCurrentAmount] = useState(
    initialData ? initialData.currentAmount.toString() : '0'
  )
  const [category, setCategory] = useState(initialData?.category || 'Savings')
  const [deadline, setDeadline] = useState(initialData?.deadline || '')
  const [color, setColor] = useState(initialData?.color || '#3b82f6')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    const numTarget = parseFloat(targetAmount)
    if (isNaN(numTarget) || numTarget <= 0) {
      newErrors.targetAmount = 'Please enter a valid positive target amount'
    }

    const numCurrent = parseFloat(currentAmount)
    if (isNaN(numCurrent) || numCurrent < 0) {
      newErrors.currentAmount = 'Current saved amount cannot be negative'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      id: initialData?.id,
      title: title.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      category,
      deadline: deadline || undefined,
      color,
    })
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Target size={20} className="modal-icon" />
            <h3 className="modal-title">{initialData ? 'Edit Savings Goal' : 'New Savings Goal'}</h3>
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
          <div className="form-group">
            <label htmlFor="goal-title" className="form-label">
              Goal Title <span className="required">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. New Laptop, Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="goal-target" className="form-label">
                Target Amount <span className="required">*</span>
              </label>
              <input
                id="goal-target"
                type="number"
                step="100"
                min="1"
                className={`form-input ${errors.targetAmount ? 'input-error' : ''}`}
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
              {errors.targetAmount && <span className="error-text">{errors.targetAmount}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="goal-current" className="form-label">
                Already Saved
              </label>
              <input
                id="goal-current"
                type="number"
                step="100"
                min="0"
                className={`form-input ${errors.currentAmount ? 'input-error' : ''}`}
                placeholder="e.g. 10000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
              {errors.currentAmount && <span className="error-text">{errors.currentAmount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="goal-category" className="form-label">
                Category
              </label>
              <select
                id="goal-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="goal-deadline" className="form-label">
                Target Deadline
              </label>
              <input
                id="goal-deadline"
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Accent Color</label>
            <div className="color-palette-options">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  className={`color-choice-btn ${color === c.hex ? 'color-choice-active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const GoalFormModal: React.FC<GoalFormModalProps> = (props) => {
  if (!props.isOpen) return null
  return <GoalFormModalContent key={props.initialData?.id || 'new'} {...props} />
}

export default GoalFormModal
