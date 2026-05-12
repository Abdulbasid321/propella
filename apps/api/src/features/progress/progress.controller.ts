import type { Request, Response, NextFunction } from 'express'
import * as progressService from './progress.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getProgress(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await progressService.getProgress(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
