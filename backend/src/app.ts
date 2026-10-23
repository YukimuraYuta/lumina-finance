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

const app: Application = express()

// Configure CORS for frontend access with explicit credentials support
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    credentials: true,
  })
)

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
