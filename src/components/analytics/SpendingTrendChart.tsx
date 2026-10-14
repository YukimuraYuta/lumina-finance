import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { SpendingDataPoint } from '../../types/analytics'
import { formatCurrency } from '../../utils/mockData'

interface SpendingTrendChartProps {
  data: SpendingDataPoint[]
}

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Spending Trend</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No spending trend data available for this period.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Spending Trend Over Time</h3>
          <p className="chart-subtitle">Expense progression for selected time period</p>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="analyticsSpendingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text)', fontSize: 12 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text)', fontSize: 12 }}
              tickFormatter={(val: number) => `₹${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--text-h)',
                boxShadow: 'var(--shadow)',
              }}
              formatter={(value) => [formatCurrency(Number(value) || 0), 'Spent']}
              labelStyle={{ color: 'var(--text-h)', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#analyticsSpendingGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SpendingTrendChart
