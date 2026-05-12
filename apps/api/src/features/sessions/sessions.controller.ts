import type { Request, Response, NextFunction } from 'express'
import type { StartSessionInput, EndSessionInput } from '@propella/shared'
import * as sessionsService from './sessions.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function startSession(
  req: Request<Record<string, string>, unknown, StartSessionInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { subjectSlug, topicSlug, isMarathon } = req.body

    const session = await sessionsService.startSession(
      userId,
      { subjectSlug, topicSlug },
      isMarathon ?? false,
    )

    res.status(201).json({
      data: {
        sessionId: session._id.toString(),
        startedAt: session.startedAt.toISOString(),
        status: session.status,
        topicRef: session.topicRef,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function endSession(
  req: Request<{ id: string }, object, EndSessionInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const sessionId = req.params.id
    const { durationSec, notesMarkdown } = req.body

    const result = await sessionsService.endSession(userId, sessionId, durationSec, notesMarkdown)

    res.status(200).json({
      data: {
        session: {
          id: result.session._id.toString(),
          status: result.session.status,
          durationSec: result.session.durationSec,
          endedAt: result.session.endedAt?.toISOString(),
          xpAwarded: result.session.xpAwarded,
        },
        xpAwarded: result.xpAwarded,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function abandonSession(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const sessionId = req.params.id
    await sessionsService.abandonSession(userId, sessionId)
    res.status(200).json({ data: { abandoned: true } })
  } catch (err) {
    next(err)
  }
}

export async function getSessions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10))
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)))

    const result = await sessionsService.getSessions(userId, page, limit)

    res.status(200).json({
      data: {
        sessions: result.sessions.map((s) => ({
          id: (s as unknown as { _id: { toString(): string } })._id.toString(),
          topicRef: (s as unknown as { topicRef: { subjectSlug: string; topicSlug: string } }).topicRef,
          startedAt: (s as unknown as { startedAt: Date }).startedAt.toISOString(),
          endedAt: (s as unknown as { endedAt?: Date }).endedAt?.toISOString(),
          durationSec: (s as unknown as { durationSec: number }).durationSec,
          status: (s as unknown as { status: string }).status,
          xpAwarded: (s as unknown as { xpAwarded: number }).xpAwarded,
          isMarathon: (s as unknown as { isMarathon: boolean }).isMarathon,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    })
  } catch (err) {
    next(err)
  }
}
