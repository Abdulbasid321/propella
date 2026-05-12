import { Types } from 'mongoose'
import { XPEventModel } from '../../models/XPEvent'
import { UserModel } from '../../models/User'
import { getRank } from '@propella/shared'

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  xp: number
  rankName: string
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[]
  myEntry: LeaderboardEntry | null
}

function formatName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0] ?? fullName
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  return `${first} ${last.charAt(0).toUpperCase()}.`
}

export async function getLeaderboard(
  userId: string,
  period: 'week' | 'month' | 'all',
): Promise<LeaderboardResult> {
  const userObjectId = new Types.ObjectId(userId)

  // Build date filter
  const matchStage: Record<string, unknown> = {}
  if (period === 'week') {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    matchStage.createdAt = { $gte: start }
  } else if (period === 'month') {
    const start = new Date()
    start.setDate(start.getDate() - 30)
    matchStage.createdAt = { $gte: start }
  }

  // Aggregate XP per user
  const pipeline: Parameters<typeof XPEventModel.aggregate>[0] = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$userId',
        totalXP: { $sum: '$amount' },
      },
    },
    { $sort: { totalXP: -1 } },
    { $limit: 101 }, // top 100 + potentially the caller
  ]

  const agg = await XPEventModel.aggregate<{ _id: Types.ObjectId; totalXP: number }>(pipeline)

  // Get all user IDs
  const userIds = agg.map((a) => a._id)
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select('_id name')
    .lean()

  const userMap = new Map(users.map((u) => [u._id.toString(), u.name]))

  // Build ranked list
  const entries: LeaderboardEntry[] = agg
    .map((a, idx) => {
      const name = userMap.get(a._id.toString()) ?? 'Anonymous'
      return {
        rank: idx + 1,
        userId: a._id.toString(),
        name: formatName(name),
        xp: a.totalXP,
        rankName: getRank(a.totalXP).name,
      }
    })
    .slice(0, 100)

  // Find caller's entry
  let myEntry = entries.find((e) => e.userId === userId) ?? null

  if (!myEntry) {
    // Caller not in top 100 — compute their position separately
    const myXPPipeline: Parameters<typeof XPEventModel.aggregate>[0] = [
      ...(Object.keys(matchStage).length > 0
        ? [{ $match: { ...matchStage, userId: userObjectId } }]
        : [{ $match: { userId: userObjectId } }]),
      {
        $group: {
          _id: '$userId',
          totalXP: { $sum: '$amount' },
        },
      },
    ]

    const myAgg = await XPEventModel.aggregate<{ _id: Types.ObjectId; totalXP: number }>(myXPPipeline)
    const myXP = myAgg[0]?.totalXP ?? 0

    if (myXP > 0) {
      // Count how many users have more XP
      const countPipeline: Parameters<typeof XPEventModel.aggregate>[0] = [
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
          $group: {
            _id: '$userId',
            totalXP: { $sum: '$amount' },
          },
        },
        { $match: { totalXP: { $gt: myXP } } },
        { $count: 'count' },
      ]

      const countAgg = await XPEventModel.aggregate<{ count: number }>(countPipeline)
      const position = (countAgg[0]?.count ?? 0) + 1
      const myName = userMap.get(userId) ?? 'You'

      myEntry = {
        rank: position,
        userId,
        name: formatName(myName),
        xp: myXP,
        rankName: getRank(myXP).name,
      }
    }
  }

  return { entries, myEntry }
}
