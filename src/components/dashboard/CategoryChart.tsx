import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import type { CategorySpending } from '../../types/finance'
import { formatCurrency } from '../../utils/mockData'

interface CategoryChartProps {
  data: CategorySpending[]
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Category Breakdown</h3>
          <p className="chart-subtitle">Distribution of monthly expenses</p>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
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
              formatter={(value) => [formatCurrency(Number(value) || 0), 'Spent']}
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

export default CategoryChart
