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
