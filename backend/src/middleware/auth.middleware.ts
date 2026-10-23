import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

export interface AuthenticatedRequest extends Request {
  userId?: string
  user?: {
    id: string
    email: string
    name: string
    currency: string
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
        role: 'Student',
        currency: '₹',
        theme: 'system',
      },
    })
  }

  devUserId = user.id
  return user.id
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const customUserId = req.headers['x-user-id'] as string | undefined

    if (customUserId) {
      const user = await prisma.user.findUnique({ where: { id: customUserId } })
      if (user) {
        req.userId = user.id
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
        }
        return next()
      }
    }

    // If development mode, use isolated dev user context
    if (process.env.NODE_ENV !== 'production') {
      const userId = await ensureDevUser()
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        req.userId = user.id
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
        }
        return next()
      }
    }

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Authorization header.',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    })
  } catch (error) {
    return next(error)
  }
}
