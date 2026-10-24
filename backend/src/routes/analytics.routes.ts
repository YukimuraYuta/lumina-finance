import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  spendingTrendQuerySchema,
  analyticsQuerySchema,
} from '../validations/analytics.validation'

const router = Router()

// All analytics endpoints require authenticated session
router.use(authenticate)

// Financial Overview with MoM comparisons
router.get(
  '/overview',
  validate({ query: analyticsQuerySchema }),
  AnalyticsController.getOverview
)

// Dynamic multi-series trends (Daily/Monthly)
router.get(
  '/trends',
  validate({ query: analyticsQuerySchema }),
  AnalyticsController.getTrends
)

// Rule-based Financial Insights Engine
router.get(
  '/insights',
  validate({ query: analyticsQuerySchema }),
  AnalyticsController.getInsights
)

// Spending by Category (with optional date range)
router.get(
  '/categories',
  validate({ query: analyticsQuerySchema }),
  AnalyticsController.getCategories
)

// Summary metrics (all-time or period-filtered)
router.get(
  '/summary',
  validate({ query: analyticsQuerySchema }),
  AnalyticsController.getSummary
)

// Backward-compatible spending trend (days query)
router.get(
  '/spending-trend',
  validate({ query: spendingTrendQuerySchema }),
  AnalyticsController.getSpendingTrend
)

// Budget Performance
router.get('/budget-performance', AnalyticsController.getBudgetPerformance)

export default router
