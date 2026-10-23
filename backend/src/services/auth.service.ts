import prisma from '../lib/prisma'
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../utils/auth.utils'
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validations/auth.validation'

export interface SafeUser {
  id: string
  name: string
  email: string
  role: string
  currency: string
  theme: string
  createdAt: Date
  updatedAt: Date
}

export class AuthService {
  /**
   * Filter sensitive fields from User record before sending to client
   */
  private static sanitizeUser(user: any): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      currency: user.currency,
      theme: user.theme,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
    const normalizedEmail = input.email.trim().toLowerCase()

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      const error: any = new Error('An account with this email address already exists')
      error.statusCode = 409
      throw error
    }

    // Hash password using bcrypt (work factor 12)
    const hashedPassword = await hashPassword(input.password)

    // Persist new user in PostgreSQL via Prisma
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: input.role || 'Student',
        currency: input.currency || '₹',
        theme: input.theme || 'system',
      },
    })

    const safeUser = this.sanitizeUser(user)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { user: safeUser, token }
  }

  /**
   * Authenticate user with email and password
   */
  static async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const normalizedEmail = input.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Constant-time check / generic message to avoid leaking user existence
    if (!user) {
      const error: any = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    const isPasswordValid = await comparePassword(input.password, user.password)
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    const safeUser = this.sanitizeUser(user)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { user: safeUser, token }
  }

  /**
   * Fetch current authenticated user's safe profile
   */
  static async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      const error: any = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    return this.sanitizeUser(user)
  }

  /**
   * Change user password securely
   */
  static async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      const error: any = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const isCurrentValid = await comparePassword(
      input.currentPassword,
      user.password
    )
    if (!isCurrentValid) {
      const error: any = new Error('Current password is incorrect')
      error.statusCode = 400
      throw error
    }

    const newHashedPassword = await hashPassword(input.newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    })
  }

  /**
   * Update user profile information
   */
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.role && { role: input.role.trim() }),
        ...(input.currency && { currency: input.currency.trim() }),
        ...(input.theme && { theme: input.theme }),
      },
    })

    return this.sanitizeUser(user)
  }
}
