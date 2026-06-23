import { Router, type IRouter } from 'express'
import * as notificationsController from './notifications.controller'

const router: IRouter = Router()

router.get('/', notificationsController.listNotifications)
router.get('/unread-count', notificationsController.getUnreadCount)
router.patch('/read-all', notificationsController.markAllRead)
router.patch('/:id/read', notificationsController.markRead)
router.delete('/:id', notificationsController.deleteNotification)

export default router
