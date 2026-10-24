import type { BudgetStatus } from './finance'
import type { PeriodType } from '../utils/dateRange'

export type { PeriodType }

export interface AnalyticsSummary {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
}

export interface SpendingDataPoint {
  date: string
  amount: number
  period?: string
  income?: number
}

export interface IncomeExpenseDataPoint {
  period: string
  income: number
  expenses: number
  netCashFlow?: number
}

export interface TrendDataPoint {
  date: string
  period: string
  income: number
  expenses: number
  amount: number
  netCashFlow: number
}

export interface CategoryBreakdownItem {
  category: string
  amount: number
  percentage: number
  color: string
  count?: number
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
  deadline?: string
  category?: string
  color?: string
}

export interface FinancialInsight {
  id: string
  title: string
  description: string
  type: 'warning' | 'info' | 'success'
  category?: string
  metric?: string
}

export interface AnalyticsOverview {
  dateRange: {
    startDate: string
    endDate: string
    prevStartDate: string
    prevEndDate: string
    period: string
  }
  current: {
    totalIncome: number
    totalExpenses: number
    netCashFlow: number
    savingsRate: number
    incomeCount: number
    expenseCount: number
    transactionCount: number
  }
  previous: {
    totalIncome: number
    totalExpenses: number
    netCashFlow: number
    savingsRate: number
  }
  changes: {
    incomeChange: number
    expenseChange: number
    savingsRateChange: number
  }
  budgets: {
    totalLimit: number
    totalSpent: number
    totalRemaining: number
    utilizationPercentage: number
    activeCount: number
  }
  goals: {
    totalTarget: number
    totalSaved: number
    totalRemaining: number
    progressPercentage: number
    activeCount: number
  }
}

export interface AnalyticsQueryParams {
  startDate?: string
  endDate?: string
  period?: PeriodType
  interval?: 'daily' | 'monthly'
}
