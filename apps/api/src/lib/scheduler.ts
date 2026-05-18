import cron from 'node-cron'
import { ReminderModel } from '../models/Reminder'
import { StreakModel } from '../models/Streak'
import { UserModel } from '../models/User'
import { StudySessionModel } from '../models/StudySession'
import { QuizAttemptModel } from '../models/QuizAttempt'
import { logger } from '../config/logger'
import {
  sendStudyReminderEmail,
  sendStreakWarningEmail,
  sendWeeklyDigestEmail,
} from './email'
import { notify } from '../features/notifications/notification.service'

// Every 5 minutes: process due reminders
cron.schedule('*/5 * * * *', async () => {
  try {
    const due = await ReminderModel.find({
      status: 'scheduled',
      scheduledFor: { $lte: new Date() },
    }).limit(50)

    for (const reminder of due) {
      try {
        const user = await UserModel.findById(reminder.userId).select('email')
        if (!user) {
          await reminder.updateOne({ status: 'failed' })
          continue
        }

        if (reminder.channel === 'email') {
          if (reminder.type === 'streak_warning') {
            const streak = await StreakModel.findOne({ userId: reminder.userId })
            await sendStreakWarningEmail(user.email, streak?.currentStreak ?? 1)
          } else {
            await sendStudyReminderEmail(user.email, reminder.payload as { title: string; body: string; deeplink?: string })
          }
        }

        // Also create an in-app notification for every reminder sent
        const notifType = reminder.type === 'streak_warning'
          ? 'streak_warning'
          : reminder.type === 'weekly_review'
            ? 'weekly_review'
            : 'study_reminder'

        await notify(reminder.userId.toString(), notifType, {
          title: reminder.payload.title,
          body: reminder.payload.body,
          deeplink: reminder.payload.deeplink ?? null,
        })

        await reminder.updateOne({ status: 'sent', sentAt: new Date() })
      } catch (err) {
        await reminder.updateOne({ status: 'failed' })
        logger.error({ err, reminderId: reminder._id }, 'Reminder failed')
      }
    }
  } catch (err) {
    logger.error({ err }, 'Reminder scheduler error')
  }
})

// Daily at 18:00 UTC: streak warning for users at risk
cron.schedule('0 18 * * *', async () => {
  try {
    const today = new Date(new Date().toDateString())
    const atRisk = await StreakModel.find({
      currentStreak: { $gt: 0 },
      lastActiveDate: { $lt: today },
    }).limit(500)

    for (const streak of atRisk) {
      // Avoid duplicate reminders for the same day
      const existing = await ReminderModel.findOne({
        userId: streak.userId,
        type: 'streak_warning',
        scheduledFor: { $gte: today },
      })
      if (existing) continue

      await ReminderModel.create({
        userId: streak.userId,
        type: 'streak_warning',
        scheduledFor: new Date(),
        channel: 'email',
        payload: {
          title: 'Your streak is at risk',
          body: `You have a ${streak.currentStreak}-day streak. Study today to keep it.`,
        },
        status: 'scheduled',
      })

      // Immediate in-app notification (the email fires later when scheduler processes it)
      await notify(streak.userId.toString(), 'streak_warning', {
        title: 'Your streak is at risk',
        body: `You have a ${streak.currentStreak}-day streak. Study today to keep it.`,
        deeplink: '/dashboard',
      })
    }

    logger.info({ count: atRisk.length }, 'Streak warning reminders scheduled')
  } catch (err) {
    logger.error({ err }, 'Streak warning scheduler error')
  }
})

// Weekly on Sunday at 19:00 UTC: send weekly digest emails
cron.schedule('0 19 * * 0', async () => {
  try {
    const users = await UserModel.find({
      'notifications.weeklyDigest': true,
    })
      .select('email notifications')
      .limit(1000)

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    for (const user of users) {
      try {
        const [sessions, attempts] = await Promise.all([
          StudySessionModel.find({
            userId: user._id,
            status: 'completed',
            startedAt: { $gte: weekAgo },
          }).select('durationSec'),
          QuizAttemptModel.find({
            userId: user._id,
            completedAt: { $gte: weekAgo },
          }).select('score byTopic'),
        ])

        const studyHours = sessions.reduce((sum, s) => sum + s.durationSec, 0) / 3600

        const avgScore =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : 0

        // Collect weak topics (score < 50%) from this week's attempts
        const weakMap: Record<string, { correct: number; total: number }> = {}
        for (const attempt of attempts) {
          for (const t of attempt.byTopic ?? []) {
            if (!weakMap[t.topicSlug]) weakMap[t.topicSlug] = { correct: 0, total: 0 }
            const entry = weakMap[t.topicSlug]
            if (entry) {
              entry.correct += t.correct
              entry.total += t.total
            }
          }
        }
        const weakTopics = Object.entries(weakMap)
          .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
          .map(([slug]) => slug.replace(/-/g, ' '))

        await sendWeeklyDigestEmail(user.email, {
          studyHours,
          topicsMastered: 0, // mastery updates are tracked on Roadmap nodes
          avgScore,
          weakTopics,
        })
      } catch (err) {
        logger.error({ err, userId: user._id }, 'Weekly digest failed for user')
      }
    }

    logger.info({ count: users.length }, 'Weekly digest emails dispatched')
  } catch (err) {
    logger.error({ err }, 'Weekly digest scheduler error')
  }
})

export function startScheduler(): void {
  logger.info('Scheduler started')
}
