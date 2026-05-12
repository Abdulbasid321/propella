import cron from 'node-cron'
import { ReminderModel } from '../models/Reminder'
import { StreakModel } from '../models/Streak'
import { logger } from '../config/logger'

// Every 5 minutes: process due reminders
cron.schedule('*/5 * * * *', async () => {
  try {
    const due = await ReminderModel.find({
      status: 'scheduled',
      scheduledFor: { $lte: new Date() },
    }).limit(50)

    for (const reminder of due) {
      try {
        // For now: log. Email via Resend in Phase 7.
        logger.info({ reminderId: reminder._id, type: reminder.type }, 'Processing reminder')
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

// Daily at 18:00 UTC: streak warning for active users
cron.schedule('0 18 * * *', async () => {
  try {
    // Users with streak > 0 who haven't studied today
    const atRisk = await StreakModel.find({
      currentStreak: { $gt: 0 },
      lastActiveDate: { $lt: new Date(new Date().toDateString()) },
    }).limit(500)

    for (const streak of atRisk) {
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
        createdAt: new Date(),
      })
    }
  } catch (err) {
    logger.error({ err }, 'Streak warning scheduler error')
  }
})

export function startScheduler(): void {
  logger.info('Scheduler started')
}
