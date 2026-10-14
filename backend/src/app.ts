import express, { Application } from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes'
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler'

const app: Application = express()

// Configure CORS for frontend access
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Request body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Register API Routes
app.use('/api/health', healthRoutes)

// 404 Handler for unmatched routes
app.use(notFoundHandler)

// Centralized Error Handling Middleware
app.use(globalErrorHandler)

export default app
