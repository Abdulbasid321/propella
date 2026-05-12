import { Router, type IRouter } from 'express'
import { listSubjects, getSubject } from './subjects.controller'

const router: IRouter = Router()

// GET /api/subjects
router.get('/', listSubjects)

// GET /api/subjects/:slug
router.get('/:slug', getSubject)

export default router
