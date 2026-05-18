import { Types } from 'mongoose'
import { NotificationModel, type NotificationType } from '../../models/Notification'
import { NotFoundError } from '../../middleware/error-handler'
import { logger } from '../../config/logger'

export interface NotifyInput {
  type: NotificationType
  title: string
  body: string
  deeplink?: string | null
  metadata?: Record<string, unknown>
  expiresAt?: Date | null
}

// Anti-flood: skip if same type + overlapping metadata within 30 minutes
async function isDuplicate(
  userId: Types.ObjectId,
  type: NotificationType,
  metadata: Record<string, unknown>,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 30 * 60 * 1000)
  const query: Record<string, unknown> = {
    userId,
    type,
    createdAt: { $gte: windowStart },
  }

  if (metadata.topicId) query['metadata.topicId'] = metadata.topicId
  if (metadata.quizId) query['metadata.quizId'] = metadata.quizId

  const existing = await NotificationModel.exists(query)
  return !!existing
}

export async function notify(
  userId: string,
  type: NotificationType,
  data: Omit<NotifyInput, 'type'>,
): Promise<void> {
  try {
    const userObjectId = new Types.ObjectId(userId)
    const metadata = data.metadata ?? {}

    if (await isDuplicate(userObjectId, type, metadata)) {
      logger.debug({ userId, type }, 'Notification suppressed (anti-flood)')
      return
    }

    await NotificationModel.create({
      userId: userObjectId,
      type,
      title: data.title.slice(0, 80),
      body: data.body.slice(0, 200),
      deeplink: data.deeplink ?? null,
      metadata,
      expiresAt: data.expiresAt ?? null,
    })
  } catch (err) {
    logger.error({ err, userId, type }, 'Failed to create notification')
  }
}

export interface ListNotificationsResult {
  items: Array<{
    id: string
    type: NotificationType
    title: string
    body: string
    deeplink: string | null
    metadata: Record<string, unknown>
    readAt: string | null
    createdAt: string
  }>
  nextCursor: string | null
  unreadCount: number
}

export async function listNotifications(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<ListNotificationsResult> {
  const userObjectId = new Types.ObjectId(userId)
  const safeLimit = Math.min(limit, 50)

  const query: Record<string, unknown> = { userId: userObjectId }
  if (cursor) {
    query['_id'] = { $lt: new Types.ObjectId(cursor) }
  }

  const [items, unreadCount] = await Promise.all([
    NotificationModel.find(query)
      .sort({ _id: -1 })
      .limit(safeLimit + 1)
      .lean(),
    NotificationModel.countDocuments({ userId: userObjectId, readAt: null }),
  ])

  const hasMore = items.length > safeLimit
  const page = hasMore ? items.slice(0, safeLimit) : items
  const nextCursor = hasMore ? page[page.length - 1]?._id.toString() ?? null : null

  return {
    items: page.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      body: n.body,
      deeplink: n.deeplink,
      metadata: n.metadata as Record<string, unknown>,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor,
    unreadCount,
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const userObjectId = new Types.ObjectId(userId)
  return NotificationModel.countDocuments({ userId: userObjectId, readAt: null })
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  const result = await NotificationModel.updateOne(
    { _id: new Types.ObjectId(notificationId), userId: userObjectId, readAt: null },
    { $set: { readAt: new Date() } },
  )
  if (result.matchedCount === 0) {
    throw new NotFoundError('Notification not found')
  }
}

export async function markAllRead(userId: string): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  await NotificationModel.updateMany(
    { userId: userObjectId, readAt: null },
    { $set: { readAt: new Date() } },
  )
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  const result = await NotificationModel.deleteOne({
    _id: new Types.ObjectId(notificationId),
    userId: userObjectId,
  })
  if (result.deletedCount === 0) {
    throw new NotFoundError('Notification not found')
  }
}
