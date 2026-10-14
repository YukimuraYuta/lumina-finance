import React from 'react'
import { Target, CheckCircle2 } from 'lucide-react'
import type { GoalProgressItem } from '../../types/analytics'
import { formatCurrency } from '../../utils/mockData'

interface GoalProgressProps {
  goals: GoalProgressItem[]
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Savings Goal Progress</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No active savings goals found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Savings Goal Progress</h3>
          <p className="chart-subtitle">Progress towards student milestone goals</p>
        </div>
      </div>

      <div className="goal-progress-list">
        {goals.map((goal) => {
          const isCompleted = goal.percentage >= 100
          const displayPct = Math.min(goal.percentage, 100)

          return (
            <div key={goal.id} className="goal-analytics-item">
              <div className="goal-header">
                <div className="goal-left">
                  <div className="goal-icon-badge" aria-hidden="true">
                    {isCompleted ? <CheckCircle2 size={16} /> : <Target size={16} />}
                  </div>
                  <span className="goal-title">{goal.title}</span>
                </div>
                <div className="goal-amounts">
                  <span className="goal-saved">{formatCurrency(goal.currentAmount)}</span>
                  <span className="goal-target">/ {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>

              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-track track-healthy"
                  role="progressbar"
                  aria-valuenow={displayPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${goal.title} progress: ${goal.percentage}%`}
                  style={{ width: `${displayPct}%` }}
                />
              </div>

              <div className="goal-footer">
                <span className="goal-pct">{goal.percentage}% saved</span>
                <span className="text-muted">
                  {isCompleted
                    ? 'Goal Achieved! 🎉'
                    : `${formatCurrency(goal.remainingAmount)} left to save`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GoalProgress
