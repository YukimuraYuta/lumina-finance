import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import type { IncomeExpenseDataPoint } from '../../types/analytics'
import { formatCurrency } from '../../utils/mockData'

interface IncomeExpenseChartProps {
  data: IncomeExpenseDataPoint[]
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Income vs Expenses</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No historical comparison data available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Income vs. Expenses</h3>
          <p className="chart-subtitle">Compare earnings against total spending</p>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="period"
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
              formatter={(value, name) => [
                formatCurrency(Number(value) || 0),
                name === 'income' ? 'Total Income (+)' : 'Total Expenses (-)',
              ]}
              labelStyle={{ color: 'var(--text-h)', fontWeight: 600 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px' }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--text-h)', fontSize: '12px', fontWeight: 600 }}>
                  {value === 'income' ? 'Income (+)' : 'Expenses (-)'}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expenses"
              name="expenses"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default IncomeExpenseChart
