import rateLimit from 'express-rate-limit'

/**
 * Rate limiter specifically for authentication endpoints (/api/auth/login, /api/auth/register)
 * Allows up to 20 attempts per 15 minutes window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip rate limiting during test runs
})

/**
 * Rate limiter specifically for password change attempts
 * Allows up to 10 attempts per 15 minutes window
 */
export const passwordChangeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password modification attempts. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test',
})

