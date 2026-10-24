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
            <h3 className="chart-title">Smart Financial Insights</h3>
          </div>
        </div>
        <div className="empty-chart-fallback" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No smart insights generated for this period. Add more activity to unlock automated observations.
          </p>
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
            <h3 className="chart-title">Smart Financial Insights</h3>
            <p className="chart-subtitle">Automated rule-based observations & health alerts</p>
          </div>
        </div>
      </div>

      <div className="insights-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`insight-item insight-${insight.type}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background:
                insight.type === 'warning'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : insight.type === 'success'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(99, 102, 241, 0.08)',
              border: `1px solid ${
                insight.type === 'warning'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : insight.type === 'success'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(99, 102, 241, 0.2)'
              }`,
            }}
          >
            <div className="insight-icon-wrap" style={{ marginTop: '2px' }}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="insight-body" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <h4
                  className="insight-title"
                  style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-h)' }}
                >
                  {insight.title}
                </h4>
                {insight.metric && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-h)',
                    }}
                  >
                    {insight.metric}
                  </span>
                )}
              </div>
              <p
                className="insight-description"
                style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}
              >
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinancialInsights
