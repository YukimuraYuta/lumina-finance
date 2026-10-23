import { Router } from 'express'
import { TransactionController } from '../controllers/transaction.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  idParamSchema,
} from '../validations/transaction.validation'

const router = Router()

router.use(authenticate)

router.get('/', validate({ query: transactionQuerySchema }), TransactionController.list)
router.get('/:id', validate({ params: idParamSchema }), TransactionController.getById)
router.post('/', validate({ body: createTransactionSchema }), TransactionController.create)
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTransactionSchema }),
  TransactionController.update
)
router.delete('/:id', validate({ params: idParamSchema }), TransactionController.delete)

export default router
