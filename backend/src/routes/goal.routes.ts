import { Router } from 'express'
import { GoalController } from '../controllers/goal.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
} from '../validations/goal.validation'
import { idParamSchema } from '../validations/transaction.validation'

const router = Router()

router.use(authenticate)

router.get('/', GoalController.list)
router.get('/:id', validate({ params: idParamSchema }), GoalController.getById)
router.post('/', validate({ body: createGoalSchema }), GoalController.create)
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateGoalSchema }),
  GoalController.update
)
router.post(
  '/:id/contribute',
  validate({ params: idParamSchema, body: contributeGoalSchema }),
  GoalController.contribute
)
router.delete('/:id', validate({ params: idParamSchema }), GoalController.delete)

export default router
