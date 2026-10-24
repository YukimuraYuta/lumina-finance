# Lumina Finance — Analytics API Specification

This document outlines the REST API endpoints provided by the Lumina Finance Analytics Engine.

## Authentication
All endpoints require a verified JWT session either via:
- HTTP-only cookie (`auth_token`)
- Authorization header: `Bearer <token>`

## Base URL
`/api/analytics`

---

## Endpoints

### 1. `GET /api/analytics/overview`
Retrieves a complete financial overview for the specified date range along with Month-over-Month (MoM) baseline comparisons.

**Query Parameters:**
- `period` (optional): `'week' | 'month' | 'last_month' | 'quarter' | '3months' | '6months' | 'year' | 'custom'`
- `startDate` (optional): ISO 8601 string or `YYYY-MM-DD`
- `endDate` (optional): ISO 8601 string or `YYYY-MM-DD`

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "dateRange": {
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-10-31T23:59:59.999Z",
      "prevStartDate": "2026-08-31T00:00:00.001Z",
      "prevEndDate": "2026-09-30T23:59:59.999Z",
      "period": "month"
    },
    "current": {
      "totalIncome": 45000,
      "totalExpenses": 28500,
      "netCashFlow": 16500,
      "savingsRate": 36.7,
      "incomeCount": 3,
      "expenseCount": 14,
      "transactionCount": 17
    },
    "previous": {
      "totalIncome": 40000,
      "totalExpenses": 32000,
      "netCashFlow": 8000,
      "savingsRate": 20.0
    },
    "changes": {
      "incomeChange": 12.5,
      "expenseChange": -10.9,
      "savingsRateChange": 16.7
    },
    "budgets": {
      "totalLimit": 35000,
      "totalSpent": 28500,
      "totalRemaining": 6500,
      "utilizationPercentage": 81,
      "activeCount": 4
    },
    "goals": {
      "totalTarget": 80000,
      "totalSaved": 48000,
      "totalRemaining": 32000,
      "progressPercentage": 60,
      "activeCount": 2
    }
  }
}
```

---

### 2. `GET /api/analytics/trends`
Multi-series time series grouping income, expenses, and net cash flow.

**Query Parameters:**
- `period` (optional): Standard period filter.
- `startDate` / `endDate` (optional): Custom date boundaries.
- `interval` (optional): `'daily' | 'monthly'`. Automatically inferred if omitted (ranges $\le 35$ days use `daily`).

---

### 3. `GET /api/analytics/categories`
Returns expense breakdown grouped by category with totals, counts, percentages, and UI color hexes.

---

### 4. `GET /api/analytics/insights`
Evaluates deterministic rule-based financial observations and health alerts for the active period.
