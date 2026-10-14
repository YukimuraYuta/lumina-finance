import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  transactionDescription?: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transactionDescription,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        className="modal-content modal-content-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-header">
          <div className="warning-icon-badge">
            <AlertTriangle size={20} />
          </div>
          <h2 id="delete-dialog-title" className="modal-title">
            Delete Transaction
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
            Are you sure you want to delete{' '}
            <strong>"{transactionDescription || 'this transaction'}"</strong>?
          </p>
          <p className="delete-subtext">This action cannot be undone.</p>
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
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
