import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

export interface CreateGoalDTO {
  title: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
  category?: string
  color?: string
}

export interface UpdateGoalDTO {
  title?: string
  targetAmount?: number
  currentAmount?: number
  deadline?: string
  category?: string
  color?: string
}

export const serializeGoal = (goal: any) => {
  const targetAmount = Number(goal.targetAmount)
  const currentAmount = Number(goal.currentAmount)
  const remainingAmount = Math.max(0, Number((targetAmount - currentAmount).toFixed(2)))
  const percentage =
    targetAmount > 0
      ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
      : 0

  return {
    id: goal.id,
    title: goal.title,
    targetAmount,
    currentAmount,
    remainingAmount,
    percentage,
    deadline: goal.deadline instanceof Date ? goal.deadline.toISOString() : goal.deadline || undefined,
    category: goal.category || undefined,
    color: goal.color || '#3b82f6',
  }
}

export class GoalService {
  static async list(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return goals.map(serializeGoal)
  }

  static async getById(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!goal) return null
    return serializeGoal(goal)
  }

  static async create(userId: string, data: CreateGoalDTO) {
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        targetAmount: new Prisma.Decimal(data.targetAmount.toFixed(2)),
        currentAmount: new Prisma.Decimal((data.currentAmount || 0).toFixed(2)),
        deadline: data.deadline ? new Date(data.deadline) : null,
        category: data.category,
        color: data.color || '#3b82f6',
        userId,
      },
    })

    return serializeGoal(goal)
  }

  static async update(userId: string, id: string, data: UpdateGoalDTO) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) return null

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.targetAmount !== undefined && {
          targetAmount: new Prisma.Decimal(data.targetAmount.toFixed(2)),
        }),
        ...(data.currentAmount !== undefined && {
          currentAmount: new Prisma.Decimal(data.currentAmount.toFixed(2)),
        }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.color !== undefined && { color: data.color }),
      },
    })

    return serializeGoal(goal)
  }

  static async contribute(userId: string, id: string, amount: number) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) return null

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: {
          increment: new Prisma.Decimal(amount.toFixed(2)),
        },
      },
    })

    return serializeGoal(goal)
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!existing) return false

    await prisma.goal.delete({
      where: { id },
    })

    return true
  }
}
