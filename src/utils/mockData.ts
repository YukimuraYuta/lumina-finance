import type { FinanceDashboardData, Budget, Goal } from '../types/finance'
import type { IncomeExpenseDataPoint, SpendingDataPoint } from '../types/analytics'

export const mockBudgets: Budget[] = [
  {
    id: 'b-1',
    category: 'Food',
    limit: 5000,
    spent: 3200,
    period: 'monthly',
    startDate: '2026-09-01',
  },
  {
    id: 'b-2',
    category: 'Transport',
    limit: 3000,
    spent: 2400,
    period: 'monthly',
    startDate: '2026-09-01',
  },
  {
    id: 'b-3',
    category: 'Education',
    limit: 4000,
    spent: 4500,
    period: 'monthly',
    startDate: '2026-09-01',
  },
  {
    id: 'b-4',
    category: 'Entertainment',
    limit: 2500,
    spent: 1000,
    period: 'monthly',
    startDate: '2026-09-01',
  },
  {
    id: 'b-5',
    category: 'Shopping',
    limit: 3000,
    spent: 2100,
    period: 'monthly',
    startDate: '2026-09-01',
  },
]

export const mockGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'New Laptop',
    targetAmount: 70000,
    currentAmount: 35000,
    category: 'Electronics',
    deadline: '2026-12-31',
    color: '#3b82f6',
  },
  {
    id: 'g-2',
    title: 'Emergency Fund',
    targetAmount: 25000,
    currentAmount: 18000,
    category: 'Savings',
    deadline: '2026-11-30',
    color: '#10b981',
  },
  {
    id: 'g-3',
    title: 'Semester Vacation',
    targetAmount: 30000,
    currentAmount: 12000,
    category: 'Travel',
    deadline: '2027-01-15',
    color: '#8b5cf6',
  },
]

export const mockHistoricalIncomeVsExpenses: Record<string, IncomeExpenseDataPoint[]> = {
  week: [
    { period: 'Mon', income: 0, expenses: 1200 },
    { period: 'Tue', income: 0, expenses: 850 },
    { period: 'Wed', income: 0, expenses: 1450 },
    { period: 'Thu', income: 0, expenses: 600 },
    { period: 'Fri', income: 0, expenses: 2100 },
    { period: 'Sat', income: 0, expenses: 1800 },
    { period: 'Sun', income: 5000, expenses: 1250 },
  ],
  month: [
    { period: 'Week 1', income: 6250, expenses: 2400 },
    { period: 'Week 2', income: 6250, expenses: 2100 },
    { period: 'Week 3', income: 6250, expenses: 2650 },
    { period: 'Week 4', income: 6250, expenses: 2100 },
  ],
  quarter: [
    { period: 'July', income: 22000, expenses: 14500 },
    { period: 'August', income: 24000, expenses: 15800 },
    { period: 'September', income: 25000, expenses: 9250 },
  ],
  year: [
    { period: 'Q1', income: 65000, expenses: 42000 },
    { period: 'Q2', income: 70000, expenses: 46000 },
    { period: 'Q3', income: 71000, expenses: 39550 },
    { period: 'Q4 (Est.)', income: 74000, expenses: 41000 },
  ],
}

export const mockHistoricalTrends: Record<string, SpendingDataPoint[]> = {
  week: [
    { date: 'Mon', amount: 1200 },
    { date: 'Tue', amount: 850 },
    { date: 'Wed', amount: 1450 },
    { date: 'Thu', amount: 600 },
    { date: 'Fri', amount: 2100 },
    { date: 'Sat', amount: 1800 },
    { date: 'Sun', amount: 1250 },
  ],
  month: [
    { date: 'Sep 1-7', amount: 2400 },
    { date: 'Sep 8-14', amount: 2100 },
    { date: 'Sep 15-21', amount: 2650 },
    { date: 'Sep 22-28', amount: 2100 },
  ],
  quarter: [
    { date: 'July', amount: 14500 },
    { date: 'August', amount: 15800 },
    { date: 'September', amount: 9250 },
  ],
  year: [
    { date: 'Q1', amount: 42000 },
    { date: 'Q2', amount: 46000 },
    { date: 'Q3', amount: 39550 },
    { date: 'Q4', amount: 41000 },
  ],
}

export const mockDashboardData: FinanceDashboardData = {
  summary: {
    balance: 15750,
    income: 25000,
    expenses: 9250,
    currency: '₹',
  },
  recentTransactions: [
    {
      id: 'tx-1',
      description: 'Dinner',
      category: 'Food',
      amount: 350,
      type: 'expense',
      date: 'Today, 8:30 PM',
      iconName: 'Utensils',
    },
    {
      id: 'tx-2',
      description: 'Uber Ride',
      category: 'Transport',
      amount: 180,
      type: 'expense',
      date: 'Yesterday',
      iconName: 'Car',
    },
    {
      id: 'tx-3',
      description: 'Textbooks & Notebooks',
      category: 'Education',
      amount: 750,
      type: 'expense',
      date: '22 Sep 2026',
      iconName: 'BookOpen',
    },
    {
      id: 'tx-4',
      description: 'Pocket Money Allowance',
      category: 'Income',
      amount: 5000,
      type: 'income',
      date: '20 Sep 2026',
      iconName: 'ArrowDownLeft',
    },
    {
      id: 'tx-5',
      description: 'Cafeteria & Snacks',
      category: 'Food',
      amount: 140,
      type: 'expense',
      date: '19 Sep 2026',
      iconName: 'Coffee',
    },
    {
      id: 'tx-6',
      description: 'Cinema Ticket',
      category: 'Entertainment',
      amount: 300,
      type: 'expense',
      date: '18 Sep 2026',
      iconName: 'Film',
    },
  ],
  categorySpending: [
    { category: 'Food', amount: 3200, color: '#8b5cf6', percentage: 34.6 },
    { category: 'Education', amount: 2400, color: '#3b82f6', percentage: 25.9 },
    { category: 'Transport', amount: 1650, color: '#f59e0b', percentage: 17.8 },
    { category: 'Shopping', amount: 1200, color: '#ec4899', percentage: 13.0 },
    { category: 'Entertainment', amount: 800, color: '#10b981', percentage: 8.7 },
  ],
  spendingTrends: [
    { day: 'Mon', amount: 1200, income: 0 },
    { day: 'Tue', amount: 850, income: 0 },
    { day: 'Wed', amount: 1450, income: 0 },
    { day: 'Thu', amount: 600, income: 0 },
    { day: 'Fri', amount: 2100, income: 0 },
    { day: 'Sat', amount: 1800, income: 0 },
    { day: 'Sun', amount: 1250, income: 5000 },
  ],
  budgets: mockBudgets,
  goals: mockGoals,
}

/**
 * Format raw numbers into localized currency display format (INR / ₹)
 */
export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN')}`
}
