import { Router, type IRouter } from 'express'
import * as usersController from './users.controller'

const router: IRouter = Router()

router.get('/me', usersController.getMe)
router.patch('/me', usersController.updateMe)

export default router
