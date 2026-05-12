import type { Request, Response, NextFunction } from 'express'
import * as subjectsService from './subjects.service'

export async function listSubjects(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const subjects = await subjectsService.getAllSubjects()
    res.status(200).json({ data: subjects })
  } catch (err) {
    next(err)
  }
}

export async function getSubject(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const subject = await subjectsService.getSubjectBySlug(req.params.slug)
    res.status(200).json({ data: subject })
  } catch (err) {
    next(err)
  }
}
