import { z } from 'zod'

export const createBudgetSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(50),
  limit: z.number({ message: 'Limit must be a number' }).positive('Limit must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'custom'] as const).default('monthly'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid endDate format',
    }),
  notes: z.string().trim().max(500).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
  },
  {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  }
)

export const updateBudgetSchema = z.object({
  category: z.string().trim().min(1).max(50).optional(),
  limit: z.number().positive().optional(),
  period: z.enum(['weekly', 'monthly', 'custom'] as const).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid startDate format' })
    .optional(),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate format' }),
  notes: z.string().trim().max(500).optional(),
})
