import type { Request, Response, NextFunction } from 'express'
import * as assistantService from './assistant.service'
import { AppError } from '../../middleware/error-handler'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function getThreads(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const threads = await assistantService.getThreads(userId)

    res.status(200).json({
      data: {
        threads: threads.map((t) => ({
          id: (t as unknown as { _id: { toString(): string } })._id.toString(),
          title: (t as unknown as { title: string }).title,
          createdAt: (t as unknown as { createdAt: Date }).createdAt?.toISOString(),
          updatedAt: (t as unknown as { updatedAt: Date }).updatedAt?.toISOString(),
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function createThread(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const thread = await assistantService.createThread(userId)

    res.status(201).json({
      data: {
        id: thread._id.toString(),
        title: thread.title,
        createdAt: thread.createdAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getThread(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const thread = await assistantService.getThread(userId, req.params.id)

    res.status(200).json({
      data: {
        id: (thread as unknown as { _id: { toString(): string } })._id.toString(),
        title: (thread as unknown as { title: string }).title,
        messages: (thread as unknown as { messages: Array<{ id: string; role: string; content: string; createdAt: Date; attachedTopic?: { subjectSlug: string; topicSlug: string } }> }).messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          attachedTopic: m.attachedTopic,
        })),
        createdAt: (thread as unknown as { createdAt: Date }).createdAt?.toISOString(),
        updatedAt: (thread as unknown as { updatedAt: Date }).updatedAt?.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function sendMessage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = requireUser(req)
  const { content, attachedTopic } = req.body as {
    content: string
    attachedTopic?: { subjectSlug: string; topicSlug: string }
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    await assistantService.streamMessage(
      userId,
      req.params.id,
      content,
      attachedTopic,
      (chunk: string) => {
        res.write(`data: ${chunk}\n\n`)
      },
    )

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    // If headers already sent, just end
    if (!res.headersSent) {
      next(err)
    } else {
      res.write(`data: [ERROR]\n\n`)
      res.end()
    }
  }
}
