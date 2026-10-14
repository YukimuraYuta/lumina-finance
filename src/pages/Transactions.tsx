import React, { useState, useMemo } from 'react'
import { Search, Plus, Filter, Download, ArrowUpDown } from 'lucide-react'
import TransactionTable from '../components/transactions/TransactionTable'
import TransactionForm from '../components/transactions/TransactionForm'
import DeleteConfirmModal from '../components/transactions/DeleteConfirmModal'
import { useFinance } from '../hooks/useFinance'
import type { Transaction, TransactionType } from '../types/finance'

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Entertainment',
  'Income',
  'Other',
]

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

const Transactions: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    exportTransactionsCSV,
  } = useFinance()

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')

  // Modal & Edit/Delete state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)

  // Filtered & Sorted transactions computation
  const filteredTransactions = useMemo(() => {
    const list = transactions.filter((tx) => {
      // 1. Search filter
      const matchesSearch =
        searchTerm === '' ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())

      // 2. Type filter
      const matchesType = typeFilter === 'all' || tx.type === typeFilter

      // 3. Category filter
      const matchesCategory =
        categoryFilter === 'All' ||
        tx.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesType && matchesCategory
    })

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'date-asc':
          return a.date.localeCompare(b.date)
        case 'date-desc':
        default:
          return b.date.localeCompare(a.date)
      }
    })
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy])

  const hasActiveFilters =
    searchTerm !== '' || typeFilter !== 'all' || categoryFilter !== 'All'

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('All')
    setSortBy('date-desc')
  }

  // Add / Edit submission handler
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'> & { id?: string }
  ) => {
    if (txData.id) {
      updateTransaction(txData as Transaction)
    } else {
      addTransaction(txData)
    }
    setEditingTx(null)
    setIsFormOpen(false)
  }

  // Open Edit Dialog
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setIsFormOpen(true)
  }

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (tx: Transaction) => {
    setDeletingTx(tx)
    setIsDeleteOpen(true)
  }

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingTx) return
    deleteTransaction(deletingTx.id)
    setDeletingTx(null)
    setIsDeleteOpen(false)
  }

  return (
    <div className="transactions-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Track and manage your dynamic income and expenses.
          </p>
        </div>

        <div className="header-actions-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportTransactionsCSV}
            aria-label="Export Transactions to CSV"
            title="Download CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingTx(null)
              setIsFormOpen(true)
            }}
            aria-label="Add Transaction"
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </header>

      {/* Controls Bar: Search & Filters */}
      <div className="controls-card">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search transactions"
          />
        </div>

        <div className="filters-group">
          {/* Type Filter Buttons */}
          <div className="filter-type-toggle" role="group" aria-label="Type filter">
            <button
              type="button"
              className={`filter-btn ${typeFilter === 'all' ? 'filter-btn-active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${typeFilter === 'income' ? 'filter-btn-active' : ''}`}
              onClick={() => setTypeFilter('income')}
            >
              Income
            </button>
            <button
              type="button"
              className={`filter-btn ${typeFilter === 'expense' ? 'filter-btn-active' : ''}`}
              onClick={() => setTypeFilter('expense')}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="select-wrap">
            <Filter size={14} className="filter-icon" aria-hidden="true" />
            <select
              className="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Category filter"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="select-wrap">
            <ArrowUpDown size={14} className="filter-icon" aria-hidden="true" />
            <select
              className="category-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort transactions"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table / List Component */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={() => {
          setEditingTx(null)
          setIsFormOpen(true)
        }}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Form Modal (Add & Edit) */}
      <TransactionForm
        isOpen={isFormOpen}
        initialData={editingTx}
        onClose={() => {
          setIsFormOpen(false)
          setEditingTx(null)
        }}
        onSubmit={handleSaveTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        transactionDescription={deletingTx?.description}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingTx(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default Transactions
