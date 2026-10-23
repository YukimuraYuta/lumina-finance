import { z } from 'zod'

const isValidIsoDate = (val: string): boolean => {
  const timestamp = Date.parse(val)
  if (isNaN(timestamp)) return false
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  return year >= 2000 && year <= 2100
}

export const createTransactionSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(255, 'Description cannot exceed 255 characters'),
    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(50, 'Category cannot exceed 50 characters'),
    amount: z
      .number({ message: 'Amount must be a number' })
      .positive('Amount must be positive')
      .finite('Amount must be a finite number')
      .max(100000000, 'Amount cannot exceed 100,000,000'),
    type: z.enum(['income', 'expense'] as const),
    date: z.string().refine(isValidIsoDate, {
      message: 'Date must be a valid ISO format between year 2000 and 2100',
    }),
    iconName: z.string().trim().max(50).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict()

export const updateTransactionSchema = createTransactionSchema.partial().strict()

export const transactionQuerySchema = z
  .object({
    type: z.enum(['income', 'expense'] as const).optional(),
    category: z.string().trim().max(50).optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidIsoDate(val), {
        message: 'Invalid startDate format',
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidIsoDate(val), {
        message: 'Invalid endDate format',
      }),
    search: z.string().trim().max(100).optional(),
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
      .refine((val) => !isNaN(val) && val > 0 && val <= 10000, {
        message: 'Page must be between 1 and 10000',
      }),
  })
  .refine(
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

export const idParamSchema = z
  .object({
    id: z.string().trim().min(1, 'ID parameter is required').max(100),
  })
  .strict()
