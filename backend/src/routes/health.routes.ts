import { Router } from 'express'
import { getHealthStatus } from '../controllers/health.controller'

const router = Router()

/**
 * @route GET /api/health
 * @desc  Health check endpoint for Lumina Finance API
 * @access Public
 */
router.get('/', getHealthStatus)

export default router
