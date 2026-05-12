import type { Request, Response, NextFunction } from 'express'
import * as leaderboardService from './leaderboard.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const rawPeriod = req.query.period
    const period =
      rawPeriod === 'week' || rawPeriod === 'month' || rawPeriod === 'all'
        ? rawPeriod
        : 'week'

    const result = await leaderboardService.getLeaderboard(userId, period)

    res.status(200).json({ data: result })
  } catch (err) {
    next(err)
  }
}
