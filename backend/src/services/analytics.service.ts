import prisma from '../lib/prisma'
import { BudgetService } from './budget.service'

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

export class AnalyticsService {
  static async getSummary(userId: string) {
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

    const totalIncome = Number(incomeAggregate._sum.amount || 0)
    const totalExpenses = Number(expenseAggregate._sum.amount || 0)
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

  static async getCategoryBreakdown(userId: string) {
    const expenseTransactions = await prisma.transaction.findMany({
      where: { userId, type: 'expense' },
      select: { category: true, amount: true },
    })

    const categoryMap = new Map<string, number>()
    let totalExpenses = 0

    for (const tx of expenseTransactions) {
      const amt = Number(tx.amount)
      totalExpenses += amt
      const cat = tx.category || 'Other'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amt)
    }

    const result = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
        percentage:
          totalExpenses > 0
            ? Number(((amount / totalExpenses) * 100).toFixed(1))
            : 0,
        color: CATEGORY_COLORS[category] || '#64748b',
      }))
      .sort((a, b) => b.amount - a.amount)

    return result
  }

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

    // Group by day string (e.g. YYYY-MM-DD or Day name)
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

  static async getBudgetPerformance(userId: string) {
    return BudgetService.list(userId)
  }
}
