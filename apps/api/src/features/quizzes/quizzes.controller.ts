import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../middleware/error-handler'
import * as quizzesService from './quizzes.service'

function requireUser(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Not authenticated')
  return req.user.id
}

export async function generateQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { subjectSlug, topicSlug, type, difficulty, questionCount } = req.body as {
      subjectSlug: string
      topicSlug: string
      type: 'topic' | 'subject' | 'mixed' | 'weakness' | 'mock'
      difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
      questionCount: number
    }

    if (!subjectSlug || !topicSlug) {
      throw new AppError(400, 'subjectSlug and topicSlug are required')
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'adaptive']
    if (!validDifficulties.includes(difficulty ?? '')) {
      throw new AppError(400, 'Invalid difficulty')
    }

    const quiz = await quizzesService.generateQuiz(userId, {
      subjectSlug,
      topicSlug,
      type: type ?? 'topic',
      difficulty: difficulty ?? 'medium',
      questionCount: Math.min(20, Math.max(1, questionCount ?? 10)),
    })

    res.status(201).json({
      data: {
        quizId: quiz._id.toString(),
        type: quiz.type,
        difficulty: quiz.difficulty,
        questionCount: quiz.questionCount,
        topicRef: quiz.topicRef,
        createdAt: (quiz as unknown as { createdAt: Date }).createdAt?.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function startAttempt(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const quizId = req.params.id

    const attempt = await quizzesService.startAttempt(userId, quizId)

    res.status(201).json({
      data: {
        attemptId: attempt._id.toString(),
        quizId: attempt.quizId.toString(),
        startedAt: attempt.startedAt.toISOString(),
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function submitAttempt(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { attemptId } = req.params
    const { quizId, answers, durationSec } = req.body as {
      quizId: string
      answers: Array<{
        questionId: string
        selectedOptionId: 'A' | 'B' | 'C' | 'D'
        timeSpentSec: number
      }>
      durationSec: number
    }

    if (!quizId || !answers || !Array.isArray(answers)) {
      throw new AppError(400, 'quizId and answers array are required')
    }

    const result = await quizzesService.submitAttempt(userId, attemptId, {
      quizId,
      answers,
      durationSec: durationSec ?? 0,
    })

    res.status(200).json({
      data: {
        attemptId: result.attempt._id.toString(),
        score: result.attempt.score,
        correct: result.attempt.answers.filter((a) => a.isCorrect).length,
        total: result.attempt.answers.length,
        durationSec: result.attempt.durationSec,
        xpAwarded: result.xpAwarded,
        masteryUpdates: result.masteryUpdates,
        byTopic: result.attempt.byTopic,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getAttempt(
  req: Request<{ attemptId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const { attemptId } = req.params

    const { attempt, quiz } = await quizzesService.getAttempt(userId, attemptId)

    res.status(200).json({
      data: {
        attempt: {
          id: (attempt as unknown as { _id: { toString(): string } })._id.toString(),
          quizId: attempt.quizId.toString(),
          score: attempt.score,
          correct: attempt.answers.filter((a) => a.isCorrect).length,
          total: attempt.answers.length,
          durationSec: attempt.durationSec,
          xpAwarded: attempt.xpAwarded,
          answers: attempt.answers,
          byTopic: attempt.byTopic,
          startedAt: attempt.startedAt.toISOString(),
          completedAt: attempt.completedAt?.toISOString() ?? null,
        },
        quiz: {
          id: (quiz as unknown as { _id: { toString(): string } })._id.toString(),
          type: quiz.type,
          difficulty: quiz.difficulty,
          topicRef: quiz.topicRef,
          questions: quiz.questions,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function listQuizzes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = requireUser(req)
    const quizzes = await quizzesService.listQuizzes(userId)
    res.status(200).json({ data: quizzes })
  } catch (err) {
    next(err)
  }
}
