import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'
import { ensureDevUser } from '../middleware/auth.middleware'

async function seed() {
  console.log('Seeding initial Lumina Finance database data...')

  const userId = await ensureDevUser()
  console.log(`Development User ID: ${userId}`)

  // Check if transactions already exist
  const txCount = await prisma.transaction.count({ where: { userId } })
  if (txCount === 0) {
    console.log('Seeding transactions...')
    await prisma.transaction.createMany({
      data: [
        {
          description: 'Dinner',
          category: 'Food',
          amount: new Prisma.Decimal('350.00'),
          type: 'expense',
          date: new Date(),
          iconName: 'Utensils',
          userId,
        },
        {
          description: 'Uber Ride',
          category: 'Transport',
          amount: new Prisma.Decimal('180.00'),
          type: 'expense',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          iconName: 'Car',
          userId,
        },
        {
          description: 'Textbooks & Notebooks',
          category: 'Education',
          amount: new Prisma.Decimal('750.00'),
          type: 'expense',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000),
          iconName: 'BookOpen',
          userId,
        },
        {
          description: 'Pocket Money Allowance',
          category: 'Income',
          amount: new Prisma.Decimal('5000.00'),
          type: 'income',
          date: new Date(Date.now() - 72 * 60 * 60 * 1000),
          iconName: 'ArrowDownLeft',
          userId,
        },
        {
          description: 'Cafeteria & Snacks',
          category: 'Food',
          amount: new Prisma.Decimal('140.00'),
          type: 'expense',
          date: new Date(Date.now() - 96 * 60 * 60 * 1000),
          iconName: 'Coffee',
          userId,
        },
        {
          description: 'Cinema Ticket',
          category: 'Entertainment',
          amount: new Prisma.Decimal('300.00'),
          type: 'expense',
          date: new Date(Date.now() - 120 * 60 * 60 * 1000),
          iconName: 'Film',
          userId,
        },
      ],
    })
  }

  // Check if budgets already exist
  const budgetCount = await prisma.budget.count({ where: { userId } })
  if (budgetCount === 0) {
    console.log('Seeding budgets...')
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)

    await prisma.budget.createMany({
      data: [
        {
          category: 'Food',
          limit: new Prisma.Decimal('5000.00'),
          period: 'monthly',
          startDate,
          userId,
        },
        {
          category: 'Transport',
          limit: new Prisma.Decimal('3000.00'),
          period: 'monthly',
          startDate,
          userId,
        },
        {
          category: 'Education',
          limit: new Prisma.Decimal('4000.00'),
          period: 'monthly',
          startDate,
          userId,
        },
        {
          category: 'Entertainment',
          limit: new Prisma.Decimal('2500.00'),
          period: 'monthly',
          startDate,
          userId,
        },
        {
          category: 'Shopping',
          limit: new Prisma.Decimal('3000.00'),
          period: 'monthly',
          startDate,
          userId,
        },
      ],
    })
  }

  // Check if goals already exist
  const goalCount = await prisma.goal.count({ where: { userId } })
  if (goalCount === 0) {
    console.log('Seeding goals...')
    await prisma.goal.createMany({
      data: [
        {
          title: 'New Laptop',
          targetAmount: new Prisma.Decimal('70000.00'),
          currentAmount: new Prisma.Decimal('35000.00'),
          category: 'Electronics',
          deadline: new Date('2026-12-31'),
          color: '#3b82f6',
          userId,
        },
        {
          title: 'Emergency Fund',
          targetAmount: new Prisma.Decimal('25000.00'),
          currentAmount: new Prisma.Decimal('18000.00'),
          category: 'Savings',
          deadline: new Date('2026-11-30'),
          color: '#10b981',
          userId,
        },
        {
          title: 'Semester Vacation',
          targetAmount: new Prisma.Decimal('30000.00'),
          currentAmount: new Prisma.Decimal('12000.00'),
          category: 'Travel',
          deadline: new Date('2027-01-15'),
          color: '#8b5cf6',
          userId,
        },
      ],
    })
  }

  console.log('Database seeding complete!')
}

seed()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
