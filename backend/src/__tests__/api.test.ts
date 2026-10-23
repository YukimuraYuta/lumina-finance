import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Lumina Finance REST API Suite', () => {
  let createdTransactionId: string
  let createdBudgetId: string
  let createdGoalId: string

  describe('Health API', () => {
    it('GET /api/health should return 200 OK', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })

  describe('Transactions API', () => {
    it('GET /api/transactions returns transactions list', async () => {
      const res = await request(app).get('/api/transactions')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.pagination).toBeDefined()
    })

    it('POST /api/transactions with valid data creates transaction', async () => {
      const res = await request(app).post('/api/transactions').send({
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
      const res = await request(app).post('/api/transactions').send({
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

    it('POST /api/transactions with invalid type returns 400 validation error', async () => {
      const res = await request(app).post('/api/transactions').send({
        description: 'Invalid Tx Type',
        category: 'Food',
        amount: 100,
        type: 'invalid_type',
        date: new Date().toISOString(),
      })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/transactions/:id returns specific transaction', async () => {
      const res = await request(app).get(`/api/transactions/${createdTransactionId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdTransactionId)
    })

    it('GET /api/transactions with filtering by type returns matching items', async () => {
      const res = await request(app).get('/api/transactions?type=expense')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      res.body.data.forEach((tx: any) => {
        expect(tx.type).toBe('expense')
      })
    })

    it('PATCH /api/transactions/:id updates transaction fields', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${createdTransactionId}`)
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
      const res = await request(app).delete(
        `/api/transactions/${createdTransactionId}`
      )
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const verifyRes = await request(app).get(
        `/api/transactions/${createdTransactionId}`
      )
      expect(verifyRes.status).toBe(404)
    })

    it('DELETE /api/transactions/:id on missing record returns 404', async () => {
      const res = await request(app).delete('/api/transactions/non-existent-id')
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Budgets API', () => {
    it('POST /api/budgets creates a budget', async () => {
      const res = await request(app).post('/api/budgets').send({
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

    it('POST /api/budgets with invalid date range returns 400', async () => {
      const res = await request(app).post('/api/budgets').send({
        category: 'Transport',
        limit: 2000,
        period: 'custom',
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('GET /api/budgets returns list with spent calculations', async () => {
      const res = await request(app).get('/api/budgets')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('DELETE /api/budgets/:id removes budget', async () => {
      const res = await request(app).delete(`/api/budgets/${createdBudgetId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Goals API', () => {
    it('POST /api/goals creates a goal with progress', async () => {
      const res = await request(app).post('/api/goals').send({
        title: 'Gaming Console',
        targetAmount: 40000,
        currentAmount: 10000,
        deadline: '2026-12-31',
        category: 'Entertainment',
      })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.percentage).toBe(25)
      expect(res.body.data.remainingAmount).toBe(30000)
      createdGoalId = res.body.data.id
    })

    it('POST /api/goals/:id/contribute increments currentAmount', async () => {
      const res = await request(app)
        .post(`/api/goals/${createdGoalId}/contribute`)
        .send({ amount: 5000 })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.currentAmount).toBe(15000)
      expect(res.body.data.percentage).toBe(38)
    })

    it('DELETE /api/goals/:id removes goal', async () => {
      const res = await request(app).delete(`/api/goals/${createdGoalId}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Analytics API', () => {
    it('GET /api/analytics/summary returns totals', async () => {
      const res = await request(app).get('/api/analytics/summary')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(typeof res.body.data.totalIncome).toBe('number')
      expect(typeof res.body.data.totalExpenses).toBe('number')
      expect(typeof res.body.data.netSavings).toBe('number')
      expect(typeof res.body.data.savingsRate).toBe('number')
    })

    it('GET /api/analytics/spending-trend returns historical points', async () => {
      const res = await request(app).get('/api/analytics/spending-trend?days=7')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('GET /api/analytics/categories returns category breakdown', async () => {
      const res = await request(app).get('/api/analytics/categories')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })
})
