import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { AnalyticsService } from '../services/analytics.service'

export class AnalyticsController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getSummary(req.userId!)
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
      const categories = await AnalyticsService.getCategoryBreakdown(req.userId!)
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
