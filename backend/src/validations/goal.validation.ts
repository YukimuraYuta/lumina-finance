import { z } from 'zod'

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  targetAmount: z.number({ message: 'Target amount must be a number' }).positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').default(0),
  deadline: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid deadline date format',
    }),
  category: z.string().trim().max(50).optional(),
  color: z.string().trim().max(30).optional(),
})

export const updateGoalSchema = createGoalSchema.partial()

export const contributeGoalSchema = z.object({
  amount: z.number({ message: 'Amount must be a number' }).positive('Contribution amount must be positive'),
})
