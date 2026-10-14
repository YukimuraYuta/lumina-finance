import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, Wallet, PieChart, TrendingDown, PiggyBank, SearchX } from 'lucide-react'
import BudgetCard from '../components/budgets/BudgetCard'
import BudgetForm from '../components/budgets/BudgetForm'
import DeleteBudgetModal from '../components/budgets/DeleteBudgetModal'
import { calculateTotalBudgetSummary } from '../utils/budgetCalculations'
import { useFinance } from '../hooks/useFinance'
import type { Budget } from '../types/finance'

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Other',
]

const Budgets: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, formatAmount } = useFinance()

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals & Active Budget State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)

  // Calculated Aggregate Metrics
  const totals = useMemo(() => {
    return calculateTotalBudgetSummary(budgets)
  }, [budgets])

  // Filtered Budgets Computation
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        searchTerm === '' ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'All' ||
        b.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [budgets, searchTerm, categoryFilter])

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All'

  const handleClearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('All')
  }

  // Add / Edit Submission Handler
  const handleSaveBudget = (
    budgetData: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }
  ) => {
    if (budgetData.id) {
      const existing = budgets.find((b) => b.id === budgetData.id)
      updateBudget({
        ...existing,
        ...budgetData,
        spent: budgetData.spent ?? existing?.spent ?? 0,
      } as Budget)
    } else {
      addBudget(budgetData)
    }
    setEditingBudget(null)
    setIsFormOpen(false)
  }

  // Open Edit Form
  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsFormOpen(true)
  }

  // Open Delete Confirmation
  const handleOpenDelete = (budget: Budget) => {
    setDeletingBudget(budget)
    setIsDeleteOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingBudget) return
    deleteBudget(deletingBudget.id)
    setDeletingBudget(null)
    setIsDeleteOpen(false)
  }

  return (
    <div className="budgets-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set spending limits and stay on track with real-time tracking.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingBudget(null)
            setIsFormOpen(true)
          }}
        >
          <Plus size={18} />
          <span>Create Budget</span>
        </button>
      </header>

      {/* Aggregate Summary Cards */}
      <section className="dashboard-summary-grid" aria-label="Budget Totals Summary">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Budget</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount">{formatAmount(totals.totalBudget)}</div>
            <div className="stat-card-subtitle">Combined category limits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Spent</span>
            <div className="stat-card-icon-wrap expense-icon-wrap" aria-hidden="true">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount text-danger">
              {formatAmount(totals.totalSpent)}
            </div>
            <div className="stat-card-subtitle">Calculated live from expenses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Remaining</span>
            <div className="stat-card-icon-wrap income-icon-wrap" aria-hidden="true">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className={`stat-card-amount ${totals.remaining < 0 ? 'text-danger' : 'text-success'}`}>
              {formatAmount(totals.remaining)}
            </div>
            <div className="stat-card-subtitle">
              Overall Usage: <strong>{totals.usagePercentage}%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Bar: Search & Category Filter */}
      <div className="controls-card">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search budgets by category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search budgets"
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
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budgets Grid / List */}
      {filteredBudgets.length > 0 ? (
        <div className="budgets-grid">
          {filteredBudgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
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
              <PieChart size={44} className="empty-icon" />
            )}
            <h3 className="empty-title">
              {hasActiveFilters ? 'No budgets found' : 'No budgets yet'}
            </h3>
            <p className="empty-description">
              {hasActiveFilters
                ? 'Try adjusting your search query or resetting your active category filter.'
                : 'Create your first budget to start tracking your category spending limits.'}
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
                    setEditingBudget(null)
                    setIsFormOpen(true)
                  }}
                >
                  <Plus size={16} />
                  <span>Create Budget</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <BudgetForm
        isOpen={isFormOpen}
        initialData={editingBudget}
        onClose={() => {
          setIsFormOpen(false)
          setEditingBudget(null)
        }}
        onSubmit={handleSaveBudget}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBudgetModal
        isOpen={isDeleteOpen}
        categoryName={deletingBudget?.category}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingBudget(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Budgets
