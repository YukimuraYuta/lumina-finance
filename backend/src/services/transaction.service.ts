import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

export interface TransactionFilterParams {
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  page?: number
}

export interface CreateTransactionDTO {
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  date: string
  iconName?: string
  notes?: string
}

export interface UpdateTransactionDTO {
  description?: string
  category?: string
  amount?: number
  type?: 'income' | 'expense'
  date?: string
  iconName?: string
  notes?: string
}

export const serializeTransaction = (tx: any) => ({
  id: tx.id,
  description: tx.description,
  category: tx.category,
  amount: Number(tx.amount),
  type: tx.type as 'income' | 'expense',
  date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
  iconName: tx.iconName || undefined,
  notes: tx.notes || undefined,
})

export class TransactionService {
  static async list(userId: string, filters: TransactionFilterParams = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 50
    const skip = (page - 1) * limit

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.category && {
        category: { equals: filters.category, mode: 'insensitive' },
      }),
      ...((filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        },
      }),
      ...(filters.search && {
        OR: [
          { description: { contains: filters.search, mode: 'insensitive' } },
          { category: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    }

    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      transactions: items.map(serializeTransaction),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  static async getById(userId: string, id: string) {
    const tx = await prisma.transaction.findFirst({
      where: { id, userId },
    })

    if (!tx) return null
    return serializeTransaction(tx)
  }

  static async create(userId: string, data: CreateTransactionDTO) {
    const tx = await prisma.transaction.create({
      data: {
        description: data.description,
        category: data.category,
        amount: new Prisma.Decimal(data.amount.toFixed(2)),
        type: data.type,
        date: new Date(data.date),
        iconName: data.iconName,
        notes: data.notes,
        userId,
      },
    })

    return serializeTransaction(tx)
  }

  static async update(userId: string, id: string, data: UpdateTransactionDTO) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    })

    if (!existing) return null

    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.amount !== undefined && {
          amount: new Prisma.Decimal(data.amount.toFixed(2)),
        }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.iconName !== undefined && { iconName: data.iconName }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return serializeTransaction(tx)
  }

  static async delete(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    })

    if (!existing) return false

    await prisma.transaction.delete({
      where: { id },
    })

    return true
  }
}
