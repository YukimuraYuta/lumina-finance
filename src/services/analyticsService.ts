import apiClient from './api'
import type {
  AnalyticsSummary,
  CategoryBreakdownItem,
  BudgetPerformanceItem,
} from '../types/analytics'
import type { DailySpending } from '../types/finance'

export interface AnalyticsSummaryResponse {
  success: boolean
  data: AnalyticsSummary
}

export interface SpendingTrendResponse {
  success: boolean
  data: DailySpending[]
}

export interface CategoryBreakdownResponse {
  success: boolean
  data: CategoryBreakdownItem[]
}

export interface BudgetPerformanceResponse {
  success: boolean
  data: BudgetPerformanceItem[]
}

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummaryResponse>('/analytics/summary')
    return response.data.data
  },

  async getSpendingTrend(days: number = 7): Promise<DailySpending[]> {
    const response = await apiClient.get<SpendingTrendResponse>('/analytics/spending-trend', {
      params: { days },
    })
    return response.data.data
  },

  async getCategoryBreakdown(): Promise<CategoryBreakdownItem[]> {
    const response = await apiClient.get<CategoryBreakdownResponse>('/analytics/categories')
    return response.data.data
  },

  async getBudgetPerformance(): Promise<BudgetPerformanceItem[]> {
    const response = await apiClient.get<BudgetPerformanceResponse>('/analytics/budget-performance')
    return response.data.data
  },
}
