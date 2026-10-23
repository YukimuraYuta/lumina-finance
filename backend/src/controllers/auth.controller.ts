import { Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuthService.register(req.body)
      res.cookie('token', result.token, cookieOptions)
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Log in user with credentials
   * POST /api/auth/login
   */
  static async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuthService.login(req.body)
      res.cookie('token', result.token, cookieOptions)
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Invalidate session / logout
   * POST /api/auth/logout
   */
  static async logout(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
      })
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId!
      const user = await AuthService.getCurrentUser(userId)
      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Update password securely
   * PATCH /api/auth/change-password
   */
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId!
      await AuthService.changePassword(userId, req.body)
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      })
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Update user preferences / profile
   * PATCH /api/auth/profile
   */
  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.userId!
      const user = await AuthService.updateProfile(userId, req.body)
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      })
    } catch (error) {
      return next(error)
    }
  }
}
