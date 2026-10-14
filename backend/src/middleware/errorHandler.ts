import { Request, Response, NextFunction } from 'express'

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
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development'

  if (isDevelopment) {
    console.error('Unhandled Server Error:', err)
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  })
}
