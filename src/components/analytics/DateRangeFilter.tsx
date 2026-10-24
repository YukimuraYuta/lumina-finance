import React, { useState } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import type { PeriodType } from '../../types/analytics'
import { validateDateRange } from '../../utils/dateRange'

interface DateRangeFilterProps {
  period: PeriodType
  startDate?: string
  endDate?: string
  onPeriodChange: (period: PeriodType, customStart?: string, customEnd?: string) => void
}

const PRESET_OPTIONS: { label: string; value: PeriodType }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'quarter' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
]

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  period,
  startDate,
  endDate,
  onPeriodChange,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customStart, setCustomStart] = useState(
    startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [customEnd, setCustomEnd] = useState(
    endDate || new Date().toISOString().split('T')[0]
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSelectPreset = (selected: PeriodType) => {
    if (selected === 'custom') {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
      setValidationError(null)
      onPeriodChange(selected)
    }
  }

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateDateRange(customStart, customEnd)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid date range')
      return
    }
    setValidationError(null)
    setIsCustomOpen(false)
    onPeriodChange('custom', customStart, customEnd)
  }

  return (
    <div className="date-range-filter-wrapper" style={{ position: 'relative' }}>
      <div
        className="period-selector-wrap"
        role="group"
        aria-label="Select Analytics Time Period"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '4px',
          flexWrap: 'wrap',
        }}
      >
        <Calendar size={15} style={{ color: 'var(--text-secondary)', marginLeft: '8px' }} aria-hidden="true" />
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {PRESET_OPTIONS.map((opt) => {
            const isActive = period === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`filter-btn ${isActive ? 'filter-btn-active' : ''}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}
                onClick={() => handleSelectPreset(opt.value)}
                aria-pressed={isActive}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Date Range Popover */}
      {isCustomOpen && (
        <div
          role="dialog"
          aria-label="Custom Date Range Picker"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 40,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            width: '320px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-h)' }}>
              Select Custom Range
            </h4>
            <button
              type="button"
              onClick={() => setIsCustomOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
              aria-label="Close custom date range"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleApplyCustom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                htmlFor="custom-start-date"
                style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}
              >
                Start Date
              </label>
              <input
                id="custom-start-date"
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value)
                  setValidationError(null)
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-h)',
                  fontSize: '0.875rem',
                }}
                required
              />
            </div>

            <div>
              <label
                htmlFor="custom-end-date"
                style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}
              >
                End Date
              </label>
              <input
                id="custom-end-date"
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value)
                  setValidationError(null)
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-h)',
                  fontSize: '0.875rem',
                }}
                required
              />
            </div>

            {validationError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#f87171',
                  fontSize: '0.78rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                }}
              >
                <AlertCircle size={14} />
                <span>{validationError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => setIsCustomOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Apply Range
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default DateRangeFilter
