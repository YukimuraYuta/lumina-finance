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
import { formatCurrency } from '../../utils/mockData'

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[]
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Expense Categories</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No category breakdown available.</p>
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

      <div className="chart-container" style={{ width: '100%', height: 300 }}>
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
                borderRadius: '8px',
                color: 'var(--text-h)',
                boxShadow: 'var(--shadow)',
              }}
              formatter={(value, name, item) => [
                `${formatCurrency(Number(value) || 0)} (${item.payload.percentage}%)`,
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
                <span style={{ color: 'var(--text)', fontSize: '12px', fontWeight: 500 }}>
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
