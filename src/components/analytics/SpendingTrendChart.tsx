import React, { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import type { TrendDataPoint, SpendingDataPoint } from '../../types/analytics'
import { useFinance } from '../../hooks/useFinance'

interface SpendingTrendChartProps {
  data: (TrendDataPoint | SpendingDataPoint)[]
  title?: string
  subtitle?: string
}

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  title = 'Financial Trends Over Time',
  subtitle = 'Track income, spending, and net cash flow trajectories',
}) => {
  const { user } = useFinance()
  const currency = user.currency || '₹'
  const [viewMode, setViewMode] = useState<'all' | 'expenses' | 'net'>('all')

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">{title}</h3>
            <p className="chart-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="empty-chart-fallback" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No trend data recorded for this period.</p>
        </div>
      </div>
    )
  }

  // Format data point labels
  const formattedData = data.map((d) => ({
    ...d,
    displayLabel: (d as any).period || d.date,
    expenseAmount: (d as any).expenses !== undefined ? (d as any).expenses : d.amount,
    incomeAmount: (d as any).income !== undefined ? (d as any).income : 0,
    netFlow:
      (d as any).netCashFlow !== undefined
        ? (d as any).netCashFlow
        : ((d as any).income || 0) - d.amount,
  }))

  const hasIncomeData = formattedData.some((d) => d.incomeAmount > 0)

  return (
    <div className="chart-card">
      <div
        className="chart-card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>

        {hasIncomeData && (
          <div
            className="trend-filter-toggle"
            role="group"
            aria-label="Filter Trend View"
            style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              className={`filter-btn ${viewMode === 'all' ? 'filter-btn-active' : ''}`}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: viewMode === 'all' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'all' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setViewMode('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${viewMode === 'expenses' ? 'filter-btn-active' : ''}`}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: viewMode === 'expenses' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'expenses' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setViewMode('expenses')}
            >
              Expenses
            </button>
            <button
              type="button"
              className={`filter-btn ${viewMode === 'net' ? 'filter-btn-active' : ''}`}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: viewMode === 'net' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'net' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setViewMode('net')}
            >
              Net Flow
            </button>
          </div>
        )}
      </div>

      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="analyticsExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="analyticsIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="displayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(val: number) => `${currency}${val.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                borderRadius: '10px',
                color: 'var(--text-h)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                padding: '10px 14px',
              }}
              formatter={(value, name) => [
                `${currency}${Number(value || 0).toLocaleString()}`,
                name === 'incomeAmount'
                  ? 'Income'
                  : name === 'expenseAmount'
                  ? 'Expenses'
                  : 'Net Cash Flow',
              ]}
              labelStyle={{ color: 'var(--text-h)', fontWeight: 600, marginBottom: '4px' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px' }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--text-h)', fontSize: '12px', fontWeight: 600 }}>
                  {value === 'incomeAmount'
                    ? 'Income (+)'
                    : value === 'expenseAmount'
                    ? 'Expenses (-)'
                    : 'Net Cash Flow'}
                </span>
              )}
            />

            {(viewMode === 'all' || viewMode === 'expenses') && (
              <Area
                type="monotone"
                dataKey="expenseAmount"
                name="expenseAmount"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#analyticsExpenseGrad)"
              />
            )}

            {hasIncomeData && (viewMode === 'all' || viewMode === 'net') && (
              <Area
                type="monotone"
                dataKey="incomeAmount"
                name="incomeAmount"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#analyticsIncomeGrad)"
              />
            )}

            {hasIncomeData && (viewMode === 'all' || viewMode === 'net') && (
              <Line
                type="monotone"
                dataKey="netFlow"
                name="netFlow"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SpendingTrendChart
