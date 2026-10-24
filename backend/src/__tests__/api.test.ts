import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Lumina Finance REST API Suite', () => {
  let authToken: string
  let createdTransactionId: string
  let createdBudgetId: string
  let createdGoalId: string

  beforeAll(async () => {
    // Create an authenticated session for REST API suite
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'API Test User',
      email: `api.test.${Date.now()}@lumina.test`,
      password: 'StrongPassword123!',
    })
    expect(userRes.status).toBe(201)
    authToken = userRes.body.data.token
  })

  describe('Health API', () => {
    it('GET /api/health should return 200 OK without authentication', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })

  describe('Unauthenticated Access Control (Protected Routes)', () => {
    it('GET /api/transactions without token returns 401', async () => {
      const res = await request(app).get('/api/transactions')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/transactions without token returns 401', async () => {
      const res = await request(app).post('/api/transactions').send({
        description: 'No auth tx',
        category: 'Food',
        amount: 100,
        type: 'expense',
        date: new Date().toISOString(),
      })
      expect(res.status).toBe(401)
    })

    it('GET /api/budgets without token returns 401', async () => {
      const res = await request(app).get('/api/budgets')
      expect(res.status).toBe(401)
    })

    it('GET /api/goals without token returns 401', async () => {
      const res = await request(app).get('/api/goals')
      expect(res.status).toBe(401)
    })

    it('GET /api/analytics/summary without token returns 401', async () => {
      const res = await request(app).get('/api/analytics/summary')
      expect(res.status).toBe(401)
    })
  })

  describe('Transactions API & Validation', () => {
    it('GET /api/transactions returns transactions list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.pagination).toBeDefined()
    })

    it('POST /api/transactions with valid data creates transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Groceries',
          category: 'Food',
          amount: 450.5,
          type: 'expense',
          date: new Date().toISOString(),
          notes: 'Weekly grocery shopping',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.description).toBe('Test Groceries')
      expect(res.body.data.amount).toBe(450.5)
      expect(res.body.data.type).toBe('expense')
      createdTransactionId = res.body.data.id
    })

    it('POST /api/transactions with negative amount returns 400 validation error', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Invalid Tx',
          category: 'Food',
          amount: -50,
          type: 'expense',
          date: new Date().toISOString(),
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })

    it('POST /api/transactions with zero amount returns 400 validation error', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Zero Tx',
          category: 'Food',
          amount: 0,
          type: 'expense',
          date: new Date().toISOString(),
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/transactions exceeding max amount returns 400 validation error', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Excessive Tx',
          category: 'Food',
          amount: 99999999999,
          type: 'expense',
          date: new Date().toISOString(),
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/transactions with invalid date returns 400 validation error', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Bad Date Tx',
          category: 'Food',
          amount: 100,
          type: 'expense',
          date: 'not-a-date',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('POST /api/transactions rejects mass assignment of protected fields (e.g. userId, id)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Injected Tx',
          category: 'Food',
          amount: 100,
          type: 'expense',
          date: new Date().toISOString(),
          userId: 'injected-admin-user-id',
          id: 'custom-id',
        })

      // Strict schema rejects unknown fields with 400 Bad Request
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/transactions/:id returns specific transaction', async () => {
      const res = await request(app)
        .get(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdTransactionId)
    })

    it('GET /api/transactions with filtering and pagination parameters', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense&limit=10&page=1')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.pagination.limit).toBe(10)
      expect(res.body.pagination.page).toBe(1)
    })

    it('GET /api/transactions with invalid pagination limit (>100) returns 400', async () => {
      const res = await request(app)
        .get('/api/transactions?limit=500')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('PATCH /api/transactions/:id updates transaction fields', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Groceries Description',
          amount: 520,
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.description).toBe('Updated Groceries Description')
      expect(res.body.data.amount).toBe(520)
    })

    it('DELETE /api/transactions/:id deletes transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const verifyRes = await request(app)
        .get(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(verifyRes.status).toBe(404)
    })

    it('DELETE /api/transactions/:id on missing record returns 404', async () => {
      const res = await request(app)
        .delete('/api/transactions/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Budgets API & Validation', () => {
    it('POST /api/budgets creates a budget for authenticated user', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Food',
          limit: 6000,
          period: 'monthly',
          startDate: new Date().toISOString(),
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.category).toBe('Food')
      expect(res.body.data.limit).toBe(6000)
      expect(typeof res.body.data.spent).toBe('number')
      expect(res.body.data.status).toBeDefined()
      createdBudgetId = res.body.data.id
    })

    it('POST /api/budgets with invalid date range (endDate < startDate) returns 400', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category: 'Transport',
          limit: 2000,
          period: 'custom',
          startDate: '2026-12-31T00:00:00.000Z',
          endDate: '2026-01-01T00:00:00.000Z',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/budgets returns list with spent calculations', async () => {
      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('DELETE /api/budgets/:id removes budget', async () => {
      const res = await request(app)
        .delete(`/api/budgets/${createdBudgetId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Goals API & Concurrency', () => {
    it('POST /api/goals creates a goal with progress', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Gaming Console',
          targetAmount: 40000,
          currentAmount: 10000,
          deadline: '2026-12-31T00:00:00.000Z',
          category: 'Entertainment',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.percentage).toBe(25)
      expect(res.body.data.remainingAmount).toBe(30000)
      createdGoalId = res.body.data.id
    })

    it('POST /api/goals/:id/contribute increments currentAmount atomically', async () => {
      const res = await request(app)
        .post(`/api/goals/${createdGoalId}/contribute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 5000 })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.currentAmount).toBe(15000)
      expect(res.body.data.percentage).toBe(38)
    })

    it('POST /api/goals/:id/contribute with non-positive amount returns 400', async () => {
      const res = await request(app)
        .post(`/api/goals/${createdGoalId}/contribute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: -500 })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('DELETE /api/goals/:id removes goal', async () => {
      const res = await request(app)
        .delete(`/api/goals/${createdGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Analytics API & Query Validation', () => {
    it('GET /api/analytics/summary returns totals', async () => {
      const res = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(typeof res.body.data.totalIncome).toBe('number')
      expect(typeof res.body.data.totalExpenses).toBe('number')
      expect(typeof res.body.data.netSavings).toBe('number')
      expect(typeof res.body.data.savingsRate).toBe('number')
    })

    it('GET /api/analytics/spending-trend returns historical points', async () => {
      const res = await request(app)
        .get('/api/analytics/spending-trend?days=7')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('GET /api/analytics/spending-trend with invalid days parameter (> 365) returns 400', async () => {
      const res = await request(app)
        .get('/api/analytics/spending-trend?days=9999')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/analytics/categories returns category breakdown', async () => {
      const res = await request(app)
        .get('/api/analytics/categories')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('GET /api/analytics/overview returns structured metrics with date ranges and MoM deltas', async () => {
      const res = await request(app)
        .get('/api/analytics/overview?period=month')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.dateRange).toBeDefined()
      expect(res.body.data.dateRange.period).toBe('month')
      expect(typeof res.body.data.current.totalIncome).toBe('number')
      expect(typeof res.body.data.current.totalExpenses).toBe('number')
      expect(typeof res.body.data.current.netCashFlow).toBe('number')
      expect(typeof res.body.data.current.savingsRate).toBe('number')
      expect(res.body.data.changes).toBeDefined()
      expect(typeof res.body.data.changes.incomeChange).toBe('number')
      expect(typeof res.body.data.changes.expenseChange).toBe('number')
      expect(res.body.data.budgets).toBeDefined()
      expect(res.body.data.goals).toBeDefined()
    })

    it('GET /api/analytics/overview with invalid date range (endDate < startDate) returns 400', async () => {
      const res = await request(app)
        .get('/api/analytics/overview?startDate=2026-12-31&endDate=2026-01-01')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/analytics/trends returns multi-series interval data', async () => {
      const res = await request(app)
        .get('/api/analytics/trends?period=month&interval=daily')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      if (res.body.data.length > 0) {
        const point = res.body.data[0]
        expect(point).toHaveProperty('period')
        expect(point).toHaveProperty('income')
        expect(point).toHaveProperty('expenses')
        expect(point).toHaveProperty('netCashFlow')
      }
    })

    it('GET /api/analytics/insights returns rule-based smart insights', async () => {
      const res = await request(app)
        .get('/api/analytics/insights?period=month')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      if (res.body.data.length > 0) {
        const insight = res.body.data[0]
        expect(insight).toHaveProperty('id')
        expect(insight).toHaveProperty('title')
        expect(insight).toHaveProperty('description')
        expect(['warning', 'info', 'success']).toContain(insight.type)
      }
    })

    it('validates user data isolation for analytics metrics', async () => {
      // Register a second isolated user
      const user2Res = await request(app).post('/api/auth/register').send({
        name: 'Isolated Analytics User',
        email: `isolated.analytics.${Date.now()}@lumina.test`,
        password: 'StrongPassword123!',
      })
      const user2Token = user2Res.body.data.token

      // Create an expense for user2
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          description: 'User2 Private Expense',
          category: 'Shopping',
          amount: 8888,
          type: 'expense',
          date: new Date().toISOString(),
        })

      // Fetch User 1 analytics overview
      const user1Res = await request(app)
        .get('/api/analytics/overview?period=month')
        .set('Authorization', `Bearer ${authToken}`)

      // Fetch User 2 analytics overview
      const user2AnalyticsRes = await request(app)
        .get('/api/analytics/overview?period=month')
        .set('Authorization', `Bearer ${user2Token}`)

      // User 2 expenses should include 8888, but User 1 must not include it
      expect(user2AnalyticsRes.body.data.current.totalExpenses).toBe(8888)
      expect(user1Res.body.data.current.totalExpenses).not.toBe(8888)
    })
  })
})
