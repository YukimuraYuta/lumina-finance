import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'

const Toast: React.FC = () => {
  const { toast, dismissToast } = useFinance()

  if (!toast) return null

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon toast-icon-success" />
      case 'warning':
      case 'error':
        return <AlertCircle size={18} className="toast-icon toast-icon-danger" />
      default:
        return <Info size={18} className="toast-icon toast-icon-info" />
    }
  }

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast-card toast-${toast.type || 'info'}`}>
        <div className="toast-left">
          {getIcon()}
          <span className="toast-message">{toast.message}</span>
        </div>
        <button
          type="button"
          className="toast-dismiss-btn"
          onClick={dismissToast}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default Toast
