import { Router } from 'express'
import { BudgetController } from '../controllers/budget.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createBudgetSchema,
  updateBudgetSchema,
} from '../validations/budget.validation'
import { idParamSchema } from '../validations/transaction.validation'

const router = Router()

router.use(authenticate)

router.get('/', BudgetController.list)
router.get('/:id', validate({ params: idParamSchema }), BudgetController.getById)
router.post('/', validate({ body: createBudgetSchema }), BudgetController.create)
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateBudgetSchema }),
  BudgetController.update
)
router.delete('/:id', validate({ params: idParamSchema }), BudgetController.delete)

export default router
