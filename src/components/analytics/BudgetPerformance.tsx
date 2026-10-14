import React from 'react'
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { BudgetPerformanceItem } from '../../types/analytics'
import { formatCurrency } from '../../utils/mockData'

interface BudgetPerformanceProps {
  items: BudgetPerformanceItem[]
}

const getStatusBadge = (status: BudgetPerformanceItem['status']) => {
  switch (status) {
    case 'Healthy':
      return (
        <span className="status-badge badge-healthy">
          <CheckCircle2 size={13} />
          <span>Healthy</span>
        </span>
      )
    case 'Near Limit':
      return (
        <span className="status-badge badge-warning">
          <AlertCircle size={13} />
          <span>Near Limit</span>
        </span>
      )
    case 'Almost Reached':
      return (
        <span className="status-badge badge-orange">
          <AlertTriangle size={13} />
          <span>Almost Reached</span>
        </span>
      )
    case 'Over Budget':
      return (
        <span className="status-badge badge-danger">
          <ShieldAlert size={13} />
          <span>Over Budget</span>
        </span>
      )
  }
}

const BudgetPerformance: React.FC<BudgetPerformanceProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Budget Performance</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No budgets created yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Budget Performance</h3>
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
                  <span className="perf-spent">{formatCurrency(item.spent)}</span>
                  <span className="perf-limit">/ {formatCurrency(item.limit)}</span>
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
                    ? `${formatCurrency(Math.abs(item.remaining))} over limit`
                    : `${formatCurrency(item.remaining)} remaining`}
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
