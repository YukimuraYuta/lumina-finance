import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/summary', AnalyticsController.getSummary)
router.get('/spending-trend', AnalyticsController.getSpendingTrend)
router.get('/categories', AnalyticsController.getCategories)
router.get('/budget-performance', AnalyticsController.getBudgetPerformance)

export default router
