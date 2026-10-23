import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteBudgetModalProps {
  isOpen: boolean
  categoryName?: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteBudgetModal: React.FC<DeleteBudgetModalProps> = ({
  isOpen,
  categoryName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-content-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-budget-title"
      >
        <div className="modal-header">
          <div className="warning-icon-badge">
            <AlertTriangle size={20} />
          </div>
          <h2 id="delete-budget-title" className="modal-title">
            Delete Budget
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

        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to delete the budget for{' '}
            <strong>"{categoryName || 'this category'}"</strong>?
          </p>
          <p className="delete-subtext">
            This will remove the spending limit monitor for this category.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete Budget
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteBudgetModal
