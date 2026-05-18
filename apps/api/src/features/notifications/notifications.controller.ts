import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../middleware/error-handler'
import * as notificationService from './notification.service'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 50)
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined
    const result = await notificationService.listNotifications(userId, limit, cursor)
    res.status(200).json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const count = await notificationService.getUnreadCount(userId)
    res.status(200).json({ data: { count } })
  } catch (err) {
    next(err)
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { id } = req.params
    if (!id) throw new AppError(400, 'Notification ID required')
    await notificationService.markRead(userId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await notificationService.markAllRead(userId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { id } = req.params
    if (!id) throw new AppError(400, 'Notification ID required')
    await notificationService.deleteNotification(userId, id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
