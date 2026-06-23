import { Types } from 'mongoose'
import { StudySessionModel, type IStudySession } from '../../models/StudySession'
import { XPEventModel } from '../../models/XPEvent'
import { StreakModel } from '../../models/Streak'
import { RoadmapModel } from '../../models/Roadmap'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { notify } from '../notifications/notification.service'
import { XP } from '@propella/shared'
import { logger } from '../../config/logger'

const STREAK_MILESTONES = new Set([7, 14, 30, 60, 100])

interface TopicRef {
  subjectSlug: string
  topicSlug: string
}

export async function startSession(
  userId: string,
  topicRef: TopicRef,
  isMarathon: boolean,
): Promise<IStudySession> {
  const userObjectId = new Types.ObjectId(userId)

  const session = await StudySessionModel.create({
    userId: userObjectId,
    topicRef,
    isMarathon,
    startedAt: new Date(),
    status: 'in-progress',
  })

  return session
}

interface EndSessionResult {
  session: IStudySession
  xpAwarded: number
}

export async function endSession(
  userId: string,
  sessionId: string,
  durationSec: number,
  notesMarkdown?: string,
): Promise<EndSessionResult> {
  const userObjectId = new Types.ObjectId(userId)

  const session = await StudySessionModel.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: userObjectId,
  })

  if (!session) {
    throw new NotFoundError('Session not found')
  }

  if (session.status !== 'in-progress') {
    throw new AppError(400, 'Session is not in-progress')
  }

  // Calculate XP based on duration
  const durationMin = durationSec / 60
  let xpAwarded = 0
  let reason = ''

  if (durationMin >= 45) {
    xpAwarded = XP.SESSION_45_MIN
    reason = '45+ minute study session'
  } else if (durationMin >= 25) {
    xpAwarded = XP.SESSION_25_MIN
    reason = '25+ minute study session'
  } else if (durationMin >= 15) {
    xpAwarded = XP.SESSION_15_MIN
    reason = '15+ minute study session'
  } else {
    reason = 'Study session (< 15 min, no XP)'
  }

  // Update session
  session.endedAt = new Date()
  session.durationSec = durationSec
  session.status = 'completed'
  if (notesMarkdown !== undefined) {
    session.notesMarkdown = notesMarkdown
  }
  session.xpAwarded = xpAwarded
  await session.save()

  // Create XPEvent if XP was awarded
  if (xpAwarded > 0) {
    await XPEventModel.create({
      userId: userObjectId,
      source: 'study_session',
      sourceId: session._id,
      amount: xpAwarded,
      reason,
    })
  }

  // Update streak
  const streak = await StreakModel.findOne({ userId: userObjectId })
  if (streak) {
    const todayString = new Date().toDateString()
    const lastActiveDateString = streak.lastActiveDate.toDateString()

    if (lastActiveDateString !== todayString) {
      streak.currentStreak += 1
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak
      }
      streak.lastActiveDate = new Date()
      await streak.save()

      if (STREAK_MILESTONES.has(streak.currentStreak)) {
        await notify(userId, 'streak_milestone', {
          title: `${streak.currentStreak}-day streak`,
          body: `You have studied ${streak.currentStreak} days in a row. Keep it going.`,
          deeplink: '/dashboard',
        })
      }
    }
  } else {
    // Create streak if it doesn't exist
    await StreakModel.create({
      userId: userObjectId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date(),
    })
  }

  // Update roadmap node
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId })
  if (roadmap) {
    const node = roadmap.nodes.find(
      (n) =>
        n.subjectSlug === session.topicRef.subjectSlug &&
        n.topicSlug === session.topicRef.topicSlug,
    )
    if (node) {
      if (node.status === 'ready') {
        node.status = 'in-progress'
      }
      node.lastStudiedAt = new Date()
      roadmap.markModified('nodes')
      await roadmap.save()
    } else {
      logger.warn({ userId, sessionId }, 'No matching roadmap node found for session')
    }
  }

  return { session, xpAwarded }
}

export async function abandonSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)

  const session = await StudySessionModel.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: userObjectId,
  })

  if (!session) {
    throw new NotFoundError('Session not found')
  }

  session.status = 'abandoned'
  await session.save()
}

interface PaginatedSessions {
  sessions: IStudySession[]
  total: number
  page: number
  limit: number
}

export async function getSessions(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedSessions> {
  const userObjectId = new Types.ObjectId(userId)
  const skip = (page - 1) * limit

  const [sessions, total] = await Promise.all([
    StudySessionModel.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StudySessionModel.countDocuments({ userId: userObjectId }),
  ])

  return { sessions: sessions as unknown as IStudySession[], total, page, limit }
}
