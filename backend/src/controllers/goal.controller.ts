import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { GoalService } from '../services/goal.service'

export class GoalController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const goals = await GoalService.list(req.userId!)
      res.status(200).json({
        success: true,
        data: goals,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const goal = await GoalService.getById(req.userId!, req.params.id)
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        })
      }
      res.status(200).json({
        success: true,
        data: goal,
      })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const goal = await GoalService.create(req.userId!, req.body)
      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const goal = await GoalService.update(req.userId!, req.params.id, req.body)
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      })
    } catch (error) {
      next(error)
    }
  }

  static async contribute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const goal = await GoalService.contribute(
        req.userId!,
        req.params.id,
        req.body.amount
      )
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Contribution added successfully',
        data: goal,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await GoalService.delete(req.userId!, req.params.id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}
