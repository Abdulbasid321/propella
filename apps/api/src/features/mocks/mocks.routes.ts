import { Router, type IRouter } from 'express'
import * as mocksController from './mocks.controller'

const router: IRouter = Router()

router.post('/generate', mocksController.generateMock)
router.post('/:id/attempt', mocksController.startMockAttempt)
router.post('/attempts/:attemptId/submit', mocksController.submitMock)
router.get('/attempts/:attemptId', mocksController.getMockAttemptResult)
router.get('/', mocksController.getMockHistory)

export default router
