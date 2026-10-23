import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import type {
  Transaction,
  Budget,
  Goal,
  DashboardSummary,
  CategorySpending,
  DailySpending,
  UserProfile,
  ToastNotification,
} from '../types/finance'
import {
  mockDashboardData,
  mockBudgets as initialMockBudgets,
  mockGoals as initialMockGoals,
} from '../utils/mockData'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import { goalService } from '../services/goalService'

const STORAGE_KEYS = {
  TRANSACTIONS: 'lumina_transactions_v1',
  BUDGETS: 'lumina_budgets_v1',
  GOALS: 'lumina_goals_v1',
  USER_PROFILE: 'lumina_user_profile_v1',
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#8b5cf6',
  Transport: '#f59e0b',
  Education: '#3b82f6',
  Shopping: '#ec4899',
  Entertainment: '#10b981',
  Health: '#06b6d4',
  Bills: '#6366f1',
  Income: '#10b981',
  Other: '#64748b',
}

interface FinanceContextType {
  // State
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  user: UserProfile
  toast: ToastNotification | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  
  // Derived Data
  summary: DashboardSummary
  categorySpending: CategorySpending[]
  spendingTrends: DailySpending[]
  currency: string
  
  // Formatters
  formatAmount: (amount: number) => string
  
  // Transactions Actions
  addTransaction: (tx: Omit<Transaction, 'id'> & { id?: string }) => Promise<Transaction>
  updateTransaction: (tx: Transaction) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // Budgets Actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }) => Promise<Budget>
  updateBudget: (budget: Budget) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  
  // Goals Actions
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }) => Promise<Goal>
  updateGoal: (goal: Goal) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  contributeToGoal: (id: string, amount: number) => Promise<void>
  
  // Preferences & System Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void
  resetToDemoData: () => Promise<void>
  exportDataAsJSON: () => void
  exportTransactionsCSV: () => void
  
  // Notifications
  showToast: (message: string, type?: ToastNotification['type']) => void
  dismissToast: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const DEFAULT_USER: UserProfile = {
  name: 'Arnav',
  role: 'Student',
  currency: '₹',
  theme: 'system',
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return mockDashboardData.recentTransactions
  })

  // 2. Budgets State
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return initialMockBudgets
  })

  // 3. Goals State
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return initialMockGoals
  })

  // 4. User Profile State
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return DEFAULT_USER
  })

  // 5. Toast Notifications
  const [toast, setToast] = useState<ToastNotification | null>(null)

  // 6. Loading and Error State
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const showToast = useCallback((message: string, type: ToastNotification['type'] = 'success') => {
    const id = `toast-${Date.now()}`
    setToast({ id, message, type })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast])

  // Initial Data Fetching from Live Backend
  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [txResult, budgetResult, goalResult] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll(),
      ])

      setTransactions(txResult.transactions)
      setBudgets(budgetResult)
      setGoals(goalResult)
    } catch (err: any) {
      console.warn('Backend API connection warning (using local/cached state):', err.message)
      setError(err.message || 'Unable to connect to live server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Persist State to LocalStorage as cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
    } catch (e) {
      console.error('Failed saving transactions to storage', e)
    }
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
    } catch (e) {
      console.error('Failed saving budgets to storage', e)
    }
  }, [budgets])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
    } catch (e) {
      console.error('Failed saving goals to storage', e)
    }
  }, [goals])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user))
    } catch (e) {
      console.error('Failed saving user profile to storage', e)
    }

    // Apply theme
    if (user.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (user.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [user])

  // Format localized currency
  const formatAmount = useCallback(
    (amount: number) => {
      return `${user.currency}${amount.toLocaleString('en-IN')}`
    },
    [user.currency]
  )

  // Dynamic Dashboard Summary
  const summary: DashboardSummary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      currency: user.currency,
    }
  }, [transactions, user.currency])

  // Dynamic Category Spending
  const categorySpending: CategorySpending[] = useMemo(() => {
    const expenseTotals: Record<string, number> = {}
    let totalExpense = 0

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount
        totalExpense += t.amount
      })

    const categories = Object.keys(expenseTotals)
    if (categories.length === 0) {
      return mockDashboardData.categorySpending
    }

    return categories
      .map((cat) => ({
        category: cat,
        amount: expenseTotals[cat],
        color: CATEGORY_COLORS[cat] || '#8b5cf6',
        percentage:
          totalExpense > 0
            ? Math.round((expenseTotals[cat] / totalExpense) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  // Dynamic Spending Trends
  const spendingTrends: DailySpending[] = useMemo(() => {
    if (transactions.length === 0) {
      return mockDashboardData.spendingTrends
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayData: Record<string, { amount: number; income: number }> = {}
    days.forEach((d) => {
      dayData[d] = { amount: 0, income: 0 }
    })

    transactions.slice(0, 14).forEach((tx, idx) => {
      const day = days[idx % days.length]
      if (tx.type === 'expense') {
        dayData[day].amount += tx.amount
      } else {
        dayData[day].income += tx.amount
      }
    })

    return days.map((d) => ({
      day: d,
      amount: dayData[d].amount,
      income: dayData[d].income,
    }))
  }, [transactions])

  // --- Transaction Handlers ---
  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id'> & { id?: string }): Promise<Transaction> => {
      try {
        const created = await transactionService.create({
          description: txData.description,
          category: txData.category,
          amount: txData.amount,
          type: txData.type,
          date: txData.date,
          iconName: txData.iconName,
          notes: txData.notes,
        })
        setTransactions((prev) => [created, ...prev])
        showToast(`Added "${created.description}" (+${formatAmount(created.amount)})`, 'success')

        // Re-fetch budgets to sync dynamic spending calculations
        budgetService.getAll().then(setBudgets).catch(() => {})
        return created
      } catch (err: any) {
        showToast(err.message || 'Failed to create transaction', 'error')
        throw err
      }
    },
    [formatAmount, showToast]
  )

  const updateTransaction = useCallback(
    async (tx: Transaction): Promise<void> => {
      try {
        const updated = await transactionService.update(tx.id, tx)
        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? updated : t)))
        showToast(`Updated "${tx.description}"`, 'info')

        // Re-sync budgets
        budgetService.getAll().then(setBudgets).catch(() => {})
      } catch (err: any) {
        showToast(err.message || 'Failed to update transaction', 'error')
        throw err
      }
    },
    [showToast]
  )

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      try {
        await transactionService.delete(id)
        setTransactions((prev) => {
          const item = prev.find((t) => t.id === id)
          if (item) {
            showToast(`Deleted transaction "${item.description}"`, 'info')
          }
          return prev.filter((t) => t.id !== id)
        })

        // Re-sync budgets
        budgetService.getAll().then(setBudgets).catch(() => {})
      } catch (err: any) {
        showToast(err.message || 'Failed to delete transaction', 'error')
        throw err
      }
    },
    [showToast]
  )

  // --- Budget Handlers ---
  const addBudget = useCallback(
    async (budgetData: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }): Promise<Budget> => {
      try {
        const created = await budgetService.create({
          category: budgetData.category,
          limit: budgetData.limit,
          period: budgetData.period,
          startDate: budgetData.startDate,
          endDate: budgetData.endDate,
          notes: budgetData.notes,
        })
        setBudgets((prev) => [...prev, created])
        showToast(`Created budget for ${created.category}`, 'success')
        return created
      } catch (err: any) {
        showToast(err.message || 'Failed to create budget', 'error')
        throw err
      }
    },
    [showToast]
  )

  const updateBudget = useCallback(
    async (budget: Budget): Promise<void> => {
      try {
        const updated = await budgetService.update(budget.id, budget)
        setBudgets((prev) => prev.map((b) => (b.id === budget.id ? updated : b)))
        showToast(`Updated ${budget.category} budget`, 'info')
      } catch (err: any) {
        showToast(err.message || 'Failed to update budget', 'error')
        throw err
      }
    },
    [showToast]
  )

  const deleteBudget = useCallback(
    async (id: string): Promise<void> => {
      try {
        await budgetService.delete(id)
        setBudgets((prev) => {
          const item = prev.find((b) => b.id === id)
          if (item) {
            showToast(`Removed budget for ${item.category}`, 'info')
          }
          return prev.filter((b) => b.id !== id)
        })
      } catch (err: any) {
        showToast(err.message || 'Failed to delete budget', 'error')
        throw err
      }
    },
    [showToast]
  )

  // --- Goals Handlers ---
  const addGoal = useCallback(
    async (goalData: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }): Promise<Goal> => {
      try {
        const created = await goalService.create({
          title: goalData.title,
          targetAmount: goalData.targetAmount,
          currentAmount: goalData.currentAmount,
          deadline: goalData.deadline,
          category: goalData.category,
          color: goalData.color,
        })
        setGoals((prev) => [...prev, created])
        showToast(`Created milestone goal: ${created.title}`, 'success')
        return created
      } catch (err: any) {
        showToast(err.message || 'Failed to create goal', 'error')
        throw err
      }
    },
    [showToast]
  )

  const updateGoal = useCallback(
    async (goal: Goal): Promise<void> => {
      try {
        const updated = await goalService.update(goal.id, goal)
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)))
        showToast(`Updated goal: ${goal.title}`, 'info')
      } catch (err: any) {
        showToast(err.message || 'Failed to update goal', 'error')
        throw err
      }
    },
    [showToast]
  )

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      try {
        await goalService.delete(id)
        setGoals((prev) => {
          const item = prev.find((g) => g.id === id)
          if (item) {
            showToast(`Removed goal "${item.title}"`, 'info')
          }
          return prev.filter((g) => g.id !== id)
        })
      } catch (err: any) {
        showToast(err.message || 'Failed to delete goal', 'error')
        throw err
      }
    },
    [showToast]
  )

  const contributeToGoal = useCallback(
    async (id: string, amount: number): Promise<void> => {
      if (amount <= 0) return
      try {
        const updated = await goalService.contribute(id, amount)
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
        showToast(`Added ${formatAmount(amount)} to "${updated.title}"! 🎉`, 'success')
      } catch (err: any) {
        showToast(err.message || 'Failed to contribute to goal', 'error')
        throw err
      }
    },
    [formatAmount, showToast]
  )

  // --- User Profile & Preferences Handlers ---
  const updateUserProfile = useCallback(
    (profile: Partial<UserProfile>) => {
      setUser((prev) => {
        const updated = { ...prev, ...profile }
        showToast('Settings saved successfully', 'success')
        return updated
      })
    },
    [showToast]
  )

  const resetToDemoData = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
    localStorage.removeItem(STORAGE_KEYS.BUDGETS)
    localStorage.removeItem(STORAGE_KEYS.GOALS)
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE)
    setTransactions(mockDashboardData.recentTransactions)
    setBudgets(initialMockBudgets)
    setGoals(initialMockGoals)
    setUser(DEFAULT_USER)
    showToast('Reset data to initial demo state', 'info')
  }, [showToast])

  const exportDataAsJSON = useCallback(() => {
    const data = {
      user,
      transactions,
      budgets,
      goals,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lumina_finance_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported finance data as JSON', 'success')
  }, [user, transactions, budgets, goals, showToast])

  const exportTransactionsCSV = useCallback(() => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'warning')
      return
    }

    const headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']
    const rows = transactions.map((t) => [
      t.id,
      `"${t.date}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `lumina_transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported transactions as CSV', 'success')
  }, [transactions, showToast])

  const contextValue = useMemo<FinanceContextType>(
    () => ({
      transactions,
      budgets,
      goals,
      user,
      toast,
      loading,
      error,
      refreshData,
      summary,
      categorySpending,
      spendingTrends,
      currency: user.currency,
      formatAmount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      updateUserProfile,
      resetToDemoData,
      exportDataAsJSON,
      exportTransactionsCSV,
      showToast,
      dismissToast,
    }),
    [
      transactions,
      budgets,
      goals,
      user,
      toast,
      loading,
      error,
      refreshData,
      summary,
      categorySpending,
      spendingTrends,
      formatAmount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      updateUserProfile,
      resetToDemoData,
      exportDataAsJSON,
      exportTransactionsCSV,
      showToast,
      dismissToast,
    ]
  )

  return <FinanceContext.Provider value={contextValue}>{children}</FinanceContext.Provider>
}

export { FinanceContext }
export type { FinanceContextType }
