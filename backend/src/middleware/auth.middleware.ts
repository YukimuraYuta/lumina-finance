import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { verifyToken } from '../utils/auth.utils'

export interface AuthenticatedRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
    name: string
    role: string
    currency: string
    theme: string
  }
}

// Development default user cache
let devUserId: string | null = null

export const ensureDevUser = async (): Promise<string> => {
  if (devUserId) return devUserId

  let user = await prisma.user.findFirst({
    where: { email: 'arnav@lumina.local' },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'arnav@lumina.local',
        name: 'Arnav',
        password: '$2b$10$k8YuEJttpe.rtwgoag5.leqX4Sf6kfwW7zbH1trOrKDC1eyYq5oRa', // password123
        role: 'Student',
        currency: '₹',
        theme: 'system',
      },
    })
  }

  devUserId = user.id
  return user.id
}

/**
 * Authentication Middleware
 * Enforces JWT Bearer Token validation and sets req.userId / req.user
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    // 1. Extract token from HTTP-only Cookie or Authorization Bearer header
    let token: string | null = null
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim()
    }

    if (token) {
      try {
        const payload = verifyToken(token)
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        })

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User belonging to this session or token no longer exists.',
          })
        }

        req.userId = user.id
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          currency: user.currency,
          theme: user.theme,
        }
        return next()
      } catch (err: any) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication credentials. Please log in again.',
        })
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing or invalid authentication token.',
    })
  } catch (error) {
    return next(error)
  }
}
