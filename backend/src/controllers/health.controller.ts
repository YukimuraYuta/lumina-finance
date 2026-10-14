import { Request, Response } from 'express'

/**
 * Controller handling health check verification for Lumina Finance API.
 */
export const getHealthStatus = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Lumina Finance API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
}
