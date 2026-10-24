import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { AnalyticsService } from '../services/analytics.service'
import { PeriodFilter } from '../utils/dateRange'

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, period } = req.query as {
        startDate?: string
        endDate?: string
        period?: PeriodFilter
      }
      const overview = await AnalyticsService.getOverview(req.userId!, {
        startDate,
        endDate,
        period,
      })
      res.status(200).json({
        success: true,
        data: overview,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, period, interval } = req.query as {
        startDate?: string
        endDate?: string
        period?: PeriodFilter
        interval?: 'daily' | 'monthly'
      }
      const trends = await AnalyticsService.getTrends(req.userId!, {
        startDate,
        endDate,
        period,
        interval,
      })
      res.status(200).json({
        success: true,
        data: trends,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, period } = req.query as {
        startDate?: string
        endDate?: string
        period?: PeriodFilter
      }
      const insights = await AnalyticsService.getInsights(req.userId!, {
        startDate,
        endDate,
        period,
      })
      res.status(200).json({
        success: true,
        data: insights,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, period } = req.query as {
        startDate?: string
        endDate?: string
        period?: PeriodFilter
      }
      const summary = await AnalyticsService.getSummary(req.userId!, {
        startDate,
        endDate,
        period,
      })
      res.status(200).json({
        success: true,
        data: summary,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getSpendingTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7
      const trends = await AnalyticsService.getSpendingTrends(req.userId!, days)
      res.status(200).json({
        success: true,
        data: trends,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, period } = req.query as {
        startDate?: string
        endDate?: string
        period?: PeriodFilter
      }
      const categories = await AnalyticsService.getCategoryBreakdown(req.userId!, {
        startDate,
        endDate,
        period,
      })
      res.status(200).json({
        success: true,
        data: categories,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getBudgetPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const performance = await AnalyticsService.getBudgetPerformance(req.userId!)
      res.status(200).json({
        success: true,
        data: performance,
      })
    } catch (error) {
      next(error)
    }
  }
}
