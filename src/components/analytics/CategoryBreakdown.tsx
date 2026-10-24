import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import type { CategoryBreakdownItem } from '../../types/analytics'
import { useFinance } from '../../hooks/useFinance'

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[]
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  const { user } = useFinance()
  const currency = user.currency || '₹'

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Expense Categories</h3>
            <p className="chart-subtitle">Expense distribution by category</p>
          </div>
        </div>
        <div className="empty-chart-fallback" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No category breakdown available for this period.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Category Breakdown</h3>
          <p className="chart-subtitle">Expense distribution by category</p>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cat-cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                borderRadius: '10px',
                color: 'var(--text-h)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                padding: '10px 14px',
              }}
              formatter={(value, name, item) => [
                `${currency}${Number(value || 0).toLocaleString()} (${item.payload.percentage}%)`,
                name,
              ]}
              labelStyle={{ color: 'var(--text-h)', fontWeight: 600 }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: 'var(--text-h)', fontSize: '12px', fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CategoryBreakdown
