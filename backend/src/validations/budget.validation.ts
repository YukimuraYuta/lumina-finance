import { z } from 'zod'

const isValidIsoDate = (val: string): boolean => {
  const timestamp = Date.parse(val)
  if (isNaN(timestamp)) return false
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  return year >= 2000 && year <= 2100
}

export const createBudgetSchema = z
  .object({
    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(50, 'Category cannot exceed 50 characters'),
    limit: z
      .number({ message: 'Limit must be a number' })
      .positive('Limit must be greater than 0')
      .finite('Limit must be a finite number')
      .max(100000000, 'Limit cannot exceed 100,000,000'),
    period: z.enum(['weekly', 'monthly', 'custom'] as const).default('monthly'),
    startDate: z.string().refine(isValidIsoDate, {
      message: 'startDate must be a valid date between year 2000 and 2100',
    }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidIsoDate(val), {
        message: 'endDate must be a valid date between year 2000 and 2100',
      }),
    notes: z.string().trim().max(500).optional(),
  })
  .strict()
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

export const updateBudgetSchema = z
  .object({
    category: z.string().trim().min(1).max(50).optional(),
    limit: z
      .number({ message: 'Limit must be a number' })
      .positive('Limit must be greater than 0')
      .finite('Limit must be a finite number')
      .max(100000000, 'Limit cannot exceed 100,000,000')
      .optional(),
    period: z.enum(['weekly', 'monthly', 'custom'] as const).optional(),
    startDate: z
      .string()
      .refine(isValidIsoDate, { message: 'Invalid startDate format' })
      .optional(),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || isValidIsoDate(val), { message: 'Invalid endDate format' }),
    notes: z.string().trim().max(500).optional(),
  })
  .strict()
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
