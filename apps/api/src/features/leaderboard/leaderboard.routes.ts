import { Router, type IRouter } from 'express'
import * as leaderboardController from './leaderboard.controller'

const router: IRouter = Router()

router.get('/', leaderboardController.getLeaderboard)

export default router
