import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

interface ValidationSchemas {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query)
        req.query = parsed as any
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params)
        req.params = parsed as any
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        })
      }
      return next(error)
    }
  }
}
