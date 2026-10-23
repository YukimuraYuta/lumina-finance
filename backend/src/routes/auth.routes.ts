import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate } from '../middleware/auth.middleware'
import { authRateLimiter, passwordChangeRateLimiter } from '../middleware/rateLimiter'
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validations/auth.validation'

const router = Router()

// Public auth endpoints (rate-limited)
router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  AuthController.register
)

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  AuthController.login
)

router.post('/logout', AuthController.logout)

// Protected user management endpoints
router.get('/me', authenticate, AuthController.getMe)

router.patch(
  '/change-password',
  authenticate,
  passwordChangeRateLimiter,
  validate({ body: changePasswordSchema }),
  AuthController.changePassword
)

router.patch(
  '/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  AuthController.updateProfile
)

export default router
