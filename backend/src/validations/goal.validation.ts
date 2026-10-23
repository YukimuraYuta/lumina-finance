import { z } from 'zod'

const isValidIsoDate = (val: string): boolean => {
  const timestamp = Date.parse(val)
  if (isNaN(timestamp)) return false
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  return year >= 2000 && year <= 2100
}

export const createGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(100, 'Title cannot exceed 100 characters'),
    targetAmount: z
      .number({ message: 'Target amount must be a number' })
      .positive('Target amount must be positive')
      .finite('Target amount must be a finite number')
      .max(100000000, 'Target amount cannot exceed 100,000,000'),
    currentAmount: z
      .number({ message: 'Current amount must be a number' })
      .min(0, 'Current amount cannot be negative')
      .finite('Current amount must be a finite number')
      .max(100000000, 'Current amount cannot exceed 100,000,000')
      .default(0),
    deadline: z
      .string()
      .optional()
      .refine((val) => !val || isValidIsoDate(val), {
        message: 'Invalid deadline date format (must be between 2000 and 2100)',
      }),
    category: z.string().trim().max(50).optional(),
    color: z.string().trim().max(30).optional(),
  })
  .strict()

export const updateGoalSchema = createGoalSchema.partial().strict()

export const contributeGoalSchema = z
  .object({
    amount: z
      .number({ message: 'Amount must be a number' })
      .positive('Contribution amount must be positive')
      .finite('Contribution amount must be a finite number')
      .max(100000000, 'Contribution amount cannot exceed 100,000,000'),
  })
  .strict()
