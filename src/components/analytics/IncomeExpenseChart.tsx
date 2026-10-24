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
import { useFinance } from '../../hooks/useFinance'

interface IncomeExpenseChartProps {
  data: IncomeExpenseDataPoint[]
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const { user } = useFinance()
  const currency = user.currency || '₹'

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Income vs. Expenses</h3>
            <p className="chart-subtitle">Compare earnings against total spending</p>
          </div>
        </div>
        <div className="empty-chart-fallback" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No comparison data available for this period.</p>
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

      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="period"
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
                name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Flow',
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
                  {value === 'income' ? 'Income (+)' : value === 'expenses' ? 'Expenses (-)' : 'Net Flow'}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="expenses"
              name="expenses"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default IncomeExpenseChart
