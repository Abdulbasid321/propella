import { Router, type IRouter } from 'express'
import * as roadmapController from './roadmap.controller'

const router: IRouter = Router()

router.get('/', roadmapController.getRoadmap)
router.patch('/nodes/:subjectSlug/:topicSlug', roadmapController.updateNode)
router.post('/regenerate', roadmapController.regenerateRoadmap)

export default router
