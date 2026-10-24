export type PeriodType =
  | 'week'
  | 'month'
  | 'last_month'
  | 'quarter'
  | '3months'
  | '6months'
  | 'year'
  | 'custom'

export interface ResolvedDateRange {
  startDate: Date
  endDate: Date
  prevStartDate: Date
  prevEndDate: Date
  periodName: PeriodType
  label: string
}

/**
 * Calculates exact date boundaries for client-side filtering and API queries
 */
export function resolveDateRange(
  period: PeriodType = 'month',
  customStart?: string,
  customEnd?: string
): ResolvedDateRange {
  const now = new Date()
  let startDate: Date
  let endDate: Date
  let label = 'This Month'
  let resolvedPeriod = period

  if (period === 'custom' || (!period && (customStart || customEnd))) {
    resolvedPeriod = 'custom'
    startDate = customStart
      ? new Date(customStart)
      : new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)

    endDate = customEnd ? new Date(customEnd) : new Date(now)
    endDate.setHours(23, 59, 59, 999)
    label = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else if (period === 'week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    startDate = new Date(now)
    startDate.setDate(diff)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    label = 'This Week'
  } else if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    label = 'Last Month'
  } else if (period === 'quarter' || period === '3months') {
    resolvedPeriod = 'quarter'
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 90)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    label = 'Last 3 Months'
  } else if (period === '6months') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 180)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    label = 'Last 6 Months'
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    label = 'This Year'
  } else {
    // Default 'month'
    resolvedPeriod = 'month'
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    label = 'This Month'
  }

  // Contiguous previous comparison window of identical duration
  const durationMs = endDate.getTime() - startDate.getTime() + 1
  const prevEndDate = new Date(startDate.getTime() - 1)
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs + 1)

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    periodName: resolvedPeriod,
    label,
  }
}

export function validateDateRange(startStr?: string, endStr?: string): { isValid: boolean; error?: string } {
  if (!startStr && !endStr) return { isValid: true }
  if (!startStr) return { isValid: false, error: 'Start date is required for custom range' }
  if (!endStr) return { isValid: false, error: 'End date is required for custom range' }

  const start = new Date(startStr).getTime()
  const end = new Date(endStr).getTime()

  if (isNaN(start)) return { isValid: false, error: 'Invalid start date format' }
  if (isNaN(end)) return { isValid: false, error: 'Invalid end date format' }
  if (end < start) return { isValid: false, error: 'End date cannot be earlier than start date' }

  return { isValid: true }
}
