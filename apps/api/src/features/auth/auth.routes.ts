import { Router, type IRouter } from 'express'
import { loginLimiter, signupLimiter } from '../../middleware/rate-limit'
import { validate } from '../../middleware/validate'
import { SignupSchema, LoginSchema, ForgotPasswordSchema } from '@propella/shared'
import * as authController from './auth.controller'

const router: IRouter = Router()

router.post('/signup', signupLimiter, validate(SignupSchema), authController.signup)
router.post('/login', loginLimiter, validate(LoginSchema), authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)
router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword)

export default router
