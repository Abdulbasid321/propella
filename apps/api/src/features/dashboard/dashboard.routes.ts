import { Router, type IRouter } from 'express'
import * as dashboardController from './dashboard.controller'

const router: IRouter = Router()

router.get('/', dashboardController.getDashboard)

export default router
