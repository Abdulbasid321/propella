import { Router, type IRouter } from 'express'
import * as progressController from './progress.controller'

const router: IRouter = Router()

router.get('/', progressController.getProgress)

export default router
