import express, { Application } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import healthRoutes from './routes/health.routes'
import transactionRoutes from './routes/transaction.routes'
import budgetRoutes from './routes/budget.routes'
import goalRoutes from './routes/goal.routes'
import analyticsRoutes from './routes/analytics.routes'
import authRoutes from './routes/auth.routes'
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler'

import helmet from 'helmet'
import { config } from './config/env'

const app: Application = express()

// Enable trust proxy in production
if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// Configure CORS for frontend access with explicit credentials support
const allowedOrigins = config.CLIENT_ORIGIN.split(',').map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Anti-CSRF verification for cookie-authenticated mutating requests
app.use((req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  if (mutatingMethods.includes(req.method) && req.cookies && req.cookies.token) {
    const origin = req.headers.origin || req.headers.referer
    if (origin) {
      const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed))
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Cross-site request forgery protection: origin not authorized.',
        })
      }
    }
  }
  next()
})

// Request cookie & body parsers with strict size limits
app.use(cookieParser())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

// Register API Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/analytics', analyticsRoutes)

// 404 Handler for unmatched routes
app.use(notFoundHandler)

// Centralized Error Handling Middleware
app.use(globalErrorHandler)

export default app
