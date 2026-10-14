import React from 'react'
import { Sparkles, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react'
import type { FinancialInsight } from '../../types/analytics'

interface FinancialInsightsProps {
  insights: FinancialInsight[]
}

const getInsightIcon = (type: FinancialInsight['type']) => {
  switch (type) {
    case 'warning':
      return <AlertCircle size={18} className="insight-icon-warning" />
    case 'success':
      return <CheckCircle2 size={18} className="insight-icon-success" />
    default:
      return <TrendingUp size={18} className="insight-icon-info" />
  }
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="chart-card insights-card">
        <div className="chart-card-header">
          <div className="insights-brand-header">
            <Sparkles size={18} className="sparkles-icon" />
            <h3 className="chart-title">Financial Insights</h3>
          </div>
        </div>
        <div className="empty-chart-fallback">
          <p>No financial insights generated for this period.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card insights-card">
      <div className="chart-card-header">
        <div className="insights-brand-header">
          <Sparkles size={20} className="sparkles-icon" />
          <div>
            <h3 className="chart-title">Financial Insights</h3>
            <p className="chart-subtitle">Automated rule-based observations & alerts</p>
          </div>
        </div>
      </div>

      <div className="insights-list">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`insight-item insight-${insight.type}`}
          >
            <div className="insight-icon-wrap">{getInsightIcon(insight.type)}</div>
            <div className="insight-body">
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-description">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinancialInsights
