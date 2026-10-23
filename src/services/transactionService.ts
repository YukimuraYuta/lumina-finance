import apiClient from './api'
import type { Transaction } from '../types/finance'

export interface TransactionFilterQuery {
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  page?: number
}

export interface TransactionListResponse {
  success: boolean
  data: Transaction[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SingleTransactionResponse {
  success: boolean
  data: Transaction
  message?: string
}

export const transactionService = {
  async getAll(params?: TransactionFilterQuery): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await apiClient.get<TransactionListResponse>('/transactions', { params })
    return {
      transactions: response.data.data,
      total: response.data.pagination?.total ?? response.data.data.length,
    }
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<SingleTransactionResponse>(`/transactions/${id}`)
    return response.data.data
  },

  async create(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await apiClient.post<SingleTransactionResponse>('/transactions', data)
    return response.data.data
  },

  async update(id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    const response = await apiClient.patch<SingleTransactionResponse>(`/transactions/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },
}
