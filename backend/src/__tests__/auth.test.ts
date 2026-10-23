import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Lumina Finance Authentication & Security Suite', () => {
  const testUser = {
    name: 'Security Test User',
    email: `sec.user.${Date.now()}@lumina.test`,
    password: 'SecurePassword123!',
  }

  let authToken: string
  let authCookie: string
  let authUserId: string

  describe('User Registration (POST /api/auth/register)', () => {
    it('creates new user account, sets HTTP-only cookie, and returns safe user with JWT token', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase())
      expect(res.body.data.user.name).toBe(testUser.name)

      // Strict security requirement: never leak password or hash in response
      expect(res.body.data.user.password).toBeUndefined()

      // Verify HTTP-only cookie is set
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies.some((c: string) => c.includes('token=') && c.includes('HttpOnly'))).toBe(true)

      authToken = res.body.data.token
      authCookie = cookies.find((c: string) => c.includes('token=')) || ''
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

  describe('User Login & Logout (POST /api/auth/login, POST /api/auth/logout)', () => {
    it('authenticates valid credentials, sets HTTP-only cookie, and returns safe user with token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.user.password).toBeUndefined()

      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies.some((c: string) => c.includes('token=') && c.includes('HttpOnly'))).toBe(true)
    })

    it('clears HTTP-only cookie on POST /api/auth/logout', async () => {
      const res = await request(app).post('/api/auth/logout')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      // Cookie is cleared by setting expires in the past or empty value
      expect(cookies.some((c: string) => c.includes('token=;') || c.includes('token=; Max-Age=0') || c.includes('Expires='))).toBe(true)
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

  describe('Authentication Strategies & Middleware (Bearer Token vs Cookie)', () => {
    it('authenticates successfully via Bearer Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(authUserId)
      expect(res.body.data.email).toBe(testUser.email.toLowerCase())
    })

    it('authenticates successfully via HTTP-only Cookie without Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(authUserId)
    })

    it('rejects request without credentials with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('rejects spoofed x-user-id header without valid token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('x-user-id', authUserId)

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('rejects invalid / tampered token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token')

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
    let userBToken: string

    it('proves User B cannot access User A transactions', async () => {
      // 1. User A creates a transaction
      const txRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'User A Private Tuition',
          category: 'Education',
          amount: 2500,
          type: 'expense',
          date: new Date().toISOString(),
        })
      expect(txRes.status).toBe(201)
      const userATxId = txRes.body.data.id

      // 2. Register User B
      const userBRes = await request(app).post('/api/auth/register').send({
        name: 'User B Person',
        email: `isolation.userb.${Date.now()}@lumina.test`,
        password: 'UserBPassword123!',
      })
      expect(userBRes.status).toBe(201)
      userBToken = userBRes.body.data.token

      // 3. User B lists transactions -> User A's transaction is excluded
      const listRes = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userBToken}`)
      expect(listRes.status).toBe(200)
      const found = listRes.body.data.some((tx: any) => tx.id === userATxId)
      expect(found).toBe(false)

      // 4. User B direct GET on User A's transaction -> 404
      const getSingleRes = await request(app)
        .get(`/api/transactions/${userATxId}`)
        .set('Authorization', `Bearer ${userBToken}`)
      expect(getSingleRes.status).toBe(404)

      // 5. User B direct DELETE on User A's transaction -> 404
      const deleteRes = await request(app)
        .delete(`/api/transactions/${userATxId}`)
        .set('Authorization', `Bearer ${userBToken}`)
      expect(deleteRes.status).toBe(404)
    })

    it('proves User B cannot update or delete User A budgets', async () => {
      // User A creates a budget
      const budgetRes = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Shopping',
          limit: 3000,
          period: 'monthly',
          startDate: new Date().toISOString(),
        })
      expect(budgetRes.status).toBe(201)
      const userABudgetId = budgetRes.body.data.id

      // User B attempts to update User A's budget -> 404
      const updateRes = await request(app)
        .patch(`/api/budgets/${userABudgetId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ limit: 9999 })
      expect(updateRes.status).toBe(404)

      // User B attempts to delete User A's budget -> 404
      const deleteRes = await request(app)
        .delete(`/api/budgets/${userABudgetId}`)
        .set('Authorization', `Bearer ${userBToken}`)
      expect(deleteRes.status).toBe(404)
    })

    it('proves User B cannot access or contribute to User A goals', async () => {
      // User A creates a goal
      const goalRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'User A Secret Dream Goal',
          targetAmount: 50000,
          currentAmount: 10000,
        })
      expect(goalRes.status).toBe(201)
      const userAGoalId = goalRes.body.data.id

      // User B attempts to view User A's goal -> 404
      const getRes = await request(app)
        .get(`/api/goals/${userAGoalId}`)
        .set('Authorization', `Bearer ${userBToken}`)
      expect(getRes.status).toBe(404)

      // User B attempts to contribute to User A's goal -> 404
      const contributeRes = await request(app)
        .post(`/api/goals/${userAGoalId}/contribute`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ amount: 500 })
      expect(contributeRes.status).toBe(404)
    })

    it('proves analytics calculate only the current user records', async () => {
      const analyticsRes = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userBToken}`)

      expect(analyticsRes.status).toBe(200)
      // User B has created 0 transactions, so totals must be 0
      expect(analyticsRes.body.data.totalIncome).toBe(0)
      expect(analyticsRes.body.data.totalExpenses).toBe(0)
    })
  })

  describe('Server Hardening & Security Controls', () => {
    it('applies Helmet security headers (nosniff, frameguard, etc.)', async () => {
      const res = await request(app).get('/api/health')

      expect(res.headers['x-content-type-options']).toBe('nosniff')
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(res.headers['x-dns-prefetch-control']).toBe('off')
    })

    it('rejects payload exceeding request body limit (100kb) with 413', async () => {
      const oversizedPayload = {
        name: 'Big Name',
        email: 'big@lumina.test',
        password: 'Password123!',
        notes: 'A'.repeat(120 * 1024), // 120KB payload
      }

      const res = await request(app)
        .post('/api/auth/register')
        .send(oversizedPayload)

      expect(res.status).toBe(413)
    })

    it('returns generic error on invalid JSON request body with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json: true ')

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toMatch(/invalid json/i)
    })
  })
})
