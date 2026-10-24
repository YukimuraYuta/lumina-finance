import { z } from 'zod'

export const spendingTrendQuerySchema = z
  .object({
    days: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 7))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 365, {
        message: 'Days parameter must be an integer between 1 and 365',
      }),
  })
  .strict()

export const analyticsQuerySchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    period: z
      .enum(['week', 'month', 'last_month', 'quarter', '3months', '6months', 'year', 'custom'])
      .optional(),
    interval: z.enum(['daily', 'monthly']).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate).getTime()
        const end = new Date(data.endDate).getTime()
        if (isNaN(start) || isNaN(end)) return false
        return end >= start
      }
      return true
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  )
