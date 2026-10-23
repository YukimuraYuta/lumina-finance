import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { TransactionService } from '../services/transaction.service'

export class TransactionController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransactionService.list(req.userId!, req.query as any)
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      })
    } catch (error) {
      next(error)
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.getById(req.userId!, req.params.id)
      if (!tx) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        })
      }
      res.status(200).json({
        success: true,
        data: tx,
      })
    } catch (error) {
      next(error)
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.create(req.userId!, req.body)
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: tx,
      })
    } catch (error) {
      next(error)
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tx = await TransactionService.update(req.userId!, req.params.id, req.body)
      if (!tx) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: tx,
      })
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await TransactionService.delete(req.userId!, req.params.id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        })
      }
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}
