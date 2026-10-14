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
import type { DailySpending } from '../../types/finance'
import { formatCurrency } from '../../utils/mockData'

interface SpendingChartProps {
  data: DailySpending[]
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Weekly Spending Overview</h3>
          <p className="chart-subtitle">Daily expense activity for this week</p>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text)', fontSize: 12 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text)', fontSize: 12 }}
              tickFormatter={(value: number) => `₹${value}`}
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
              fill="url(#spendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SpendingChart
