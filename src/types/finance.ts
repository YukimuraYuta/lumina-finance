export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  category: string
  amount: number
  type: TransactionType
  date: string
  iconName?: string
  notes?: string
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'custom'

export type BudgetStatus = 'Healthy' | 'Near Limit' | 'Almost Reached' | 'Over Budget'

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: BudgetPeriod
  startDate: string
  endDate?: string
  notes?: string
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category?: string
  color?: string
}

export interface CategorySpending {
  category: string
  amount: number
  color: string
  percentage?: number
}

export interface DailySpending {
  day: string
  amount: number
  income?: number
}

export interface DashboardSummary {
  balance: number
  income: number
  expenses: number
  currency: string
}

export interface FinanceDashboardData {
  summary: DashboardSummary
  recentTransactions: Transaction[]
  categorySpending: CategorySpending[]
  spendingTrends: DailySpending[]
  budgets?: Budget[]
  goals?: Goal[]
}

export interface UserProfile {
  name: string
  role: string
  currency: string
  theme: 'dark' | 'light' | 'system'
}

export interface ToastNotification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}
