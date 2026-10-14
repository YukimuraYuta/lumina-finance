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
  
  // Derived Data
  summary: DashboardSummary
  categorySpending: CategorySpending[]
  spendingTrends: DailySpending[]
  currency: string
  
  // Formatters
  formatAmount: (amount: number) => string
  
  // Transactions Actions
  addTransaction: (tx: Omit<Transaction, 'id'> & { id?: string }) => Transaction
  updateTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  
  // Budgets Actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }) => Budget
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  
  // Goals Actions
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }) => Goal
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void
  
  // Preferences & System Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void
  resetToDemoData: () => void
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

  // Persist State to LocalStorage
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

  // Dynamic budgets with spending calculated from transactions
  const activeBudgets = useMemo(() => {
    return budgets.map((b) => {
      const categorySpent = transactions
        .filter((t) => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        ...b,
        spent: categorySpent > 0 ? categorySpent : b.spent,
      }
    })
  }, [budgets, transactions])

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
    // If no transactions, fallback to mock trends
    if (transactions.length === 0) {
      return mockDashboardData.spendingTrends
    }

    // Default template days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayData: Record<string, { amount: number; income: number }> = {}
    days.forEach((d) => {
      dayData[d] = { amount: 0, income: 0 }
    })

    // Populate from recent transactions
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
    (txData: Omit<Transaction, 'id'> & { id?: string }): Transaction => {
      const newTx: Transaction = {
        ...txData,
        id: txData.id || `tx-${Date.now()}`,
      }
      setTransactions((prev) => [newTx, ...prev])
      showToast(`Added "${newTx.description}" (+${formatAmount(newTx.amount)})`, 'success')
      return newTx
    },
    [formatAmount, showToast]
  )

  const updateTransaction = useCallback(
    (tx: Transaction) => {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)))
      showToast(`Updated "${tx.description}"`, 'info')
    },
    [showToast]
  )

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const item = prev.find((t) => t.id === id)
        const updated = prev.filter((t) => t.id !== id)
        if (item) {
          showToast(`Deleted transaction "${item.description}"`, 'info')
        }
        return updated
      })
    },
    [showToast]
  )

  // --- Budget Handlers ---
  const addBudget = useCallback(
    (budgetData: Omit<Budget, 'id' | 'spent'> & { id?: string; spent?: number }): Budget => {
      const newBudget: Budget = {
        ...budgetData,
        id: budgetData.id || `b-${Date.now()}`,
        spent: budgetData.spent ?? 0,
      }
      setBudgets((prev) => [...prev, newBudget])
      showToast(`Created budget for ${newBudget.category}`, 'success')
      return newBudget
    },
    [showToast]
  )

  const updateBudget = useCallback(
    (budget: Budget) => {
      setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)))
      showToast(`Updated ${budget.category} budget`, 'info')
    },
    [showToast]
  )

  const deleteBudget = useCallback(
    (id: string) => {
      setBudgets((prev) => {
        const item = prev.find((b) => b.id === id)
        const updated = prev.filter((b) => b.id !== id)
        if (item) {
          showToast(`Removed budget for ${item.category}`, 'info')
        }
        return updated
      })
    },
    [showToast]
  )

  // --- Goals Handlers ---
  const addGoal = useCallback(
    (goalData: Omit<Goal, 'id' | 'currentAmount'> & { id?: string; currentAmount?: number }): Goal => {
      const newGoal: Goal = {
        ...goalData,
        id: goalData.id || `g-${Date.now()}`,
        currentAmount: goalData.currentAmount ?? 0,
        color: goalData.color || '#3b82f6',
      }
      setGoals((prev) => [...prev, newGoal])
      showToast(`Created milestone goal: ${newGoal.title}`, 'success')
      return newGoal
    },
    [showToast]
  )

  const updateGoal = useCallback(
    (goal: Goal) => {
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)))
      showToast(`Updated goal: ${goal.title}`, 'info')
    },
    [showToast]
  )

  const deleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => {
        const item = prev.find((g) => g.id === id)
        const updated = prev.filter((g) => g.id !== id)
        if (item) {
          showToast(`Removed goal "${item.title}"`, 'info')
        }
        return updated
      })
    },
    [showToast]
  )

  const contributeToGoal = useCallback(
    (id: string, amount: number) => {
      if (amount <= 0) return
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const nextAmount = g.currentAmount + amount
            showToast(`Added ${formatAmount(amount)} to "${g.title}"! 🎉`, 'success')
            return { ...g, currentAmount: nextAmount }
          }
          return g
        })
      )
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

  const resetToDemoData = useCallback(() => {
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
      budgets: activeBudgets,
      goals,
      user,
      toast,
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
      activeBudgets,
      goals,
      user,
      toast,
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
