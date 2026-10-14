import React from 'react'
import { Target, CheckCircle2, Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import type { Goal } from '../../types/finance'
import { useFinance } from '../../hooks/useFinance'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (goal: Goal) => void
  onContribute: (goal: Goal) => void
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
}) => {
  const { formatAmount } = useFinance()

  const rawPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  const percentage = Math.round(rawPercentage * 10) / 10
  const displayPercentage = Math.min(percentage, 100)
  const isCompleted = percentage >= 100
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)

  return (
    <div className={`goal-card ${isCompleted ? 'goal-card-completed' : ''}`}>
      <div className="goal-card-header">
        <div className="goal-card-left">
          <div
            className="goal-avatar-icon"
            style={{
              backgroundColor: `${goal.color || '#3b82f6'}20`,
              color: goal.color || '#3b82f6',
              borderColor: `${goal.color || '#3b82f6'}40`,
            }}
          >
            {isCompleted ? <CheckCircle2 size={18} /> : <Target size={18} />}
          </div>
          <div>
            <h3 className="goal-card-title">{goal.title}</h3>
            {goal.category && <span className="goal-category-badge">{goal.category}</span>}
          </div>
        </div>

        <div className="goal-card-actions">
          <button
            type="button"
            className="icon-action-btn"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.title}`}
            title="Edit Goal"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="icon-action-btn delete-action-btn"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.title}`}
            title="Delete Goal"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="goal-card-amounts">
        <div className="amount-col">
          <span className="amount-label">Saved</span>
          <span className="amount-val text-success">{formatAmount(goal.currentAmount)}</span>
        </div>
        <div className="amount-col text-right">
          <span className="amount-label">Target</span>
          <span className="amount-val">{formatAmount(goal.targetAmount)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-track"
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: goal.color || '#3b82f6',
          }}
          role="progressbar"
          aria-valuenow={displayPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.title} progress: ${percentage}%`}
        />
      </div>

      <div className="goal-card-meta">
        <span className="goal-progress-pct">{percentage}% Achieved</span>
        <span className="goal-remaining-text">
          {isCompleted ? 'Goal Completed! 🎉' : `${formatAmount(remaining)} needed`}
        </span>
      </div>

      <div className="goal-card-footer">
        {goal.deadline ? (
          <div className="goal-deadline-info">
            <Calendar size={13} />
            <span>Target: {goal.deadline}</span>
          </div>
        ) : (
          <div className="goal-deadline-info text-muted">No deadline set</div>
        )}

        <button
          type="button"
          className="btn-contribute"
          onClick={() => onContribute(goal)}
          aria-label={`Add funds to ${goal.title}`}
        >
          <Plus size={14} />
          <span>Contribute</span>
        </button>
      </div>
    </div>
  )
}

export default GoalCard
