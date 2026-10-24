import React from 'react'
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { BudgetPerformanceItem } from '../../types/analytics'
import { useFinance } from '../../hooks/useFinance'

interface BudgetPerformanceProps {
  items: BudgetPerformanceItem[]
}

const getStatusBadge = (status: BudgetPerformanceItem['status']) => {
  switch (status) {
    case 'Healthy':
      return (
        <span className="status-badge badge-healthy" aria-label="Status: Healthy">
          <CheckCircle2 size={13} />
          <span>Within Budget</span>
        </span>
      )
    case 'Near Limit':
      return (
        <span className="status-badge badge-warning" aria-label="Status: Near Limit">
          <AlertCircle size={13} />
          <span>Approaching (75%+)</span>
        </span>
      )
    case 'Almost Reached':
      return (
        <span className="status-badge badge-orange" aria-label="Status: Almost Reached Limit">
          <AlertTriangle size={13} />
          <span>Near Cap (90%+)</span>
        </span>
      )
    case 'Over Budget':
      return (
        <span className="status-badge badge-danger" aria-label="Status: Over Budget Limit">
          <ShieldAlert size={13} />
          <span>Exceeded Limit</span>
        </span>
      )
  }
}

const BudgetPerformance: React.FC<BudgetPerformanceProps> = ({ items }) => {
  const { formatAmount } = useFinance()

  if (!items || items.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Budget Utilization</h3>
            <p className="chart-subtitle">Category limits vs. actual expenditure</p>
          </div>
        </div>
        <div className="empty-chart-fallback" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No active budgets created yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Budget Utilization</h3>
          <p className="chart-subtitle">Category limits vs. actual expenditure</p>
        </div>
      </div>

      <div className="budget-performance-list">
        {items.map((item) => {
          const isOver = item.status === 'Over Budget'
          const displayPct = Math.min(item.usagePercentage, 100)

          return (
            <div key={item.id} className={`perf-item ${isOver ? 'perf-item-over' : ''}`}>
              <div className="perf-header">
                <div className="perf-left">
                  <span className="perf-cat-title">{item.category}</span>
                  {getStatusBadge(item.status)}
                </div>
                <div className="perf-amounts">
                  <span className="perf-spent">{formatAmount(item.spent)}</span>
                  <span className="perf-limit">/ {formatAmount(item.limit)}</span>
                </div>
              </div>

              <div className="progress-bar-wrap">
                <div
                  className={`progress-bar-track ${
                    isOver
                      ? 'track-danger'
                      : item.status === 'Almost Reached'
                      ? 'track-orange'
                      : item.status === 'Near Limit'
                      ? 'track-warning'
                      : 'track-healthy'
                  }`}
                  role="progressbar"
                  aria-valuenow={displayPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.category} budget usage: ${item.usagePercentage}%`}
                  style={{ width: `${displayPct}%` }}
                />
              </div>

              <div className="perf-footer">
                <span className={isOver ? 'text-danger-bold' : 'perf-pct'}>
                  {item.usagePercentage}% used
                </span>
                <span className={isOver ? 'text-danger' : 'text-muted'}>
                  {isOver
                    ? `${formatAmount(Math.abs(item.remaining))} over limit`
                    : `${formatAmount(item.remaining)} remaining`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BudgetPerformance
