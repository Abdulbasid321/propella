import type { Request, Response, NextFunction } from 'express'
import * as dashboardService from './dashboard.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const data = await dashboardService.getDashboard(userId)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}
