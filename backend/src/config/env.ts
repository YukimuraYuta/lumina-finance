import dotenv from 'dotenv'

dotenv.config()

interface AppConfig {
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  CLIENT_ORIGIN: string
  DATABASE_URL: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
}

const getEnvironmentConfig = (): AppConfig => {
  const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test'
  const PORT = parseInt(process.env.PORT || '5000', 10)
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  const DATABASE_URL = process.env.DATABASE_URL || ''
  const JWT_SECRET = process.env.JWT_SECRET || 'lumina_super_secret_jwt_key_2026_finance_student_app'
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

  if (NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL) {
      throw new Error('FATAL: DATABASE_URL is required in production environment.')
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'FATAL: JWT_SECRET must be at least 32 characters long in production environment.'
      )
    }
    if (process.env.JWT_SECRET === 'lumina_super_secret_jwt_key_2026_finance_student_app') {
      throw new Error('FATAL: Insecure default JWT_SECRET cannot be used in production.')
    }
  }

  return {
    PORT: isNaN(PORT) ? 5000 : PORT,
    NODE_ENV,
    CLIENT_ORIGIN,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
  }
}

export const config = getEnvironmentConfig()
