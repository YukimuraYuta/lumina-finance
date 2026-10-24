import prisma from '../lib/prisma'
import { BudgetService } from './budget.service'
import { GoalService } from './goal.service'
import { resolveDateRange, PeriodFilter } from '../utils/dateRange'

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

export interface AnalyticsQueryOptions {
  startDate?: string
  endDate?: string
  period?: PeriodFilter
  interval?: 'daily' | 'monthly'
}

export interface FinancialInsightItem {
  id: string
  title: string
  description: string
  type: 'warning' | 'info' | 'success'
  category?: string
  metric?: string
}

export class AnalyticsService {
  /**
   * Comprehensive Financial Overview for selected period with MoM comparison
   */
  static async getOverview(userId: string, options: AnalyticsQueryOptions = {}) {
    const { startDate, endDate, prevStartDate, prevEndDate, periodName } =
      resolveDateRange(options.period, options.startDate, options.endDate)

    const [
      currIncome,
      currExpense,
      currIncomeCount,
      currExpenseCount,
      prevIncome,
      prevExpense,
      budgets,
      goals,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'income', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'expense', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { userId, type: 'income', date: { gte: startDate, lte: endDate } },
      }),
      prisma.transaction.count({
        where: { userId, type: 'expense', date: { gte: startDate, lte: endDate } },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'income', date: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'expense', date: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { amount: true },
      }),
      BudgetService.list(userId),
      GoalService.list(userId),
    ])

    const totalIncome = Number(Number(currIncome._sum.amount || 0).toFixed(2))
    const totalExpenses = Number(Number(currExpense._sum.amount || 0).toFixed(2))
    const netCashFlow = Number((totalIncome - totalExpenses).toFixed(2))
    const savingsRate =
      totalIncome > 0 ? Number(((netCashFlow / totalIncome) * 100).toFixed(1)) : 0

    // Previous period baseline
    const prevIncomeTotal = Number(Number(prevIncome._sum.amount || 0).toFixed(2))
    const prevExpenseTotal = Number(Number(prevExpense._sum.amount || 0).toFixed(2))
    const prevNetCashFlow = Number((prevIncomeTotal - prevExpenseTotal).toFixed(2))
    const prevSavingsRate =
      prevIncomeTotal > 0
        ? Number(((prevNetCashFlow / prevIncomeTotal) * 100).toFixed(1))
        : 0

    // Deltas / Month-over-Month changes
    const calculateDelta = (current: number, previous: number) => {
      if (previous > 0) {
        return Number((((current - previous) / previous) * 100).toFixed(1))
      }
      if (previous === 0 && current === 0) return 0
      return 100
    }

    const incomeChange = calculateDelta(totalIncome, prevIncomeTotal)
    const expenseChange = calculateDelta(totalExpenses, prevExpenseTotal)
    const savingsRateChange = Number((savingsRate - prevSavingsRate).toFixed(1))

    // Budgets Summary
    const totalBudgetLimit = Number(
      budgets.reduce((acc, b) => acc + b.limit, 0).toFixed(2)
    )
    const totalBudgetSpent = Number(
      budgets.reduce((acc, b) => acc + b.spent, 0).toFixed(2)
    )
    const totalBudgetRemaining = Math.max(
      0,
      Number((totalBudgetLimit - totalBudgetSpent).toFixed(2))
    )
    const overallBudgetUtilization =
      totalBudgetLimit > 0
        ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100)
        : 0

    // Goals Summary
    const totalGoalTarget = Number(
      goals.reduce((acc, g) => acc + g.targetAmount, 0).toFixed(2)
    )
    const totalGoalSaved = Number(
      goals.reduce((acc, g) => acc + g.currentAmount, 0).toFixed(2)
    )
    const totalGoalRemaining = Math.max(
      0,
      Number((totalGoalTarget - totalGoalSaved).toFixed(2))
    )
    const overallGoalProgress =
      totalGoalTarget > 0
        ? Math.round((totalGoalSaved / totalGoalTarget) * 100)
        : 0

    return {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        prevStartDate: prevStartDate.toISOString(),
        prevEndDate: prevEndDate.toISOString(),
        period: periodName,
      },
      current: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        savingsRate,
        incomeCount: currIncomeCount,
        expenseCount: currExpenseCount,
        transactionCount: currIncomeCount + currExpenseCount,
      },
      previous: {
        totalIncome: prevIncomeTotal,
        totalExpenses: prevExpenseTotal,
        netCashFlow: prevNetCashFlow,
        savingsRate: prevSavingsRate,
      },
      changes: {
        incomeChange,
        expenseChange,
        savingsRateChange,
      },
      budgets: {
        totalLimit: totalBudgetLimit,
        totalSpent: totalBudgetSpent,
        totalRemaining: totalBudgetRemaining,
        utilizationPercentage: overallBudgetUtilization,
        activeCount: budgets.length,
      },
      goals: {
        totalTarget: totalGoalTarget,
        totalSaved: totalGoalSaved,
        totalRemaining: totalGoalRemaining,
        progressPercentage: overallGoalProgress,
        activeCount: goals.length,
      },
    }
  }

  /**
   * Backward-compatible summary endpoint with optional date filtering
   */
  static async getSummary(userId: string, options: AnalyticsQueryOptions = {}) {
    if (options.period || options.startDate || options.endDate) {
      const overview = await this.getOverview(userId, options)
      return {
        totalIncome: overview.current.totalIncome,
        totalExpenses: overview.current.totalExpenses,
        netSavings: overview.current.netCashFlow,
        savingsRate: overview.current.savingsRate,
        balance: overview.current.netCashFlow,
        changes: overview.changes,
      }
    }

    // Default all-time summary for backward compatibility
    const [incomeAggregate, expenseAggregate] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'expense' },
        _sum: { amount: true },
      }),
    ])

    const totalIncome = Number(Number(incomeAggregate._sum.amount || 0).toFixed(2))
    const totalExpenses = Number(Number(expenseAggregate._sum.amount || 0).toFixed(2))
    const netSavings = Number((totalIncome - totalExpenses).toFixed(2))
    const savingsRate =
      totalIncome > 0
        ? Number(((netSavings / totalIncome) * 100).toFixed(1))
        : 0

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      balance: netSavings,
    }
  }

  /**
   * Categorical expense breakdown for selected date range
   */
  static async getCategoryBreakdown(userId: string, options: AnalyticsQueryOptions = {}) {
    const { startDate, endDate } = resolveDateRange(
      options.period,
      options.startDate,
      options.endDate
    )

    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      select: { category: true, amount: true },
    })

    const categoryMap = new Map<string, { amount: number; count: number }>()
    let totalExpenses = 0

    for (const tx of expenseTransactions) {
      const amt = Number(tx.amount)
      totalExpenses += amt
      const cat = tx.category || 'Other'
      const existing = categoryMap.get(cat) || { amount: 0, count: 0 }
      categoryMap.set(cat, {
        amount: existing.amount + amt,
        count: existing.count + 1,
      })
    }

    const result = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: Number(data.amount.toFixed(2)),
        count: data.count,
        percentage:
          totalExpenses > 0
            ? Number(((data.amount / totalExpenses) * 100).toFixed(1))
            : 0,
        color: CATEGORY_COLORS[category] || '#64748b',
      }))
      .sort((a, b) => b.amount - a.amount)

    return result
  }

  /**
   * Multi-series trends (Income, Expense, Net) grouped by daily or monthly intervals
   */
  static async getTrends(userId: string, options: AnalyticsQueryOptions = {}) {
    const { startDate, endDate, periodName } = resolveDateRange(
      options.period,
      options.startDate,
      options.endDate
    )

    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine interval automatically if not requested
    const interval =
      options.interval || (diffDays <= 35 ? 'daily' : 'monthly')

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
      select: { date: true, amount: true, type: true },
    })

    if (interval === 'daily') {
      const dayMap = new Map<
        string,
        { income: number; expenses: number; netCashFlow: number }
      >()

      // Pre-fill every day in the range
      const curr = new Date(startDate)
      while (curr <= endDate) {
        const key = curr.toISOString().split('T')[0]
        dayMap.set(key, { income: 0, expenses: 0, netCashFlow: 0 })
        curr.setDate(curr.getDate() + 1)
      }

      for (const tx of transactions) {
        const key = new Date(tx.date).toISOString().split('T')[0]
        const data = dayMap.get(key) || { income: 0, expenses: 0, netCashFlow: 0 }
        const amt = Number(tx.amount)

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
        const displayLabel = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })

        return {
          date: dateStr,
          period: displayLabel,
          income: Number(data.income.toFixed(2)),
          expenses: Number(data.expenses.toFixed(2)),
          amount: Number(data.expenses.toFixed(2)), // compatibility for spending charts
          netCashFlow: Number(data.netCashFlow.toFixed(2)),
        }
      })
    }

    // Monthly interval
    const monthMap = new Map<
      string,
      { income: number; expenses: number; netCashFlow: number }
    >()

    const curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    while (curr <= endMonth) {
      const year = curr.getFullYear()
      const month = String(curr.getMonth() + 1).padStart(2, '0')
      const key = `${year}-${month}`
      monthMap.set(key, { income: 0, expenses: 0, netCashFlow: 0 })
      curr.setMonth(curr.getMonth() + 1)
    }

    for (const tx of transactions) {
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const data = monthMap.get(key) || { income: 0, expenses: 0, netCashFlow: 0 }
      const amt = Number(tx.amount)

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
      const displayLabel = d.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })

      return {
        date: monthStr,
        period: displayLabel,
        income: Number(data.income.toFixed(2)),
        expenses: Number(data.expenses.toFixed(2)),
        amount: Number(data.expenses.toFixed(2)),
        netCashFlow: Number(data.netCashFlow.toFixed(2)),
      }
    })
  }

  /**
   * Legacy spending trends endpoint
   */
  static async getSpendingTrends(userId: string, days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    const dayMap = new Map<string, { amount: number; income: number }>()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayKey = d.toISOString().split('T')[0]
      dayMap.set(dayKey, { amount: 0, income: 0 })
    }

    for (const tx of transactions) {
      const dayKey = (tx.date instanceof Date ? tx.date : new Date(tx.date))
        .toISOString()
        .split('T')[0]
      const existing = dayMap.get(dayKey) || { amount: 0, income: 0 }
      const amt = Number(tx.amount)

      if (tx.type === 'expense') {
        existing.amount += amt
      } else {
        existing.income += amt
      }
      dayMap.set(dayKey, existing)
    }

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      amount: Number(data.amount.toFixed(2)),
      income: Number(data.income.toFixed(2)),
    }))
  }

  /**
   * Dynamic Budget Performance
   */
  static async getBudgetPerformance(userId: string) {
    return BudgetService.list(userId)
  }

  /**
   * Deterministic, rule-based Financial Insights Engine
   */
  static async getInsights(userId: string, options: AnalyticsQueryOptions = {}) {
    const overview = await this.getOverview(userId, options)
    const categories = await this.getCategoryBreakdown(userId, options)
    const budgets = await BudgetService.list(userId)
    const goals = await GoalService.list(userId)

    const insights: FinancialInsightItem[] = []

    // Rule 1: Spending trend compared with previous period
    if (overview.previous.totalExpenses > 0) {
      const change = overview.changes.expenseChange
      if (change > 10) {
        insights.push({
          id: 'insight-spending-increase',
          title: 'Spending Increased',
          description: `Total expenses rose by ${change}% compared with the previous equivalent period.`,
          type: 'warning',
          metric: `${change}%`,
        })
      } else if (change < -10) {
        insights.push({
          id: 'insight-spending-decrease',
          title: 'Lower Expenses',
          description: `Great job! Your spending decreased by ${Math.abs(change)}% compared with the previous period.`,
          type: 'success',
          metric: `-${Math.abs(change)}%`,
        })
      } else {
        insights.push({
          id: 'insight-spending-stable',
          title: 'Steady Expenditure',
          description: `Your spending remained steady within ${Math.abs(change)}% of the previous period.`,
          type: 'info',
        })
      }
    }

    // Rule 2: Top category concentration
    if (categories.length > 0 && overview.current.totalExpenses > 0) {
      const topCat = categories[0]
      if (topCat.percentage >= 35) {
        insights.push({
          id: 'insight-category-concentration',
          title: 'High Category Concentration',
          description: `${topCat.category} accounts for ${topCat.percentage}% of your total expenses for this period.`,
          type: 'info',
          category: topCat.category,
          metric: `${topCat.percentage}%`,
        })
      }
    }

    // Rule 3: Budget alerts (Exceeded or Approaching Limit)
    const overBudgets = budgets.filter((b) => b.spent > b.limit)
    if (overBudgets.length > 0) {
      const firstOver = overBudgets[0]
      insights.push({
        id: `insight-over-budget-${firstOver.id}`,
        title: 'Budget Threshold Exceeded',
        description: `Your ${firstOver.category} budget has been exceeded by ₹${(firstOver.spent - firstOver.limit).toFixed(2)}.`,
        type: 'warning',
        category: firstOver.category,
      })
    } else {
      const approaching = budgets.filter(
        (b) => b.usagePercentage >= 80 && b.spent <= b.limit
      )
      if (approaching.length > 0) {
        const firstApp = approaching[0]
        insights.push({
          id: `insight-approaching-budget-${firstApp.id}`,
          title: 'Budget Approaching Limit',
          description: `You have used ${firstApp.usagePercentage}% of your ${firstApp.category} budget limit.`,
          type: 'warning',
          category: firstApp.category,
          metric: `${firstApp.usagePercentage}%`,
        })
      }
    }

    // Rule 4: Savings Rate performance
    if (overview.current.totalIncome > 0) {
      if (overview.current.savingsRate >= 20) {
        insights.push({
          id: 'insight-strong-savings',
          title: 'Healthy Savings Rate',
          description: `You achieved a ${overview.current.savingsRate}% savings rate during this period.`,
          type: 'success',
          metric: `${overview.current.savingsRate}%`,
        })
      } else if (overview.current.netCashFlow < 0) {
        insights.push({
          id: 'insight-negative-cashflow',
          title: 'Negative Cash Flow Alert',
          description: `Expenses exceeded income by ₹${Math.abs(overview.current.netCashFlow).toFixed(2)} in this period.`,
          type: 'warning',
          metric: `-₹${Math.abs(overview.current.netCashFlow).toFixed(2)}`,
        })
      }
    }

    // Rule 5: Savings Goal Milestones
    if (goals.length > 0) {
      const completedGoal = goals.find((g) => g.percentage >= 100)
      if (completedGoal) {
        insights.push({
          id: `insight-goal-completed-${completedGoal.id}`,
          title: 'Savings Goal Achieved',
          description: `Congratulations! You reached 100% of your target for "${completedGoal.title}"! 🎉`,
          type: 'success',
        })
      } else {
        const topGoal = [...goals].sort((a, b) => b.percentage - a.percentage)[0]
        if (topGoal.percentage >= 50) {
          insights.push({
            id: `insight-goal-progress-${topGoal.id}`,
            title: 'Goal Progress Milestone',
            description: `You are ${topGoal.percentage}% of the way toward your "${topGoal.title}" goal.`,
            type: 'success',
            metric: `${topGoal.percentage}%`,
          })
        }
      }
    } else {
      insights.push({
        id: 'insight-create-goal',
        title: 'Establish a Savings Target',
        description: 'Set a savings goal in Lumina to track milestones and accelerate your financial discipline.',
        type: 'info',
      })
    }

    return insights
  }
}
