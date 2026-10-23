import apiClient from './api'
import type { Budget } from '../types/finance'

export interface BudgetListResponse {
  success: boolean
  data: Budget[]
}

export interface SingleBudgetResponse {
  success: boolean
  data: Budget
  message?: string
}

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const response = await apiClient.get<BudgetListResponse>('/budgets')
    return response.data.data
  },

  async getById(id: string): Promise<Budget> {
    const response = await apiClient.get<SingleBudgetResponse>(`/budgets/${id}`)
    return response.data.data
  },

  async create(data: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
    const response = await apiClient.post<SingleBudgetResponse>('/budgets', data)
    return response.data.data
  },

  async update(id: string, data: Partial<Omit<Budget, 'id' | 'spent'>>): Promise<Budget> {
    const response = await apiClient.patch<SingleBudgetResponse>(`/budgets/${id}`, data)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`)
  },
}
