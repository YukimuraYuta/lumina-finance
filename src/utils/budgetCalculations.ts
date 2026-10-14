import type { Budget, BudgetStatus } from '../types/finance'

export interface BudgetMetrics {
  remaining: number
  usagePercentage: number
  displayPercentage: number
  status: BudgetStatus
  isOverBudget: boolean
}

export interface BudgetSummaryTotals {
  totalBudget: number
  totalSpent: number
  remaining: number
  usagePercentage: number
}

/**
 * Calculates budget health status based on percentage used
 */
export const calculateBudgetStatus = (spent: number, limit: number): BudgetStatus => {
  if (limit <= 0) return 'Over Budget'
  const usage = (spent / limit) * 100

  if (usage > 100) return 'Over Budget'
  if (usage >= 90) return 'Almost Reached'
  if (usage >= 70) return 'Near Limit'
  return 'Healthy'
}

/**
 * Computes metrics for an individual budget card
 */
export const calculateBudgetMetrics = (budget: Budget): BudgetMetrics => {
  const { spent, limit } = budget
  const remaining = limit - spent
  const rawPercentage = limit > 0 ? (spent / limit) * 100 : 100
  const usagePercentage = Math.round(rawPercentage * 10) / 10
  const displayPercentage = Math.min(Math.max(usagePercentage, 0), 100)
  const status = calculateBudgetStatus(spent, limit)

  return {
    remaining,
    usagePercentage,
    displayPercentage,
    status,
    isOverBudget: usagePercentage > 100,
  }
}

/**
 * Computes aggregate summary metrics for all active budgets
 */
export const calculateTotalBudgetSummary = (budgets: Budget[]): BudgetSummaryTotals => {
  if (!budgets || budgets.length === 0) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      usagePercentage: 0,
    }
  }

  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0)
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0)
  const remaining = totalBudget - totalSpent
  const rawUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const usagePercentage = Math.round(rawUsage * 10) / 10

  return {
    totalBudget,
    totalSpent,
    remaining,
    usagePercentage,
  }
}
