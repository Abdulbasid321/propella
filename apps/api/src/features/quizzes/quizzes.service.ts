import { Types } from 'mongoose'
import { QuizModel } from '../../models/Quiz'
import { QuizAttemptModel } from '../../models/QuizAttempt'
import { SubjectModel } from '../../models/Subject'
import { XPEventModel } from '../../models/XPEvent'
import { StreakModel } from '../../models/Streak'
import { RoadmapModel } from '../../models/Roadmap'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { generateQuestions } from './quiz-generation'
import { calculateSM2, gradeFromPercentage } from '../../lib/spaced-repetition'
import { updateNodeMastery } from '../roadmap/roadmap.service'
import { notify } from '../notifications/notification.service'
import { logger } from '../../config/logger'
import type { IQuiz } from '../../models/Quiz'
import type { IQuizAttempt } from '../../models/QuizAttempt'

export interface GenerateQuizInput {
  subjectSlug: string
  topicSlug: string
  type: 'topic' | 'subject' | 'mixed' | 'weakness' | 'mock'
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  questionCount: number
}

export interface SubmitQuizInput {
  quizId: string
  answers: Array<{
    questionId: string
    selectedOptionId: 'A' | 'B' | 'C' | 'D'
    timeSpentSec: number
  }>
  durationSec: number
}

export async function generateQuiz(
  userId: string,
  input: GenerateQuizInput,
): Promise<IQuiz> {
  const userObjectId = new Types.ObjectId(userId)

  // Fetch subject + topic info
  const subject = await SubjectModel.findOne({ slug: input.subjectSlug }).lean()
  if (!subject) {
    throw new NotFoundError(`Subject not found: ${input.subjectSlug}`)
  }

  const topic = subject.topics.find((t) => t.slug === input.topicSlug)
  if (!topic) {
    throw new NotFoundError(`Topic not found: ${input.topicSlug}`)
  }

  // Fetch recent attempt stems to avoid repetition
  const recentAttempts = await QuizAttemptModel.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const recentQuizIds = recentAttempts.map((a) => a.quizId)
  const recentQuizzes = await QuizModel.find({
    _id: { $in: recentQuizIds },
    'topicRef.topicSlug': input.topicSlug,
  }).lean()

  const recentStems = recentQuizzes
    .flatMap((q) => q.questions.map((qu) => qu.stem))
    .slice(0, 10)

  // Determine effective difficulty
  const effectiveDifficulty =
    input.difficulty === 'adaptive' ? 'medium' : input.difficulty

  // Get exam type from subject
  const examType = subject.examTypes[0] ?? 'jamb'

  // Generate questions via AI
  const questions = await generateQuestions({
    examType,
    subjectName: subject.name,
    topicName: topic.name,
    topicSlug: topic.slug,
    difficulty: effectiveDifficulty,
    count: input.questionCount,
    recentStems,
  })

  // Save quiz
  const quiz = await QuizModel.create({
    userId: userObjectId,
    type: input.type,
    topicRef: {
      subjectSlug: input.subjectSlug,
      topicSlug: input.topicSlug,
    },
    subjectSlug: input.subjectSlug,
    difficulty: input.difficulty,
    questionCount: questions.length,
    questions,
    generatedByModel: 'claude-sonnet-4-5',
  })

  return quiz
}

export async function startAttempt(
  userId: string,
  quizId: string,
): Promise<IQuizAttempt> {
  const userObjectId = new Types.ObjectId(userId)
  const quizObjectId = new Types.ObjectId(quizId)

  const quiz = await QuizModel.findOne({
    _id: quizObjectId,
    userId: userObjectId,
  }).lean()

  if (!quiz) {
    throw new NotFoundError('Quiz not found')
  }

  const attempt = await QuizAttemptModel.create({
    quizId: quizObjectId,
    userId: userObjectId,
    startedAt: new Date(),
    durationSec: 0,
    answers: [],
    score: 0,
    byTopic: [],
    xpAwarded: 0,
  })

  return attempt
}

export async function submitAttempt(
  userId: string,
  attemptId: string,
  input: SubmitQuizInput,
): Promise<{
  attempt: IQuizAttempt
  xpAwarded: number
  masteryUpdates: Array<{ topicSlug: string; mastery: number }>
}> {
  const userObjectId = new Types.ObjectId(userId)
  const attemptObjectId = new Types.ObjectId(attemptId)

  const [attempt, quiz] = await Promise.all([
    QuizAttemptModel.findOne({ _id: attemptObjectId, userId: userObjectId }),
    QuizModel.findById(input.quizId).lean(),
  ])

  if (!attempt) {
    throw new NotFoundError('Attempt not found')
  }
  if (!quiz) {
    throw new NotFoundError('Quiz not found')
  }
  if (attempt.completedAt) {
    throw new AppError(400, 'Attempt already submitted')
  }

  // Build a question lookup map
  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]))

  // Grade each answer
  const gradedAnswers = input.answers.map((a) => {
    const question = questionMap.get(a.questionId)
    const isCorrect = question
      ? question.correctOptionId === a.selectedOptionId
      : false
    return {
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      isCorrect,
      timeSpentSec: a.timeSpentSec,
    }
  })

  // Calculate overall score
  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length
  const totalCount = gradedAnswers.length
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Group by topic
  const topicGroups = new Map<string, { correct: number; total: number }>()
  for (const answer of gradedAnswers) {
    const question = questionMap.get(answer.questionId)
    const topicSlug = question?.topicSlug ?? quiz.topicRef?.topicSlug ?? 'unknown'
    const group = topicGroups.get(topicSlug) ?? { correct: 0, total: 0 }
    group.total += 1
    if (answer.isCorrect) group.correct += 1
    topicGroups.set(topicSlug, group)
  }

  // Fetch existing mastery values from roadmap for delta calculation
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId }).lean()

  const byTopic = Array.from(topicGroups.entries()).map(
    ([topicSlug, { correct, total }]) => {
      const correctness = total > 0 ? (correct / total) * 100 : 0
      const node = roadmap?.nodes.find(
        (n) =>
          n.topicSlug === topicSlug &&
          n.subjectSlug === quiz.topicRef?.subjectSlug,
      )
      const oldMastery = node?.mastery ?? 0
      const newMastery = Math.round(oldMastery * 0.7 + correctness * 0.3)
      const masteryDelta = newMastery - oldMastery
      return { topicSlug, correct, total, masteryDelta }
    },
  )

  // Award XP: 5 per correct, capped at 50
  const xpAwarded = Math.min(50, correctCount * 5)

  // Create XP event
  await XPEventModel.create({
    userId: userObjectId,
    source: 'quiz',
    sourceId: attempt._id,
    amount: xpAwarded,
    reason: `Quiz: ${score}% score`,
  })

  // Update streak if score >= 50%
  if (score >= 50) {
    const streak = await StreakModel.findOne({ userId: userObjectId })
    if (streak) {
      const todayString = new Date().toDateString()
      if (streak.lastActiveDate.toDateString() !== todayString) {
        streak.currentStreak += 1
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak
        }
        streak.lastActiveDate = new Date()
        await streak.save()
      }
    } else {
      await StreakModel.create({
        userId: userObjectId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
      })
    }
  }

  // Update mastery and SM-2 for each topic
  const masteryUpdates: Array<{ topicSlug: string; mastery: number }> = []

  for (const topicResult of byTopic) {
    const correctness =
      topicResult.total > 0
        ? (topicResult.correct / topicResult.total) * 100
        : 0

    const node = roadmap?.nodes.find(
      (n) =>
        n.topicSlug === topicResult.topicSlug &&
        n.subjectSlug === quiz.topicRef?.subjectSlug,
    )

    if (node && quiz.topicRef?.subjectSlug) {
      const oldMastery = node.mastery
      const newMastery = Math.round(oldMastery * 0.7 + correctness * 0.3)

      try {
        await updateNodeMastery(
          userId,
          quiz.topicRef.subjectSlug,
          topicResult.topicSlug,
          newMastery,
        )
        masteryUpdates.push({ topicSlug: topicResult.topicSlug, mastery: newMastery })
      } catch (err) {
        logger.warn({ err, topicSlug: topicResult.topicSlug }, 'Could not update node mastery')
      }

      // Update SM-2
      try {
        const grade = gradeFromPercentage(correctness)
        const sm2Result = calculateSM2({
          easeFactor: node.sm2.easeFactor,
          interval: node.sm2.interval,
          repetitions: node.sm2.repetitions,
          grade,
        })

        await RoadmapModel.updateOne(
          {
            userId: userObjectId,
            'nodes.topicSlug': topicResult.topicSlug,
            'nodes.subjectSlug': quiz.topicRef.subjectSlug,
          },
          {
            $set: {
              'nodes.$.sm2.easeFactor': sm2Result.easeFactor,
              'nodes.$.sm2.interval': sm2Result.interval,
              'nodes.$.sm2.repetitions': sm2Result.repetitions,
              'nodes.$.nextRevisionAt': sm2Result.nextReviewDate,
            },
          },
        )
      } catch (err) {
        logger.warn({ err, topicSlug: topicResult.topicSlug }, 'Could not update SM-2')
      }
    }
  }

  // Mark attempt as completed
  attempt.answers = gradedAnswers
  attempt.score = score
  attempt.byTopic = byTopic
  attempt.xpAwarded = xpAwarded
  attempt.durationSec = input.durationSec
  attempt.completedAt = new Date()
  await attempt.save()

  // Notify for mocks and high-stakes quizzes (score 80%+) — not every casual topic quiz
  const isMock = quiz?.type === 'mock'
  const isHighScore = score >= 80
  if (isMock || isHighScore) {
    const quizId = attempt.quizId.toString()
    const attemptId = attempt._id.toString()
    await notify(userId, 'quiz_result', {
      title: isMock ? `Mock exam complete — ${score}%` : `Quiz result — ${score}%`,
      body: isMock
        ? `You scored ${score}% on your mock exam. Check your results.`
        : `Great result. You scored ${score}% and earned ${xpAwarded} XP.`,
      deeplink: `/quizzes/${quizId}/results/${attemptId}`,
      metadata: { quizId, attemptId },
    })
  }

  return { attempt, xpAwarded, masteryUpdates }
}

export async function getAttempt(
  userId: string,
  attemptId: string,
): Promise<{ attempt: IQuizAttempt; quiz: IQuiz }> {
  const userObjectId = new Types.ObjectId(userId)
  const attemptObjectId = new Types.ObjectId(attemptId)

  const attempt = await QuizAttemptModel.findOne({
    _id: attemptObjectId,
    userId: userObjectId,
  }).lean()

  if (!attempt) {
    throw new NotFoundError('Attempt not found')
  }

  const quiz = await QuizModel.findById(attempt.quizId).lean()
  if (!quiz) {
    throw new NotFoundError('Quiz not found')
  }

  return {
    attempt: attempt as unknown as IQuizAttempt,
    quiz: quiz as unknown as IQuiz,
  }
}

export async function listQuizzes(userId: string): Promise<
  Array<{
    quizId: string
    attemptId: string | null
    topicSlug: string
    subjectSlug: string
    difficulty: string
    score: number | null
    questionCount: number
    createdAt: string
  }>
> {
  const userObjectId = new Types.ObjectId(userId)

  const quizzes = await QuizModel.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const quizIds = quizzes.map((q) => q._id)
  const attempts = await QuizAttemptModel.find({
    userId: userObjectId,
    quizId: { $in: quizIds },
  })
    .sort({ createdAt: -1 })
    .lean()

  // Map quizId -> most recent attempt
  const attemptMap = new Map<string, (typeof attempts)[number]>()
  for (const a of attempts) {
    const key = a.quizId.toString()
    if (!attemptMap.has(key)) {
      attemptMap.set(key, a)
    }
  }

  return quizzes.map((q) => {
    const attempt = attemptMap.get(q._id.toString())
    return {
      quizId: q._id.toString(),
      attemptId: attempt ? attempt._id.toString() : null,
      topicSlug: q.topicRef?.topicSlug ?? '',
      subjectSlug: q.topicRef?.subjectSlug ?? q.subjectSlug ?? '',
      difficulty: q.difficulty,
      score: attempt?.completedAt ? attempt.score : null,
      questionCount: q.questionCount,
      createdAt: (q as unknown as { createdAt: Date }).createdAt.toISOString(),
    }
  })
}
