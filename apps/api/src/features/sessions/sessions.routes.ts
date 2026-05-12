import { Router, type IRouter } from 'express'
import { validate } from '../../middleware/validate'
import { StartSessionSchema, EndSessionSchema } from '@propella/shared'
import * as sessionsController from './sessions.controller'

const router: IRouter = Router()

router.post('/start', validate(StartSessionSchema), sessionsController.startSession)
router.post('/:id/end', validate(EndSessionSchema), sessionsController.endSession)
router.post('/:id/abandon', sessionsController.abandonSession)
router.get('/', sessionsController.getSessions)

export default router
