import { z } from 'zod'

export const createTransactionSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(255),
  category: z.string().trim().min(1, 'Category is required').max(50),
  amount: z.number({ message: 'Amount must be a number' }).positive('Amount must be positive'),
  type: z.enum(['income', 'expense'] as const),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  iconName: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const transactionQuerySchema = z.object({
  type: z.enum(['income', 'expense'] as const).optional(),
  category: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().trim().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be greater than 0',
    }),
})

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'ID parameter is required'),
})
