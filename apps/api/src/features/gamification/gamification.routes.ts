import { Router, type IRouter } from 'express'
import * as gamificationController from './gamification.controller'

const router: IRouter = Router()

router.get('/xp', gamificationController.getXP)
router.get('/streak', gamificationController.getStreak)
router.get('/rank', gamificationController.getRankInfo)

export default router
