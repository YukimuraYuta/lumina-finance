import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, Target, PiggyBank, TrendingUp, SearchX } from 'lucide-react'
import GoalCard from '../components/goals/GoalCard'
import GoalFormModal from '../components/goals/GoalFormModal'
import GoalContributeModal from '../components/goals/GoalContributeModal'
import DeleteGoalModal from '../components/goals/DeleteGoalModal'
import { useFinance } from '../hooks/useFinance'
import type { Goal } from '../types/finance'

const CATEGORIES = [
  'All',
  'Savings',
  'Electronics',
  'Education',
  'Travel',
  'Emergency',
  'Vehicle',
  'Other',
]

const Goals: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    formatAmount,
    loading,
    error,
    refreshData,
  } = useFinance()

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0)
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0)
    const totalRemaining = Math.max(totalTarget - totalSaved, 0)
    const rawProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
    const progress = Math.round(rawProgress * 10) / 10
    const completedCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      progress,
      completedCount,
    }
  }, [goals])

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchesSearch =
        searchTerm === '' ||
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.category && g.category.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCat =
        categoryFilter === 'All' ||
        (g.category && g.category.toLowerCase() === categoryFilter.toLowerCase())

      return matchesSearch && matchesCat
    })
  }, [goals, searchTerm, categoryFilter])

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All'

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('All')
  }

  // Handlers
  const handleSaveGoal = (
    goalData: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }
  ) => {
    if (goalData.id) {
      const existing = goals.find((g) => g.id === goalData.id)
      updateGoal({
        ...existing,
        ...goalData,
        currentAmount: goalData.currentAmount ?? existing?.currentAmount ?? 0,
      } as Goal)
    } else {
      addGoal(goalData)
    }
    setEditingGoal(null)
    setIsFormOpen(false)
  }

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleOpenContribute = (goal: Goal) => {
    setContributingGoal(goal)
    setIsContributeOpen(true)
  }

  const handleOpenDelete = (goal: Goal) => {
    setDeletingGoal(goal)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingGoal) return
    deleteGoal(deletingGoal.id)
    setDeletingGoal(null)
    setIsDeleteOpen(false)
  }

  return (
    <div className="goals-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">
            Set and track milestone financial targets with ease.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingGoal(null)
            setIsFormOpen(true)
          }}
          aria-label="Create Savings Goal"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </header>

      {/* Aggregate Metrics Grid */}
      <section className="dashboard-summary-grid" aria-label="Goals Summary Cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Target</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <Target size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount">{formatAmount(metrics.totalTarget)}</div>
            <div className="stat-card-subtitle">
              Across {goals.length} target milestone{goals.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Saved</span>
            <div className="stat-card-icon-wrap income-icon-wrap" aria-hidden="true">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount text-success">{formatAmount(metrics.totalSaved)}</div>
            <div className="stat-card-subtitle">
              {metrics.completedCount} of {goals.length} goals achieved
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Overall Progress</span>
            <div className="stat-card-icon-wrap expense-icon-wrap" aria-hidden="true">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount">{metrics.progress}%</div>
            <div className="stat-card-subtitle">
              {formatAmount(metrics.totalRemaining)} still required
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <div className="controls-card">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search goals by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search savings goals"
          />
        </div>

        <div className="filters-group">
          <div className="select-wrap">
            <Filter size={14} className="filter-icon" aria-hidden="true" />
            <select
              className="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#f87171',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
            onClick={() => refreshData()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Goals Grid */}
      {loading && goals.length === 0 ? (
        <div className="table-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 1rem',
              width: '32px',
              height: '32px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>
            Connecting and loading goals from server...
          </p>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="goals-grid">
          {filteredGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onContribute={handleOpenContribute}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="table-card empty-table-container">
          <div className="empty-state">
            {hasActiveFilters ? (
              <SearchX size={44} className="empty-icon" />
            ) : (
              <Target size={44} className="empty-icon" />
            )}
            <h3 className="empty-title">
              {hasActiveFilters ? 'No matching goals found' : 'No savings goals set'}
            </h3>
            <p className="empty-description">
              {hasActiveFilters
                ? 'Try adjusting your search terms or clearing your active category filter.'
                : 'Start saving for your dreams! Create milestone goals and track your progress step-by-step.'}
            </p>
            <div className="empty-actions">
              {hasActiveFilters ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingGoal(null)
                    setIsFormOpen(true)
                  }}
                >
                  <Plus size={16} />
                  <span>Create First Goal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <GoalFormModal
        isOpen={isFormOpen}
        initialData={editingGoal}
        onClose={() => {
          setIsFormOpen(false)
          setEditingGoal(null)
        }}
        onSubmit={handleSaveGoal}
      />

      {/* Deposit Funds Modal */}
      <GoalContributeModal
        isOpen={isContributeOpen}
        goal={contributingGoal}
        onClose={() => {
          setIsContributeOpen(false)
          setContributingGoal(null)
        }}
        onContribute={contributeToGoal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteGoalModal
        isOpen={isDeleteOpen}
        goalTitle={deletingGoal?.title}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingGoal(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Goals
