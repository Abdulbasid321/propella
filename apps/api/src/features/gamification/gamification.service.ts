import { Types } from 'mongoose'
import { XPEventModel, type XPSource } from '../../models/XPEvent'
import { StreakModel } from '../../models/Streak'
import { getRank, getNextRank } from '@propella/shared'
import type { XPSummary, UserStreak } from '@propella/shared'

export async function getXPSummary(userId: string): Promise<XPSummary> {
  const userObjectId = new Types.ObjectId(userId)

  const agg = await XPEventModel.aggregate<{ _id: null; total: number }>([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  const totalXP = agg[0]?.total ?? 0
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  return {
    totalXP,
    rankName: rank.name,
    nextRankName: nextRank?.name ?? null,
    nextRankThreshold: nextRank?.threshold ?? null,
    xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
  }
}

export async function getStreak(userId: string): Promise<UserStreak> {
  const userObjectId = new Types.ObjectId(userId)

  const existing = await StreakModel.findOne({ userId: userObjectId }).lean()

  if (existing) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      lastActiveDate: existing.lastActiveDate.toISOString(),
      freezesAvailable: existing.freezesAvailable,
    }
  }

  const created = await StreakModel.create({
    userId: userObjectId,
    lastActiveDate: new Date(),
  })

  return {
    currentStreak: created.currentStreak,
    longestStreak: created.longestStreak,
    lastActiveDate: created.lastActiveDate.toISOString(),
    freezesAvailable: created.freezesAvailable,
  }
}

export async function awardXP(
  userId: string,
  source: XPSource,
  amount: number,
  sourceId?: string,
  reason?: string,
  multiplier?: number,
): Promise<number> {
  const userObjectId = new Types.ObjectId(userId)

  await XPEventModel.create({
    userId: userObjectId,
    source,
    ...(sourceId ? { sourceId: new Types.ObjectId(sourceId) } : {}),
    amount,
    reason: reason ?? source,
    ...(multiplier !== undefined ? { multiplier } : {}),
  })

  const agg = await XPEventModel.aggregate<{ _id: null; total: number }>([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  return agg[0]?.total ?? 0
}
