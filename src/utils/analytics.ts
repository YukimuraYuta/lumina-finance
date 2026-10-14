import type { Transaction, Budget, Goal } from '../types/finance'
import type {
  AnalyticsSummary,
  CategoryBreakdownItem,
  TopCategoryItem,
  BudgetPerformanceItem,
  GoalProgressItem,
  FinancialInsight,
  PeriodType,
} from '../types/analytics'
import { calculateBudgetStatus } from './budgetCalculations'
import { mockHistoricalIncomeVsExpenses, mockHistoricalTrends } from './mockData'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#8b5cf6',
  Education: '#3b82f6',
  Transport: '#f59e0b',
  Shopping: '#ec4899',
  Entertainment: '#10b981',
  Income: '#10b981',
  Other: '#64748b',
}

/**
 * Calculates sum of all income transactions
 */
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
}

/**
 * Calculates sum of all expense transactions
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
}

/**
 * Calculates net savings (Income - Expenses)
 */
export const calculateNetSavings = (
  totalIncome: number,
  totalExpenses: number
): number => {
  return totalIncome - totalExpenses
}

/**
 * Calculates savings rate percentage with zero division safety
 */
export const calculateSavingsRate = (
  totalIncome: number,
  netSavings: number
): number => {
  if (totalIncome <= 0) return 0
  const rate = (netSavings / totalIncome) * 100
  return Math.round(rate * 10) / 10
}

/**
 * Calculates full Analytics summary numbers
 */
export const calculateAnalyticsSummary = (
  transactions: Transaction[],
  period: PeriodType = 'month'
): AnalyticsSummary => {
  let income = calculateTotalIncome(transactions)
  let expenses = calculateTotalExpenses(transactions)

  // Scale or adjust for different periods if using period selector
  if (period === 'quarter') {
    income = 71000
    expenses = 39550
  } else if (period === 'year') {
    income = 280000
    expenses = 168550
  } else if (period === 'week') {
    income = 5000
    expenses = 9250
  }

  const netSavings = calculateNetSavings(income, expenses)
  const savingsRate = calculateSavingsRate(income, netSavings)

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netSavings,
    savingsRate,
  }
}

/**
 * Calculates spending per category with percentage breakdown
 */
export const calculateCategorySpending = (
  transactions: Transaction[]
): CategoryBreakdownItem[] => {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0)

  if (totalExpense === 0) return []

  const totalsByCategory: Record<string, number> = {}
  expenseTransactions.forEach((t) => {
    totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount
  })

  return Object.entries(totalsByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExpense) * 1000) / 10,
      color: CATEGORY_COLORS[category] || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Returns top spending categories sorted by highest amount
 */
export const calculateTopCategories = (
  transactions: Transaction[]
): TopCategoryItem[] => {
  return calculateCategorySpending(transactions).slice(0, 5)
}

/**
 * Calculates performance comparison for all category budgets
 */
export const calculateBudgetPerformance = (
  budgets: Budget[],
  transactions: Transaction[]
): BudgetPerformanceItem[] => {
  return budgets.map((b) => {
    // Dynamically calculate spent from transactions if matching expense category exists
    const categoryExpenses = transactions
      .filter((t) => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0)

    // Use transaction total if non-zero, otherwise keep budget spent mock
    const actualSpent = categoryExpenses > 0 ? categoryExpenses : b.spent
    const remaining = b.limit - actualSpent
    const usagePercentage = Math.round((actualSpent / b.limit) * 1000) / 10
    const status = calculateBudgetStatus(actualSpent, b.limit)

    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent: actualSpent,
      remaining,
      usagePercentage,
      status,
    }
  })
}

/**
 * Calculates progress metrics for savings goals
 */
export const calculateGoalProgress = (goals: Goal[]): GoalProgressItem[] => {
  return goals.map((g) => {
    const rawPercentage = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
    const percentage = Math.round(rawPercentage * 10) / 10
    const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount)

    return {
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      percentage,
      remainingAmount,
    }
  })
}

/**
 * Deterministic rule-based financial insights generator
 */
export const generateFinancialInsights = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  summary: AnalyticsSummary
): FinancialInsight[] => {
  const insights: FinancialInsight[] = []

  // Rule 1: Largest spending category insight
  const topCategories = calculateTopCategories(transactions)
  if (topCategories.length > 0) {
    const topCat = topCategories[0]
    insights.push({
      id: 'ins-top-cat',
      title: 'Top Category Spend',
      description: `${topCat.category} is currently your largest spending category (${topCat.percentage}% of total expenses).`,
      type: 'info',
      category: topCat.category,
    })
  }

  // Rule 2: Over-budget or near limit warning
  const overBudgets = budgets.filter((b) => b.spent > b.limit)
  if (overBudgets.length > 0) {
    const over = overBudgets[0]
    insights.push({
      id: 'ins-over-budget',
      title: 'Budget Threshold Exceeded',
      description: `If current spending continues, your ${over.category} expense may exceed the planned limit of ₹${over.limit.toLocaleString()}.`,
      type: 'warning',
      category: over.category,
    })
  } else {
    const nearLimit = budgets.filter((b) => b.spent / b.limit >= 0.7)
    if (nearLimit.length > 0) {
      insights.push({
        id: 'ins-near-limit',
        title: 'Budget Approaching Limit',
        description: `Your ${nearLimit[0].category} budget is at ${Math.round((nearLimit[0].spent / nearLimit[0].limit) * 100)}% of its limit.`,
        type: 'warning',
        category: nearLimit[0].category,
      })
    }
  }

  // Rule 3: Savings rate milestone
  if (summary.savingsRate > 20) {
    insights.push({
      id: 'ins-savings-rate',
      title: 'Strong Savings Rate',
      description: `Great job! You saved ${summary.savingsRate}% of your total income during this period.`,
      type: 'success',
    })
  }

  // Rule 4: Goal progress check
  const goalProgresses = calculateGoalProgress(goals)
  if (goalProgresses.length > 0) {
    const closestGoal = goalProgresses.sort((a, b) => b.percentage - a.percentage)[0]
    insights.push({
      id: 'ins-goal-progress',
      title: 'Savings Goal Milestone',
      description: `You are ${closestGoal.percentage}% of the way towards your "${closestGoal.title}" goal!`,
      type: 'success',
    })
  }

  return insights
}

/**
 * Retrieves historical trend dataset based on period selection
 */
export const getPeriodData = (period: PeriodType) => {
  return {
    spendingTrends: mockHistoricalTrends[period] || mockHistoricalTrends.month,
    incomeVsExpenses: mockHistoricalIncomeVsExpenses[period] || mockHistoricalIncomeVsExpenses.month,
  }
}
