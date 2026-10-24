import type { Transaction, Budget, Goal } from '../types/finance'
import type {
  AnalyticsSummary,
  CategoryBreakdownItem,
  TopCategoryItem,
  BudgetPerformanceItem,
  GoalProgressItem,
  FinancialInsight,
  PeriodType,
  TrendDataPoint,
} from '../types/analytics'
import { calculateBudgetStatus } from './budgetCalculations'
import { resolveDateRange } from './dateRange'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#8b5cf6',
  Education: '#3b82f6',
  Transport: '#f59e0b',
  Shopping: '#ec4899',
  Entertainment: '#10b981',
  Health: '#06b6d4',
  Bills: '#6366f1',
  Income: '#10b981',
  Other: '#64748b',
}

/**
 * Filter transactions falling inside a specific date interval
 */
export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: PeriodType = 'month',
  customStart?: string,
  customEnd?: string
): Transaction[] => {
  const { startDate, endDate } = resolveDateRange(period, customStart, customEnd)
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  return transactions.filter((t) => {
    const tTime = new Date(t.date).getTime()
    return tTime >= startTime && tTime <= endTime
  })
}

/**
 * Calculates sum of all income transactions with decimal safety
 */
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  const total = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  return Number(total.toFixed(2))
}

/**
 * Calculates sum of all expense transactions with decimal safety
 */
export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  const total = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  return Number(total.toFixed(2))
}

/**
 * Calculates net savings (Income - Expenses)
 */
export const calculateNetSavings = (
  totalIncome: number,
  totalExpenses: number
): number => {
  return Number((totalIncome - totalExpenses).toFixed(2))
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
  return Number(rate.toFixed(1))
}

/**
 * Calculates full Analytics summary numbers based entirely on real user transactions
 */
export const calculateAnalyticsSummary = (
  transactions: Transaction[],
  period: PeriodType = 'month',
  customStart?: string,
  customEnd?: string
): AnalyticsSummary => {
  const filtered = filterTransactionsByPeriod(transactions, period, customStart, customEnd)
  const income = calculateTotalIncome(filtered)
  const expenses = calculateTotalExpenses(filtered)
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
 * Calculates spending per category with percentage breakdown from actual transactions
 */
export const calculateCategorySpending = (
  transactions: Transaction[]
): CategoryBreakdownItem[] => {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')
  const totalExpense = expenseTransactions.reduce(
    (acc, t) => acc + Number(t.amount || 0),
    0
  )

  if (totalExpense === 0) return []

  const totalsByCategory: Record<string, { amount: number; count: number }> = {}
  expenseTransactions.forEach((t) => {
    const cat = t.category || 'Other'
    const amt = Number(t.amount || 0)
    const existing = totalsByCategory[cat] || { amount: 0, count: 0 }
    totalsByCategory[cat] = {
      amount: existing.amount + amt,
      count: existing.count + 1,
    }
  })

  return Object.entries(totalsByCategory)
    .map(([category, data]) => ({
      category,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: Number(((data.amount / totalExpense) * 100).toFixed(1)),
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
    const categoryExpenses = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category.toLowerCase() === b.category.toLowerCase()
      )
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const actualSpent = categoryExpenses > 0 ? categoryExpenses : Number(b.spent || 0)
    const remaining = Math.max(0, Number((b.limit - actualSpent).toFixed(2)))
    const usagePercentage =
      b.limit > 0 ? Math.round((actualSpent / b.limit) * 100) : 0
    const status = calculateBudgetStatus(actualSpent, b.limit)

    return {
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent: Number(actualSpent.toFixed(2)),
      remaining,
      usagePercentage,
      status,
    }
  })
}

/**
 * Calculates progress metrics for savings goals safely
 */
export const calculateGoalProgress = (goals: Goal[]): GoalProgressItem[] => {
  return goals.map((g) => {
    const rawPercentage =
      g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
    const percentage = Math.min(100, Math.round(rawPercentage))
    const remainingAmount = Math.max(
      0,
      Number((g.targetAmount - g.currentAmount).toFixed(2))
    )

    return {
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      percentage,
      remainingAmount,
      deadline: g.deadline,
      category: g.category,
      color: g.color || '#3b82f6',
    }
  })
}

/**
 * Computes dynamic trends directly from user's actual transactions
 */
export const calculateTrendsFromTransactions = (
  transactions: Transaction[],
  period: PeriodType = 'month',
  customStart?: string,
  customEnd?: string
): TrendDataPoint[] => {
  const { startDate, endDate } = resolveDateRange(period, customStart, customEnd)
  const diffDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const isDaily = diffDays <= 35

  const filtered = transactions.filter((t) => {
    const time = new Date(t.date).getTime()
    return time >= startDate.getTime() && time <= endDate.getTime()
  })

  if (isDaily) {
    const dayMap = new Map<
      string,
      { income: number; expenses: number; netCashFlow: number }
    >()
    const curr = new Date(startDate)
    while (curr <= endDate) {
      const key = curr.toISOString().split('T')[0]
      dayMap.set(key, { income: 0, expenses: 0, netCashFlow: 0 })
      curr.setDate(curr.getDate() + 1)
    }

    for (const tx of filtered) {
      const key = new Date(tx.date).toISOString().split('T')[0]
      const data = dayMap.get(key) || { income: 0, expenses: 0, netCashFlow: 0 }
      const amt = Number(tx.amount || 0)
      if (tx.type === 'income') {
        data.income += amt
      } else {
        data.expenses += amt
      }
      data.netCashFlow = data.income - data.expenses
      dayMap.set(key, data)
    }

    return Array.from(dayMap.entries()).map(([dateStr, data]) => {
      const d = new Date(dateStr)
      const periodLabel = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      return {
        date: dateStr,
        period: periodLabel,
        income: Number(data.income.toFixed(2)),
        expenses: Number(data.expenses.toFixed(2)),
        amount: Number(data.expenses.toFixed(2)),
        netCashFlow: Number(data.netCashFlow.toFixed(2)),
      }
    })
  }

  // Monthly grouping
  const monthMap = new Map<
    string,
    { income: number; expenses: number; netCashFlow: number }
  >()
  const curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (curr <= endMonth) {
    const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, { income: 0, expenses: 0, netCashFlow: 0 })
    curr.setMonth(curr.getMonth() + 1)
  }

  for (const tx of filtered) {
    const d = new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const data = monthMap.get(key) || { income: 0, expenses: 0, netCashFlow: 0 }
    const amt = Number(tx.amount || 0)
    if (tx.type === 'income') {
      data.income += amt
    } else {
      data.expenses += amt
    }
    data.netCashFlow = data.income - data.expenses
    monthMap.set(key, data)
  }

  return Array.from(monthMap.entries()).map(([monthStr, data]) => {
    const [year, month] = monthStr.split('-')
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    const periodLabel = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    })
    return {
      date: monthStr,
      period: periodLabel,
      income: Number(data.income.toFixed(2)),
      expenses: Number(data.expenses.toFixed(2)),
      amount: Number(data.expenses.toFixed(2)),
      netCashFlow: Number(data.netCashFlow.toFixed(2)),
    }
  })
}

/**
 * Backward compatibility helper for getting period data with real calculations
 */
export const getPeriodData = (
  period: PeriodType,
  transactions: Transaction[] = []
) => {
  const trends = calculateTrendsFromTransactions(transactions, period)
  return {
    spendingTrends: trends.map((t) => ({ date: t.period, amount: t.expenses })),
    incomeVsExpenses: trends.map((t) => ({
      period: t.period,
      income: t.income,
      expenses: t.expenses,
      netCashFlow: t.netCashFlow,
    })),
  }
}

/**
 * Deterministic rule-based financial insights generator
 */
export const generateFinancialInsights = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  summary: AnalyticsSummary,
  previousSummary?: AnalyticsSummary
): FinancialInsight[] => {
  const insights: FinancialInsight[] = []

  // Rule 1: MoM / Period-over-period comparison
  if (previousSummary && previousSummary.totalExpenses > 0) {
    const delta = Number(
      (
        ((summary.totalExpenses - previousSummary.totalExpenses) /
          previousSummary.totalExpenses) *
        100
      ).toFixed(1)
    )
    if (delta > 10) {
      insights.push({
        id: 'ins-spending-increase',
        title: 'Spending Increased',
        description: `Total expenses rose by ${delta}% compared with the previous equivalent period.`,
        type: 'warning',
        metric: `+${delta}%`,
      })
    } else if (delta < -10) {
      insights.push({
        id: 'ins-spending-decrease',
        title: 'Lower Expenses',
        description: `Great job! Your spending decreased by ${Math.abs(delta)}% compared with the previous period.`,
        type: 'success',
        metric: `${delta}%`,
      })
    } else {
      insights.push({
        id: 'ins-spending-stable',
        title: 'Consistent Spending',
        description: `Your spending remained steady within ${Math.abs(delta)}% of the previous period.`,
        type: 'info',
      })
    }
  }

  // Rule 2: Largest spending category insight
  const topCategories = calculateTopCategories(transactions)
  if (topCategories.length > 0 && summary.totalExpenses > 0) {
    const topCat = topCategories[0]
    if (topCat.percentage >= 35) {
      insights.push({
        id: 'ins-top-cat',
        title: 'High Category Spend',
        description: `${topCat.category} accounts for ${topCat.percentage}% of your total expenses in this period.`,
        type: 'info',
        category: topCat.category,
        metric: `${topCat.percentage}%`,
      })
    }
  }

  // Rule 3: Over-budget or near limit warning
  const overBudgets = budgets.filter((b) => (b.spent || 0) > b.limit)
  if (overBudgets.length > 0) {
    const over = overBudgets[0]
    const excess = Number(((over.spent || 0) - over.limit).toFixed(2))
    insights.push({
      id: `ins-over-budget-${over.id}`,
      title: 'Budget Threshold Exceeded',
      description: `Your ${over.category} budget limit has been exceeded by ₹${excess.toLocaleString()}.`,
      type: 'warning',
      category: over.category,
    })
  } else {
    const nearLimit = budgets.filter((b) => (b.spent || 0) / b.limit >= 0.8)
    if (nearLimit.length > 0) {
      const near = nearLimit[0]
      const pct = Math.round(((near.spent || 0) / near.limit) * 100)
      insights.push({
        id: `ins-near-limit-${near.id}`,
        title: 'Budget Approaching Limit',
        description: `You have reached ${pct}% of your planned ${near.category} budget limit.`,
        type: 'warning',
        category: near.category,
        metric: `${pct}%`,
      })
    }
  }

  // Rule 4: Savings rate milestone
  if (summary.totalIncome > 0) {
    if (summary.savingsRate >= 20) {
      insights.push({
        id: 'ins-savings-rate',
        title: 'Strong Savings Rate',
        description: `Great job! You saved ${summary.savingsRate}% of your total income during this period.`,
        type: 'success',
        metric: `${summary.savingsRate}%`,
      })
    } else if (summary.netSavings < 0) {
      insights.push({
        id: 'ins-negative-savings',
        title: 'Deficit Alert',
        description: `Your spending exceeded earnings by ₹${Math.abs(summary.netSavings).toFixed(2)} in this period.`,
        type: 'warning',
        metric: `-₹${Math.abs(summary.netSavings).toFixed(2)}`,
      })
    }
  }

  // Rule 5: Goal progress check
  const goalProgresses = calculateGoalProgress(goals)
  if (goalProgresses.length > 0) {
    const completed = goalProgresses.find((g) => g.percentage >= 100)
    if (completed) {
      insights.push({
        id: `ins-goal-complete-${completed.id}`,
        title: 'Goal Achieved',
        description: `Congratulations! You have completed 100% of your "${completed.title}" goal! 🎉`,
        type: 'success',
      })
    } else {
      const closestGoal = [...goalProgresses].sort((a, b) => b.percentage - a.percentage)[0]
      if (closestGoal.percentage >= 50) {
        insights.push({
          id: `ins-goal-progress-${closestGoal.id}`,
          title: 'Savings Goal Milestone',
          description: `You are ${closestGoal.percentage}% toward your "${closestGoal.title}" milestone!`,
          type: 'success',
          metric: `${closestGoal.percentage}%`,
        })
      }
    }
  }

  return insights
}
