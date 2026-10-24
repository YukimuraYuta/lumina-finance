import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  BarChart3,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import SpendingTrendChart from '../components/analytics/SpendingTrendChart'
import IncomeExpenseChart from '../components/analytics/IncomeExpenseChart'
import CategoryBreakdown from '../components/analytics/CategoryBreakdown'
import TopCategories from '../components/analytics/TopCategories'
import BudgetPerformance from '../components/analytics/BudgetPerformance'
import GoalProgress from '../components/analytics/GoalProgress'
import FinancialInsights from '../components/analytics/FinancialInsights'
import DateRangeFilter from '../components/analytics/DateRangeFilter'
import { analyticsService } from '../services/analyticsService'
import {
  calculateAnalyticsSummary,
  calculateCategorySpending,
  calculateTopCategories,
  calculateBudgetPerformance,
  calculateGoalProgress,
  calculateTrendsFromTransactions,
  generateFinancialInsights,
} from '../utils/analytics'
import { useFinance } from '../hooks/useFinance'
import type {
  PeriodType,
  AnalyticsOverview,
  TrendDataPoint,
  CategoryBreakdownItem,
  FinancialInsight,
} from '../types/analytics'

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [customStart, setCustomStart] = useState<string | undefined>(undefined)
  const [customEnd, setCustomEnd] = useState<string | undefined>(undefined)

  const {
    transactions,
    budgets,
    goals,
    formatAmount,
    loading: financeLoading,
    refreshData,
  } = useFinance()

  // Live backend analytics state
  const [backendOverview, setBackendOverview] = useState<AnalyticsOverview | null>(null)
  const [backendTrends, setBackendTrends] = useState<TrendDataPoint[]>([])
  const [backendCategories, setBackendCategories] = useState<CategoryBreakdownItem[]>([])
  const [backendInsights, setBackendInsights] = useState<FinancialInsight[]>([])
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState<boolean>(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // Fetch live analytics from backend scoped to authenticated user and selected date period
  const fetchAnalyticsData = useCallback(async () => {
    setIsFetchingAnalytics(true)
    setAnalyticsError(null)

    try {
      const queryParams = {
        period,
        startDate: customStart,
        endDate: customEnd,
      }

      const [overviewData, trendsData, categoriesData, insightsData] = await Promise.all([
        analyticsService.getOverview(queryParams),
        analyticsService.getTrends(queryParams),
        analyticsService.getCategoryBreakdown(queryParams),
        analyticsService.getInsights(queryParams),
      ])

      setBackendOverview(overviewData)
      setBackendTrends(trendsData)
      setBackendCategories(categoriesData)
      setBackendInsights(insightsData)
    } catch (err: any) {
      console.warn('Backend analytics fetch error, falling back to local finance state:', err)
      setAnalyticsError(err.message || 'Unable to fetch analytics from server')
    } finally {
      setIsFetchingAnalytics(false)
    }
  }, [period, customStart, customEnd])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Fallback local calculations from actual context transactions if server request fails
  const localSummary = useMemo(() => {
    return calculateAnalyticsSummary(transactions, period, customStart, customEnd)
  }, [transactions, period, customStart, customEnd])

  const localCategorySpending = useMemo(() => {
    return calculateCategorySpending(transactions)
  }, [transactions])

  const localTopCategories = useMemo(() => {
    return calculateTopCategories(transactions)
  }, [transactions])

  const localBudgetPerformance = useMemo(() => {
    return calculateBudgetPerformance(budgets, transactions)
  }, [budgets, transactions])

  const localGoalProgress = useMemo(() => {
    return calculateGoalProgress(goals)
  }, [goals])

  const localTrends = useMemo(() => {
    return calculateTrendsFromTransactions(transactions, period, customStart, customEnd)
  }, [transactions, period, customStart, customEnd])

  const localInsights = useMemo(() => {
    return generateFinancialInsights(transactions, budgets, goals, localSummary)
  }, [transactions, budgets, goals, localSummary])

  // Prefer backend data, seamlessly fallback to local live state
  const effectiveSummary = backendOverview
    ? {
        totalIncome: backendOverview.current.totalIncome,
        totalExpenses: backendOverview.current.totalExpenses,
        netSavings: backendOverview.current.netCashFlow,
        savingsRate: backendOverview.current.savingsRate,
      }
    : localSummary

  const effectiveTrends = backendTrends.length > 0 ? backendTrends : localTrends
  const effectiveCategories =
    backendCategories.length > 0 ? backendCategories : localCategorySpending
  const effectiveTopCategories = useMemo(() => {
    if (backendCategories.length > 0) {
      return backendCategories.slice(0, 5)
    }
    return localTopCategories
  }, [backendCategories, localTopCategories])

  const effectiveBudgetPerformance = localBudgetPerformance
  const effectiveGoalProgress = localGoalProgress
  const effectiveInsights =
    backendInsights.length > 0 ? backendInsights : localInsights

  // Format Delta Badge
  const renderDeltaBadge = (delta: number | undefined, isExpense: boolean = false) => {
    if (delta === undefined || isNaN(delta)) return null

    const isPositive = delta > 0
    const isZero = delta === 0

    if (isZero) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          <Minus size={12} /> 0% vs prev
        </span>
      )
    }

    // For expenses: increase is red, decrease is green. For income: increase is green, decrease is red.
    const isGood = isExpense ? !isPositive : isPositive
    const color = isGood ? '#10b981' : '#ef4444'

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color,
          background: isGood ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '2px 6px',
          borderRadius: '6px',
        }}
      >
        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {isPositive ? `+${delta}%` : `${delta}%`} vs prev
      </span>
    )
  }

  const handlePeriodChange = (
    newPeriod: PeriodType,
    newStart?: string,
    newEnd?: string
  ) => {
    setPeriod(newPeriod)
    setCustomStart(newStart)
    setCustomEnd(newEnd)
  }

  const hasTransactions = transactions && transactions.length > 0
  const isLoading = financeLoading && isFetchingAnalytics && !backendOverview

  if (isLoading) {
    return (
      <div className="analytics-page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Analytics & Smart Insights</h1>
            <p className="page-subtitle">Understand your spending and financial habits.</p>
          </div>
        </header>

        <div className="table-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 1rem',
              width: '32px',
              height: '32px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>
            Calculating financial metrics and smart insights...
          </p>
        </div>
      </div>
    )
  }

  if (!hasTransactions) {
    return (
      <div className="analytics-page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Analytics & Smart Insights</h1>
            <p className="page-subtitle">Understand your spending and financial habits.</p>
          </div>
          <DateRangeFilter
            period={period}
            startDate={customStart}
            endDate={customEnd}
            onPeriodChange={handlePeriodChange}
          />
        </header>

        <div className="table-card empty-table-container">
          <div className="empty-state">
            <BarChart3 size={44} className="empty-icon" />
            <h3 className="empty-title">No financial activity recorded</h3>
            <p className="empty-description">
              Add income or expense transactions to unlock real-time financial analytics,
              category distribution, and smart insights.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      {/* Header with Date-Range Filter */}
      <header
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="page-title">Analytics & Smart Insights</h1>
          <p className="page-subtitle">Data-driven performance overview & health metrics</p>
        </div>

        <DateRangeFilter
          period={period}
          startDate={customStart}
          endDate={customEnd}
          onPeriodChange={handlePeriodChange}
        />
      </header>

      {analyticsError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#f87171',
          }}
        >
          <span>{analyticsError}</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
            onClick={() => {
              refreshData()
              fetchAnalyticsData()
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Financial Overview Metric Cards (Income, Expense, Net Flow, Savings Rate) */}
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
              {formatAmount(effectiveSummary.totalIncome)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="stat-card-subtitle">Gross period income</span>
              {backendOverview && renderDeltaBadge(backendOverview.changes.incomeChange, false)}
            </div>
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
              {formatAmount(effectiveSummary.totalExpenses)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="stat-card-subtitle">Total period spending</span>
              {backendOverview && renderDeltaBadge(backendOverview.changes.expenseChange, true)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Net Cash Flow</span>
            <div className="stat-card-icon-wrap balance-icon-wrap" aria-hidden="true">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-card-content">
            <div
              className={`stat-card-amount ${
                effectiveSummary.netSavings < 0 ? 'text-danger' : 'text-success'
              }`}
            >
              {formatAmount(effectiveSummary.netSavings)}
            </div>
            <div className="stat-card-subtitle">
              {effectiveSummary.netSavings >= 0 ? 'Net surplus retained' : 'Deficit this period'}
            </div>
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
            <div className="stat-card-amount">{effectiveSummary.savingsRate}%</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="stat-card-subtitle">Share of income saved</span>
              {backendOverview && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {backendOverview.changes.savingsRateChange >= 0
                    ? `+${backendOverview.changes.savingsRateChange}%`
                    : `${backendOverview.changes.savingsRateChange}%`}{' '}
                  pts
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Performance Quick Cards (Budget Cap & Goal Milestones) */}
      {backendOverview && (backendOverview.budgets.activeCount > 0 || backendOverview.goals.activeCount > 0) && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '1.5rem',
          }}
          aria-label="Secondary Health Metrics"
        >
          {backendOverview.budgets.activeCount > 0 && (
            <div
              className="quick-highlight-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    padding: '10px',
                    borderRadius: '12px',
                  }}
                >
                  <Wallet size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-h)', fontWeight: 600 }}>
                    Budget Utilization ({backendOverview.budgets.utilizationPercentage}%)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Spent {formatAmount(backendOverview.budgets.totalSpent)} of{' '}
                    {formatAmount(backendOverview.budgets.totalLimit)} cap
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#10b981' }}>
                  {formatAmount(backendOverview.budgets.totalRemaining)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>remaining</div>
              </div>
            </div>
          )}

          {backendOverview.goals.activeCount > 0 && (
            <div
              className="quick-highlight-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    padding: '10px',
                    borderRadius: '12px',
                  }}
                >
                  <Target size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-h)', fontWeight: 600 }}>
                    Milestone Progress ({backendOverview.goals.progressPercentage}%)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Saved {formatAmount(backendOverview.goals.totalSaved)} of{' '}
                    {formatAmount(backendOverview.goals.totalTarget)}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#38bdf8' }}>
                  {formatAmount(backendOverview.goals.totalRemaining)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>to goal</div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Analytics Grid */}
      <section className="analytics-main-grid" aria-label="Charts and Visualizations">
        {/* Row 1: Income vs Expenses Comparison & Multi-Series Trends */}
        <IncomeExpenseChart
          data={effectiveTrends.map((t) => ({
            period: t.period,
            income: t.income,
            expenses: t.expenses,
            netCashFlow: t.netCashFlow,
          }))}
        />
        <SpendingTrendChart
          data={effectiveTrends}
          title="Financial Trajectory"
          subtitle="Real-time multi-series breakdown of income and spending"
        />

        {/* Row 2: Category Breakdown Donut & Top Ranked Categories */}
        <CategoryBreakdown data={effectiveCategories} />
        <TopCategories categories={effectiveTopCategories} />

        {/* Row 3: Budget Utilization & Savings Goals Milestones */}
        <BudgetPerformance items={effectiveBudgetPerformance} />
        <GoalProgress goals={effectiveGoalProgress} />
      </section>

      {/* Smart Financial Insights Banner Section */}
      <section aria-label="Automated Financial Insights" style={{ marginTop: '1.5rem' }}>
        <FinancialInsights insights={effectiveInsights} />
      </section>
    </div>
  )
}

export default Analytics
