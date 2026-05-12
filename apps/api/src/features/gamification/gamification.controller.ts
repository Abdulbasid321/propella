import type { Request, Response, NextFunction } from 'express'
import * as gamificationService from './gamification.service'
import { getRank, getNextRank } from '@propella/shared'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getXP(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await gamificationService.getXPSummary(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getStreak(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await gamificationService.getStreak(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getRankInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const summary = await gamificationService.getXPSummary(userId)
    const rank = getRank(summary.totalXP)
    const nextRank = getNextRank(summary.totalXP)

    res.status(200).json({
      data: {
        rankName: rank.name,
        threshold: rank.threshold,
        totalXP: summary.totalXP,
        nextRankName: nextRank?.name ?? null,
        nextRankThreshold: nextRank?.threshold ?? null,
        xpToNextRank: nextRank ? nextRank.threshold - summary.totalXP : null,
      },
    })
  } catch (err) {
    next(err)
  }
}
