import { Types } from 'mongoose'
import { MarathonRunModel, type IMarathonRun } from '../../models/MarathonRun'
import { XPEventModel } from '../../models/XPEvent'
import { StreakModel } from '../../models/Streak'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { XP } from '@propella/shared'

export interface StartMarathonInput {
  plannedDurationMin: number
  pomodoroLength: number
  subjectSlugs: string[]
}

export interface EndMarathonResult {
  run: IMarathonRun
  xpAwarded: number
}

export interface TopicCoveredInput {
  subjectSlug: string
  topicSlug: string
  durationSec: number
}

export async function startMarathon(
  userId: string,
  input: StartMarathonInput,
): Promise<IMarathonRun> {
  const userObjectId = new Types.ObjectId(userId)

  const run = await MarathonRunModel.create({
    userId: userObjectId,
    plannedDurationMin: input.plannedDurationMin,
    pomodoroLength: input.pomodoroLength,
    startedAt: new Date(),
    status: 'running',
    pomodorosCompleted: 0,
    topicsCovered: [],
    pauses: [],
    xpAwarded: 0,
    actualDurationSec: 0,
  })

  return run
}

export async function pauseMarathon(userId: string, runId: string): Promise<IMarathonRun> {
  const userObjectId = new Types.ObjectId(userId)

  const run = await MarathonRunModel.findOne({
    _id: new Types.ObjectId(runId),
    userId: userObjectId,
  })

  if (!run) throw new NotFoundError('Marathon run not found')
  if (run.status !== 'running') throw new AppError(400, 'Marathon is not running')

  run.pauses.push({ at: new Date(), durationSec: 0 })
  run.status = 'paused'
  await run.save()

  return run
}

export async function resumeMarathon(userId: string, runId: string): Promise<IMarathonRun> {
  const userObjectId = new Types.ObjectId(userId)

  const run = await MarathonRunModel.findOne({
    _id: new Types.ObjectId(runId),
    userId: userObjectId,
  })

  if (!run) throw new NotFoundError('Marathon run not found')
  if (run.status !== 'paused') throw new AppError(400, 'Marathon is not paused')

  // Update last pause entry with actual duration
  const lastPause = run.pauses[run.pauses.length - 1]
  if (lastPause) {
    const durationSec = Math.floor((Date.now() - lastPause.at.getTime()) / 1000)
    lastPause.durationSec = durationSec
  }

  run.status = 'running'
  run.markModified('pauses')
  await run.save()

  return run
}

export async function endMarathon(
  userId: string,
  runId: string,
  actualDurationSec: number,
  pomodorosCompleted: number,
  topicsCovered: TopicCoveredInput[],
): Promise<EndMarathonResult> {
  const userObjectId = new Types.ObjectId(userId)

  const run = await MarathonRunModel.findOne({
    _id: new Types.ObjectId(runId),
    userId: userObjectId,
  })

  if (!run) throw new NotFoundError('Marathon run not found')
  if (run.status === 'completed') throw new AppError(400, 'Marathon already completed')

  // Calculate XP
  let xpAwarded = pomodorosCompleted * XP.MARATHON_PER_POMODORO
  if (pomodorosCompleted >= 4) {
    xpAwarded += XP.MARATHON_4_PLUS_BONUS
  }

  // Create XP event
  if (xpAwarded > 0) {
    await XPEventModel.create({
      userId: userObjectId,
      source: 'marathon',
      sourceId: run._id,
      amount: xpAwarded,
      reason: `Marathon: ${pomodorosCompleted} pomodoro${pomodorosCompleted !== 1 ? 's' : ''} completed`,
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
    }
  } else {
    await StreakModel.create({
      userId: userObjectId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date(),
    })
  }

  // Update run
  run.status = 'completed'
  run.endedAt = new Date()
  run.actualDurationSec = actualDurationSec
  run.pomodorosCompleted = pomodorosCompleted
  run.topicsCovered = topicsCovered
  run.xpAwarded = xpAwarded
  await run.save()

  return { run, xpAwarded }
}

export async function getMarathonHistory(userId: string): Promise<IMarathonRun[]> {
  const userObjectId = new Types.ObjectId(userId)

  return MarathonRunModel.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean() as unknown as IMarathonRun[]
}
