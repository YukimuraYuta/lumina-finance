import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  BarChart3,
} from 'lucide-react'
import SpendingTrendChart from '../components/analytics/SpendingTrendChart'
import IncomeExpenseChart from '../components/analytics/IncomeExpenseChart'
import CategoryBreakdown from '../components/analytics/CategoryBreakdown'
import TopCategories from '../components/analytics/TopCategories'
import BudgetPerformance from '../components/analytics/BudgetPerformance'
import GoalProgress from '../components/analytics/GoalProgress'
import FinancialInsights from '../components/analytics/FinancialInsights'
import {
  calculateAnalyticsSummary,
  calculateCategorySpending,
  calculateTopCategories,
  calculateBudgetPerformance,
  calculateGoalProgress,
  generateFinancialInsights,
  getPeriodData,
} from '../utils/analytics'
import { useFinance } from '../hooks/useFinance'
import type { PeriodType } from '../types/analytics'

const PERIOD_OPTIONS: { label: string; value: PeriodType }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: 'quarter' },
  { label: 'This Year', value: 'year' },
]

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month')
  const { transactions, budgets, goals, formatAmount } = useFinance()

  // 1. Calculate Summary Totals
  const summary = useMemo(() => {
    return calculateAnalyticsSummary(transactions, period)
  }, [transactions, period])

  // 2. Calculate Category Breakdown & Top Categories
  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions)
  }, [transactions])

  const topCategories = useMemo(() => {
    return calculateTopCategories(transactions)
  }, [transactions])

  // 3. Calculate Budget Performance
  const budgetPerformance = useMemo(() => {
    return calculateBudgetPerformance(budgets, transactions)
  }, [budgets, transactions])

  // 4. Calculate Goal Progress
  const goalProgress = useMemo(() => {
    return calculateGoalProgress(goals)
  }, [goals])

  // 5. Generate Rule-based Insights
  const insights = useMemo(() => {
    return generateFinancialInsights(
      transactions,
      budgets,
      goals,
      summary
    )
  }, [transactions, budgets, goals, summary])

  // 6. Period-based historical trend data
  const periodData = useMemo(() => {
    return getPeriodData(period)
  }, [period])

  const hasTransactions = transactions && transactions.length > 0

  if (!hasTransactions) {
    return (
      <div className="analytics-page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Understand your spending and financial habits.</p>
          </div>
        </header>

        <div className="table-card empty-table-container">
          <div className="empty-state">
            <BarChart3 size={44} className="empty-icon" />
            <h3 className="empty-title">No analytics available</h3>
            <p className="empty-description">
              Add transactions to start seeing your financial insights.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      {/* Header with Period Selector */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Understand your spending and financial habits.</p>
        </div>

        {/* Period Selector Toggle */}
        <div className="period-selector-wrap" role="group" aria-label="Select Analytics Period">
          <Calendar size={14} className="period-icon" aria-hidden="true" />
          <div className="filter-type-toggle">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-btn ${period === opt.value ? 'filter-btn-active' : ''}`}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Top Analytics Summary Cards */}
      <section className="analytics-summary-grid" aria-label="Financial Summary Cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Income</span>
            <div className="stat-card-icon-wrap income-icon-wrap" aria-hidden="true">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount text-success">
              {formatAmount(summary.totalIncome)}
            </div>
            <div className="stat-card-subtitle">Gross income for period</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Expenses</span>
            <div className="stat-card-icon-wrap expense-icon-wrap" aria-hidden="true">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount text-danger">
              {formatAmount(summary.totalExpenses)}
            </div>
            <div className="stat-card-subtitle">Total expenditure</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Net Savings</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className={`stat-card-amount ${summary.netSavings < 0 ? 'text-danger' : 'text-success'}`}>
              {formatAmount(summary.netSavings)}
            </div>
            <div className="stat-card-subtitle">Income minus expenses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Savings Rate</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <Percent size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-amount">{summary.savingsRate}%</div>
            <div className="stat-card-subtitle">Percentage of income saved</div>
          </div>
        </div>
      </section>

      {/* Main Analytics Grid */}
      <section className="analytics-main-grid" aria-label="Charts and Visualizations">
        {/* Row 1: Spending Trend & Income vs Expense */}
        <SpendingTrendChart data={periodData.spendingTrends} />
        <IncomeExpenseChart data={periodData.incomeVsExpenses} />

        {/* Row 2: Category Breakdown & Top Categories */}
        <CategoryBreakdown data={categorySpending} />
        <TopCategories categories={topCategories} />

        {/* Row 3: Budget Performance & Savings Goals */}
        <BudgetPerformance items={budgetPerformance} />
        <GoalProgress goals={goalProgress} />
      </section>

      {/* Financial Insights Banner Section */}
      <section aria-label="Automated Financial Insights">
        <FinancialInsights insights={insights} />
      </section>
    </div>
  )
}

export default Analytics
