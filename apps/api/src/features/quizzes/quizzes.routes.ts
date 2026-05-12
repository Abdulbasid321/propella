import { Router, type IRouter } from 'express'
import * as quizzesController from './quizzes.controller'

const router: IRouter = Router()

// Generate a new quiz
router.post('/generate', quizzesController.generateQuiz)

// Start a quiz attempt
router.post('/:id/attempt', quizzesController.startAttempt)

// Submit answers for an attempt
router.post('/attempts/:attemptId/submit', quizzesController.submitAttempt)

// Get a specific attempt (for results display)
router.get('/attempts/:attemptId', quizzesController.getAttempt)

// List recent quizzes
router.get('/', quizzesController.listQuizzes)

export default router
