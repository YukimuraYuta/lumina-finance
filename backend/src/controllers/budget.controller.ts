import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { BudgetService } from '../services/budget.service'

export class BudgetController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budgets = await BudgetService.list(req.userId!)
      res.status(200).json({
        success: true,
        data: budgets,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.getById(req.userId!, req.params.id)
      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
        })
      }
      res.status(200).json({
        success: true,
        data: budget,
      })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.create(req.userId!, req.body)
      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.update(req.userId!, req.params.id, req.body)
      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await BudgetService.delete(req.userId!, req.params.id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Budget deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}
