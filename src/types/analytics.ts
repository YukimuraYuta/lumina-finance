import type { BudgetStatus } from './finance'

export type PeriodType = 'week' | 'month' | 'quarter' | 'year'

export interface AnalyticsSummary {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
}

export interface SpendingDataPoint {
  date: string
  amount: number
}

export interface IncomeExpenseDataPoint {
  period: string
  income: number
  expenses: number
}

export interface CategoryBreakdownItem {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface TopCategoryItem {
  category: string
  amount: number
  percentage: number
  color: string
  iconName?: string
}

export interface BudgetPerformanceItem {
  id: string
  category: string
  limit: number
  spent: number
  remaining: number
  usagePercentage: number
  status: BudgetStatus
}

export interface GoalProgressItem {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  percentage: number
  remainingAmount: number
}

export interface FinancialInsight {
  id: string
  title: string
  description: string
  type: 'warning' | 'info' | 'success'
  category?: string
}
