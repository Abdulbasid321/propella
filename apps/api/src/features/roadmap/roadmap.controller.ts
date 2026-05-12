import type { Request, Response, NextFunction } from 'express'
import * as roadmapService from './roadmap.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getRoadmap(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await roadmapService.getRoadmap(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateNode(
  req: Request<{ subjectSlug: string; topicSlug: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { subjectSlug, topicSlug } = req.params
    const { status, mastery } = req.body as { status?: string; mastery?: number }

    if (status !== undefined) {
      await roadmapService.updateNodeStatus(userId, subjectSlug, topicSlug, status)
    }
    if (mastery !== undefined) {
      await roadmapService.updateNodeMastery(userId, subjectSlug, topicSlug, mastery)
    }

    res.status(200).json({ data: { updated: true } })
  } catch (err) {
    next(err)
  }
}

export async function regenerateRoadmap(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    await roadmapService.regenerateRoadmap(userId)
    res.status(200).json({ data: { regenerated: true } })
  } catch (err) {
    next(err)
  }
}
