import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

/**
 * Middleware handling 404 Not Found requests.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
}

/**
 * Centralized global error handling middleware.
 */
export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development'

  if (isDevelopment) {
    console.error('Unhandled Server Error:', err)
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
    })
    return
  }

  // Handle Prisma Known Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
      })
      return
    }

    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A resource with this identifier already exists',
        field: err.meta?.target,
      })
      return
    }
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500
  const message =
    statusCode === 500 && !isDevelopment
      ? 'An unexpected server error occurred'
      : err.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { stack: err.stack }),
  })
}
