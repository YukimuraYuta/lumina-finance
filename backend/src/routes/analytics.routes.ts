import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth.middleware'

import { validate } from '../middleware/validate.middleware'
import { spendingTrendQuerySchema } from '../validations/analytics.validation'

const router = Router()

router.use(authenticate)

router.get('/summary', AnalyticsController.getSummary)
router.get(
  '/spending-trend',
  validate({ query: spendingTrendQuerySchema }),
  AnalyticsController.getSpendingTrend
)
router.get('/categories', AnalyticsController.getCategories)
router.get('/budget-performance', AnalyticsController.getBudgetPerformance)

export default router
