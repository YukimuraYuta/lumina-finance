import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

export interface CreateBudgetDTO {
  category: string
  limit: number
  period?: 'weekly' | 'monthly' | 'custom'
  startDate: string
  endDate?: string
  notes?: string
}

export interface UpdateBudgetDTO {
  category?: string
  limit?: number
  period?: 'weekly' | 'monthly' | 'custom'
  startDate?: string
  endDate?: string
  notes?: string
}

export class BudgetService {
  /**
   * Helper to calculate the active date range for a budget
   */
  private static getDateRangeForPeriod(
    period: string,
    startDate: Date,
    endDate?: Date | null
  ): { gte: Date; lte: Date } {
    const now = new Date()

    if (period === 'monthly') {
      const gte = new Date(now.getFullYear(), now.getMonth(), 1)
      const lte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { gte, lte }
    }

    if (period === 'weekly') {
      const gte = new Date(now)
      gte.setDate(now.getDate() - now.getDay())
      gte.setHours(0, 0, 0, 0)
      const lte = new Date(gte)
      lte.setDate(gte.getDate() + 6)
      lte.setHours(23, 59, 59, 999)
      return { gte, lte }
    }

    // Custom period
    const gte = startDate
    const lte = endDate || new Date(now.getFullYear() + 1, 11, 31)
    return { gte, lte }
  }

  /**
   * Calculate spent amounts dynamically from actual expense transactions
   */
  private static async enrichBudgetWithSpent(userId: string, budget: any) {
    const limit = Number(budget.limit)
    const { gte, lte } = this.getDateRangeForPeriod(
      budget.period,
      budget.startDate,
      budget.endDate
    )

    const aggregate = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        category: { equals: budget.category, mode: 'insensitive' },
        date: { gte, lte },
      },
      _sum: {
        amount: true,
      },
    })

    const spent = Number(aggregate._sum.amount || 0)
    const remaining = Math.max(0, Number((limit - spent).toFixed(2)))
    const usagePercentage = limit > 0 ? Math.round((spent / limit) * 100) : 0

    let status: 'Healthy' | 'Near Limit' | 'Almost Reached' | 'Over Budget' = 'Healthy'
    if (spent > limit) {
      status = 'Over Budget'
    } else if (usagePercentage >= 90) {
      status = 'Almost Reached'
    } else if (usagePercentage >= 75) {
      status = 'Near Limit'
    }

    return {
      id: budget.id,
      category: budget.category,
      limit,
      spent,
      remaining,
      usagePercentage,
      status,
      period: budget.period as 'weekly' | 'monthly' | 'custom',
      startDate: budget.startDate instanceof Date ? budget.startDate.toISOString() : budget.startDate,
      endDate: budget.endDate instanceof Date ? budget.endDate.toISOString() : budget.endDate || undefined,
      notes: budget.notes || undefined,
    }
  }

  static async list(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const enriched = await Promise.all(
      budgets.map((b) => this.enrichBudgetWithSpent(userId, b))
    )

    return enriched
  }

  static async getById(userId: string, id: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!budget) return null
    return this.enrichBudgetWithSpent(userId, budget)
  }

  static async create(userId: string, data: CreateBudgetDTO) {
    const budget = await prisma.budget.create({
      data: {
        category: data.category,
        limit: new Prisma.Decimal(data.limit.toFixed(2)),
        period: data.period || 'monthly',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes,
        userId,
      },
    })

    return this.enrichBudgetWithSpent(userId, budget)
  }

  static async update(userId: string, id: string, data: UpdateBudgetDTO) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!existing) return null

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.limit !== undefined && {
          limit: new Prisma.Decimal(data.limit.toFixed(2)),
        }),
        ...(data.period !== undefined && { period: data.period }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return this.enrichBudgetWithSpent(userId, budget)
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!existing) return false

    await prisma.budget.delete({
      where: { id },
    })

    return true
  }
}
