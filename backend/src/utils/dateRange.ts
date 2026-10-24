export type PeriodFilter =
  | 'week'
  | 'month'
  | 'last_month'
  | 'quarter'
  | '3months'
  | '6months'
  | 'year'
  | 'custom'

export interface DateRangeResult {
  startDate: Date
  endDate: Date
  prevStartDate: Date
  prevEndDate: Date
  periodName: PeriodFilter
}

/**
 * Calculates deterministic inclusive date boundaries for a selected financial period
 * and computes the immediately preceding equivalent period for valid MoM/period-over-period comparisons.
 */
export function resolveDateRange(
  period?: PeriodFilter,
  customStart?: string,
  customEnd?: string
): DateRangeResult {
  const now = new Date()
  let startDate: Date
  let endDate: Date
  let resolvedPeriod: PeriodFilter = period || 'month'

  if (period === 'custom' || (!period && (customStart || customEnd))) {
    resolvedPeriod = 'custom'
    startDate = customStart
      ? new Date(customStart)
      : new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)

    endDate = customEnd ? new Date(customEnd) : new Date(now)
    endDate.setHours(23, 59, 59, 999)
  } else if (period === 'week') {
    // Current week: Monday 00:00:00 to Sunday 23:59:59
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    startDate = new Date(now)
    startDate.setDate(diff)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  } else if (period === 'quarter' || period === '3months') {
    resolvedPeriod = 'quarter'
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 90)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
  } else if (period === '6months') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 180)
    startDate.setHours(0, 0, 0, 0)

    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  } else {
    // Default: 'month' (Current month 1st to last day)
    resolvedPeriod = 'month'
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  // Calculate matching previous comparison window of exact duration
  const durationMs = endDate.getTime() - startDate.getTime() + 1
  const prevEndDate = new Date(startDate.getTime() - 1)
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs + 1)

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    periodName: resolvedPeriod,
  }
}
