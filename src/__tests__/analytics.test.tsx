import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateCategorySpending,
  calculateBudgetPerformance,
  calculateGoalProgress,
  filterTransactionsByPeriod,
  generateFinancialInsights,
} from '../utils/analytics'
import { resolveDateRange, validateDateRange } from '../utils/dateRange'
import DateRangeFilter from '../components/analytics/DateRangeFilter'
import FinancialInsights from '../components/analytics/FinancialInsights'
import BudgetPerformance from '../components/analytics/BudgetPerformance'
import GoalProgress from '../components/analytics/GoalProgress'
import CategoryBreakdown from '../components/analytics/CategoryBreakdown'
import SpendingTrendChart from '../components/analytics/SpendingTrendChart'
import { FinanceContext } from '../context/FinanceContext'
import type { Transaction, Budget, Goal } from '../types/finance'
import type { FinancialInsight } from '../types/analytics'

// Helper mock wrapper with FinanceContext
const renderWithFinance = (ui: React.ReactElement, customFormat?: (n: number) => string) => {
  const mockContext: any = {
    user: { name: 'Test User', role: 'Student', currency: '₹', theme: 'system' },
    formatAmount: customFormat || ((val: number) => `₹${val.toLocaleString()}`),
    transactions: [],
    budgets: [],
    goals: [],
  }

  return render(
    <FinanceContext.Provider value={mockContext}>
      {ui}
    </FinanceContext.Provider>
  )
}

describe('Step 15: Financial Analytics & Calculations Unit Tests', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      description: 'Allowance',
      category: 'Income',
      amount: 25000,
      type: 'income',
      date: '2026-10-05T10:00:00.000Z',
    },
    {
      id: 'tx-2',
      description: 'Campus Cafeteria',
      category: 'Food',
      amount: 4500,
      type: 'expense',
      date: '2026-10-10T12:00:00.000Z',
    },
    {
      id: 'tx-3',
      description: 'Metro Pass',
      category: 'Transport',
      amount: 1500,
      type: 'expense',
      date: '2026-10-12T09:00:00.000Z',
    },
    {
      id: 'tx-4',
      description: 'Textbooks',
      category: 'Education',
      amount: 4000,
      type: 'expense',
      date: '2026-10-15T15:00:00.000Z',
    },
  ]

  describe('1. Monetary Calculations & Zero Safety', () => {
    it('calculates total income accurately', () => {
      expect(calculateTotalIncome(sampleTransactions)).toBe(25000)
      expect(calculateTotalIncome([])).toBe(0)
    })

    it('calculates total expenses accurately', () => {
      expect(calculateTotalExpenses(sampleTransactions)).toBe(10000)
      expect(calculateTotalExpenses([])).toBe(0)
    })

    it('calculates net cash flow (income - expenses)', () => {
      const income = calculateTotalIncome(sampleTransactions)
      const expenses = calculateTotalExpenses(sampleTransactions)
      expect(calculateNetSavings(income, expenses)).toBe(15000)
      expect(calculateNetSavings(5000, 8000)).toBe(-3000)
    })

    it('calculates savings rate safely with positive and zero denominator', () => {
      // 15,000 / 25,000 = 60.0%
      expect(calculateSavingsRate(25000, 15000)).toBe(60)

      // Zero income safe (no NaN or Infinity)
      expect(calculateSavingsRate(0, 0)).toBe(0)
      expect(calculateSavingsRate(0, -5000)).toBe(0)
    })

    it('calculates category spending and relative percentages', () => {
      const breakdown = calculateCategorySpending(sampleTransactions)
      expect(breakdown).toHaveLength(3)

      const food = breakdown.find((b) => b.category === 'Food')
      expect(food?.amount).toBe(4500)
      expect(food?.percentage).toBe(45) // 4500 / 10000 = 45%

      const transport = breakdown.find((b) => b.category === 'Transport')
      expect(transport?.amount).toBe(1500)
      expect(transport?.percentage).toBe(15) // 1500 / 10000 = 15%

      const education = breakdown.find((b) => b.category === 'Education')
      expect(education?.amount).toBe(4000)
      expect(education?.percentage).toBe(40) // 4000 / 10000 = 40%

      // Empty transactions safe
      expect(calculateCategorySpending([])).toEqual([])
    })
  })

  describe('2. Budget Utilization Calculations', () => {
    const sampleBudgets: Budget[] = [
      {
        id: 'b-1',
        category: 'Food',
        limit: 5000,
        spent: 4500,
        period: 'monthly',
        startDate: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'b-2',
        category: 'Transport',
        limit: 1000,
        spent: 1500,
        period: 'monthly',
        startDate: '2026-10-01T00:00:00.000Z',
      },
    ]

    it('calculates budget utilization, remaining, and status labels', () => {
      const perf = calculateBudgetPerformance(sampleBudgets, sampleTransactions)
      expect(perf).toHaveLength(2)

      const food = perf.find((p) => p.category === 'Food')!
      expect(food.limit).toBe(5000)
      expect(food.spent).toBe(4500)
      expect(food.remaining).toBe(500)
      expect(food.usagePercentage).toBe(90)
      expect(food.status).toBe('Almost Reached')

      const transport = perf.find((p) => p.category === 'Transport')!
      expect(transport.limit).toBe(1000)
      expect(transport.spent).toBe(1500)
      expect(transport.remaining).toBe(0)
      expect(transport.usagePercentage).toBe(150)
      expect(transport.status).toBe('Over Budget')
    })
  })

  describe('3. Goal Progress Calculations', () => {
    const sampleGoals: Goal[] = [
      {
        id: 'g-1',
        title: 'New Laptop',
        targetAmount: 60000,
        currentAmount: 30000,
      },
      {
        id: 'g-2',
        title: 'Zero Target Edge Case',
        targetAmount: 0,
        currentAmount: 0,
      },
    ]

    it('calculates progress percentage and handles zero target safely', () => {
      const progress = calculateGoalProgress(sampleGoals)
      expect(progress[0].percentage).toBe(50)
      expect(progress[0].remainingAmount).toBe(30000)

      // Zero target safe
      expect(progress[1].percentage).toBe(0)
      expect(progress[1].remainingAmount).toBe(0)
    })
  })

  describe('4. Date Range & Comparison Resolution', () => {
    it('generates matching previous period with identical duration', () => {
      const result = resolveDateRange('month')
      expect(result.startDate).toBeInstanceOf(Date)
      expect(result.endDate).toBeInstanceOf(Date)
      expect(result.prevStartDate).toBeInstanceOf(Date)
      expect(result.prevEndDate).toBeInstanceOf(Date)

      const currDuration = result.endDate.getTime() - result.startDate.getTime() + 1
      const prevDuration = result.prevEndDate.getTime() - result.prevStartDate.getTime() + 1
      expect(currDuration).toBe(prevDuration)
    })

    it('validates date range boundaries (rejects end < start)', () => {
      const valid = validateDateRange('2026-10-01', '2026-10-31')
      expect(valid.isValid).toBe(true)

      const invalid = validateDateRange('2026-10-31', '2026-10-01')
      expect(invalid.isValid).toBe(false)
      expect(invalid.error).toMatch(/end date cannot be earlier than start date/i)
    })

    it('filters transactions strictly within period boundaries', () => {
      const inRangeTx: Transaction = {
        id: 'in-1',
        description: 'Oct Tx',
        category: 'Food',
        amount: 500,
        type: 'expense',
        date: '2026-10-15T00:00:00.000Z',
      }
      const outOfRangeTx: Transaction = {
        id: 'out-1',
        description: 'Past Tx',
        category: 'Food',
        amount: 500,
        type: 'expense',
        date: '2025-01-01T00:00:00.000Z',
      }

      const filtered = filterTransactionsByPeriod(
        [inRangeTx, outOfRangeTx],
        'custom',
        '2026-10-01',
        '2026-10-31'
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('in-1')
    })
  })

  describe('5. Rule-Based Smart Financial Insights Generator', () => {
    it('generates MoM spending increase warning when expenses rise > 10%', () => {
      const current = { totalIncome: 30000, totalExpenses: 15000, netSavings: 15000, savingsRate: 50 }
      const previous = { totalIncome: 30000, totalExpenses: 10000, netSavings: 20000, savingsRate: 66.7 }

      const insights = generateFinancialInsights([], [], [], current, previous)
      const spendingInsight = insights.find((i) => i.id === 'ins-spending-increase')
      expect(spendingInsight).toBeDefined()
      expect(spendingInsight?.type).toBe('warning')
    })

    it('generates budget exceeded alert when spent > limit', () => {
      const overBudget: Budget = {
        id: 'b-over',
        category: 'Entertainment',
        limit: 2000,
        spent: 3200,
        period: 'monthly',
        startDate: '2026-10-01T00:00:00.000Z',
      }
      const summary = { totalIncome: 10000, totalExpenses: 5000, netSavings: 5000, savingsRate: 50 }

      const insights = generateFinancialInsights([], [overBudget], [], summary)
      const overAlert = insights.find((i) => i.id.includes('ins-over-budget'))
      expect(overAlert).toBeDefined()
      expect(overAlert?.type).toBe('warning')
      expect(overAlert?.description).toContain('exceeded by ₹1,200')
    })

    it('generates strong savings rate insight when savingsRate >= 20%', () => {
      const summary = { totalIncome: 50000, totalExpenses: 30000, netSavings: 20000, savingsRate: 40 }
      const insights = generateFinancialInsights([], [], [], summary)

      const savingsInsight = insights.find((i) => i.id === 'ins-savings-rate')
      expect(savingsInsight).toBeDefined()
      expect(savingsInsight?.type).toBe('success')
      expect(savingsInsight?.description).toContain('saved 40%')
    })
  })
})

describe('Step 15: Analytics Component Rendering & Interaction Tests', () => {
  it('DateRangeFilter renders presets and invokes callback on selection', () => {
    const handlePeriodChange = vi.fn()
    render(
      <DateRangeFilter
        period="month"
        onPeriodChange={handlePeriodChange}
      />
    )

    const thisWeekBtn = screen.getByRole('button', { name: /this week/i })
    expect(thisWeekBtn).toBeDefined()

    fireEvent.click(thisWeekBtn)
    expect(handlePeriodChange).toHaveBeenCalledWith('week')
  })

  it('DateRangeFilter displays validation error on invalid custom range', () => {
    const handlePeriodChange = vi.fn()
    render(
      <DateRangeFilter
        period="custom"
        onPeriodChange={handlePeriodChange}
      />
    )

    const customBtn = screen.getByRole('button', { name: /custom range/i })
    fireEvent.click(customBtn)

    const startInput = screen.getByLabelText(/start date/i)
    const endInput = screen.getByLabelText(/end date/i)
    const applyBtn = screen.getByRole('button', { name: /apply range/i })

    // Set end earlier than start
    fireEvent.change(startInput, { target: { value: '2026-10-31' } })
    fireEvent.change(endInput, { target: { value: '2026-10-01' } })
    fireEvent.click(applyBtn)

    expect(screen.getByText(/end date cannot be earlier than start date/i)).toBeDefined()
    expect(handlePeriodChange).not.toHaveBeenCalledWith('custom', '2026-10-31', '2026-10-01')
  })

  it('FinancialInsights renders insights list with accessible badges', () => {
    const insights: FinancialInsight[] = [
      {
        id: 'test-1',
        title: 'Strong Savings Rate',
        description: 'You saved 35% of your income this month.',
        type: 'success',
        metric: '35%',
      },
      {
        id: 'test-2',
        title: 'Dining Budget Limit',
        description: 'Used 92% of your monthly dining budget.',
        type: 'warning',
        metric: '92%',
      },
    ]

    render(<FinancialInsights insights={insights} />)
    expect(screen.getByText('Strong Savings Rate')).toBeDefined()
    expect(screen.getByText('Dining Budget Limit')).toBeDefined()
    expect(screen.getByText('35%')).toBeDefined()
  })

  it('BudgetPerformance renders progress bars and accessible labels', () => {
    const items = [
      {
        id: 'b-item-1',
        category: 'Food',
        limit: 5000,
        spent: 3000,
        remaining: 2000,
        usagePercentage: 60,
        status: 'Healthy' as const,
      },
    ]

    renderWithFinance(<BudgetPerformance items={items} />)
    expect(screen.getByText('Food')).toBeDefined()
    expect(screen.getByText('Within Budget')).toBeDefined()
    expect(screen.getByText('60% used')).toBeDefined()
  })

  it('GoalProgress renders goal items and empty state appropriately', () => {
    // Empty state
    renderWithFinance(<GoalProgress goals={[]} />)
    expect(screen.getByText(/no active savings goals found/i)).toBeDefined()

    // Populated state
    const goals = [
      {
        id: 'g-1',
        title: 'Emergency Fund',
        targetAmount: 50000,
        currentAmount: 25000,
        remainingAmount: 25000,
        percentage: 50,
      },
    ]
    renderWithFinance(<GoalProgress goals={goals} />)
    expect(screen.getByText('Emergency Fund')).toBeDefined()
    expect(screen.getByText('50% saved')).toBeDefined()
  })

  it('CategoryBreakdown displays empty fallback when no expense data exists', () => {
    renderWithFinance(<CategoryBreakdown data={[]} />)
    expect(screen.getByText(/no category breakdown available/i)).toBeDefined()
  })

  it('SpendingTrendChart displays empty fallback when no points are provided', () => {
    renderWithFinance(<SpendingTrendChart data={[]} />)
    expect(screen.getByText(/no trend data recorded/i)).toBeDefined()
  })
})
