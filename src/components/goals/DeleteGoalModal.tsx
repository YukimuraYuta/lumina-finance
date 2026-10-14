import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteGoalModalProps {
  isOpen: boolean
  goalTitle?: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({
  isOpen,
  goalTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle size={20} className="modal-icon text-danger" />
            <h3 className="modal-title">Delete Savings Goal</h3>
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

        <div className="modal-body">
          <p className="delete-modal-text">
            Are you sure you want to delete the goal{' '}
            <strong>"{goalTitle || 'this goal'}"</strong>?
          </p>
          <p className="delete-modal-warning">
            This action cannot be undone. Saved funds won't be deleted from your balance, but progress tracking will be removed.
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteGoalModal
