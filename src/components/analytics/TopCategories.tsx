import React from 'react'
import type { TopCategoryItem } from '../../types/analytics'
import { formatCurrency } from '../../utils/mockData'

interface TopCategoriesProps {
  categories: TopCategoryItem[]
}

const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Top Spending Categories</h3>
        </div>
        <div className="empty-chart-fallback">
          <p>No expense categories recorded yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Top Spending Categories</h3>
          <p className="chart-subtitle">Ranked by total expense amount</p>
        </div>
      </div>

      <div className="top-categories-list">
        {categories.map((item, index) => (
          <div key={item.category} className="top-category-item">
            <div className="top-cat-left">
              <span className="rank-badge">#{index + 1}</span>
              <div
                className="cat-color-dot"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="top-cat-name">{item.category}</span>
            </div>

            <div className="top-cat-right">
              <span className="top-cat-amount">{formatCurrency(item.amount)}</span>
              <span className="top-cat-percent">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopCategories
