import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Lumina Finance Authentication & Security Suite', () => {
  const testUser = {
    name: 'Security Test User',
    email: `sec.user.${Date.now()}@lumina.test`,
    password: 'SecurePassword123!',
  }

  let authToken: string
  let authUserId: string

  describe('User Registration (POST /api/auth/register)', () => {
    it('creates new user account and returns safe user with JWT token', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase())
      expect(res.body.data.user.name).toBe(testUser.name)

      // Strict security requirement: never leak password or hash in response
      expect(res.body.data.user.password).toBeUndefined()

      authToken = res.body.data.token
      authUserId = res.body.data.user.id
    })

    it('rejects registration with duplicate email with 409 Conflict', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser)

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toMatch(/already exists/i)
    })

    it('rejects registration with weak password (< 8 chars) with 400 Bad Request', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Weak Pass',
        email: `weak.${Date.now()}@lumina.test`,
        password: 'weak',
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })

    it('rejects registration with invalid email format with 400 Bad Request', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'SecurePassword123!',
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })
  })

  describe('User Login (POST /api/auth/login)', () => {
    it('authenticates valid credentials and returns safe user with token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.password).toBeUndefined()
    })

    it('rejects incorrect password with generic 401 error', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'IncorrectPassword999!',
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Invalid email or password')
    })

    it('rejects non-existent email with identical generic 401 error (no email enumeration)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'non.existent.user@lumina.test',
        password: 'SecurePassword123!',
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Invalid email or password')
    })
  })

  describe('Current User Profile (GET /api/auth/me)', () => {
    it('returns authenticated user profile when valid Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(authUserId)
      expect(res.body.data.email).toBe(testUser.email.toLowerCase())
    })

    it('rejects request without token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('x-disable-dev-auth', 'true')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('rejects invalid / tampered token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Profile & Password Management', () => {
    it('updates user profile via PATCH /api/auth/profile', async () => {
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Security Name',
          currency: '€',
          theme: 'dark',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Updated Security Name')
      expect(res.body.data.currency).toBe('€')
      expect(res.body.data.theme).toBe('dark')
    })

    it('fails to change password when current password is wrong', async () => {
      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongOldPassword1!',
          newPassword: 'BrandNewPassword99!',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toMatch(/current password is incorrect/i)
    })

    it('successfully changes password with valid current password', async () => {
      const res = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'BrandNewPassword99!',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      // Verify login works with new password
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'BrandNewPassword99!',
      })
      expect(loginRes.status).toBe(200)
      expect(loginRes.body.success).toBe(true)
    })
  })

  describe('User Data Isolation Boundary', () => {
    it('ensures User B cannot access or view User A data', async () => {
      // 1. User A creates a transaction
      const txRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Secret User A Transaction',
          category: 'Education',
          amount: 1500,
          type: 'expense',
          date: new Date().toISOString(),
        })
      expect(txRes.status).toBe(201)
      const userATxId = txRes.body.data.id

      // 2. Register User B
      const userBRes = await request(app).post('/api/auth/register').send({
        name: 'User B',
        email: `userb.${Date.now()}@lumina.test`,
        password: 'UserBPassword123!',
      })
      expect(userBRes.status).toBe(201)
      const userBToken = userBRes.body.data.token

      // 3. User B lists transactions -> should NOT contain User A's transaction
      const listRes = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userBToken}`)
      expect(listRes.status).toBe(200)
      const found = listRes.body.data.some((tx: any) => tx.id === userATxId)
      expect(found).toBe(false)

      // 4. User B attempts to access User A's transaction directly -> should return 404
      const getSingleRes = await request(app)
        .get(`/api/transactions/${userATxId}`)
        .set('Authorization', `Bearer ${userBToken}`)
      expect(getSingleRes.status).toBe(404)
    })
  })
})
