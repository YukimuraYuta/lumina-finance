import apiClient from './api'
import type { Goal } from '../types/finance'

export interface GoalListResponse {
  success: boolean
  data: Goal[]
}

export interface SingleGoalResponse {
  success: boolean
  data: Goal
  message?: string
}

export const goalService = {
  async getAll(): Promise<Goal[]> {
    const response = await apiClient.get<GoalListResponse>('/goals')
    return response.data.data
  },

  async getById(id: string): Promise<Goal> {
    const response = await apiClient.get<SingleGoalResponse>(`/goals/${id}`)
    return response.data.data
  },

  async create(data: Omit<Goal, 'id' | 'currentAmount'> & { currentAmount?: number }): Promise<Goal> {
    const response = await apiClient.post<SingleGoalResponse>('/goals', data)
    return response.data.data
  },

  async update(id: string, data: Partial<Omit<Goal, 'id'>>): Promise<Goal> {
    const response = await apiClient.patch<SingleGoalResponse>(`/goals/${id}`, data)
    return response.data.data
  },

  async contribute(id: string, amount: number): Promise<Goal> {
    const response = await apiClient.post<SingleGoalResponse>(`/goals/${id}/contribute`, { amount })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`)
  },
}
