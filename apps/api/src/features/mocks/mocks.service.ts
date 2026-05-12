import { Types } from 'mongoose'
import { QuizModel } from '../../models/Quiz'
import { QuizAttemptModel } from '../../models/QuizAttempt'
import { SubjectModel } from '../../models/Subject'
import { ExamProfileModel } from '../../models/ExamProfile'
import { XPEventModel } from '../../models/XPEvent'
import { NotFoundError, AppError } from '../../middleware/error-handler'
import { generateQuestions } from '../quizzes/quiz-generation'
import type { IQuiz } from '../../models/Quiz'
import type { IQuizAttempt } from '../../models/QuizAttempt'
import { logger } from '../../config/logger'

const JAMB_TIME_LIMIT = 7200  // 2 hours in seconds
const WAEC_NECO_TIME_LIMIT = 10800  // 3 hours in seconds
const JAMB_QUESTIONS_PER_SUBJECT = 40
const WAEC_NECO_TOTAL_QUESTIONS = 60

export async function generateMock(
  userId: string,
  examType: 'jamb' | 'waec' | 'neco',
  subjectSlugs: string[],
): Promise<IQuiz> {
  const userObjectId = new Types.ObjectId(userId)

  // Fetch subjects
  const subjects = await SubjectModel.find({
    slug: { $in: subjectSlugs },
    examTypes: examType,
  }).lean()

  if (subjects.length === 0) {
    throw new NotFoundError('No matching subjects found for the given exam type')
  }

  const timeLimit = examType === 'jamb' ? JAMB_TIME_LIMIT : WAEC_NECO_TIME_LIMIT

  let allQuestions: Array<{
    id: string
    stem: string
    options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
    correctOptionId: 'A' | 'B' | 'C' | 'D'
    explanation: string
    topicSlug: string
    difficulty: 'easy' | 'medium' | 'hard'
  }> = []

  if (examType === 'jamb') {
    // 40 questions per subject
    for (const subject of subjects) {
      const topicsForExam = subject.topics.filter((t) => t.examTypes.includes(examType))
      if (topicsForExam.length === 0) continue

      const questionsPerTopic = Math.ceil(JAMB_QUESTIONS_PER_SUBJECT / topicsForExam.length)

      for (const topic of topicsForExam.slice(0, Math.min(5, topicsForExam.length))) {
        try {
          const count = Math.min(questionsPerTopic, 10)
          const questions = await generateQuestions({
            examType,
            subjectName: subject.name,
            topicName: topic.name,
            topicSlug: topic.slug,
            difficulty: 'medium',
            count,
          })
          allQuestions = allQuestions.concat(questions)
        } catch (err) {
          logger.warn({ err, topicSlug: topic.slug }, 'Failed to generate questions for topic')
        }
      }
    }
  } else {
    // WAEC/NECO: 60 questions spread across all subjects
    const questionsPerSubject = Math.ceil(WAEC_NECO_TOTAL_QUESTIONS / subjects.length)

    for (const subject of subjects) {
      const topicsForExam = subject.topics.filter((t) => t.examTypes.includes(examType))
      if (topicsForExam.length === 0) continue

      const firstTopic = topicsForExam[0]
      if (!firstTopic) continue

      try {
        const count = Math.min(questionsPerSubject, 20)
        const questions = await generateQuestions({
          examType,
          subjectName: subject.name,
          topicName: firstTopic.name,
          topicSlug: firstTopic.slug,
          difficulty: 'medium',
          count,
        })
        allQuestions = allQuestions.concat(questions)
      } catch (err) {
        logger.warn({ err, subjectSlug: subject.slug }, 'Failed to generate questions for subject')
      }
    }
  }

  if (allQuestions.length === 0) {
    throw new AppError(500, 'Failed to generate any questions for the mock exam')
  }

  const quiz = await QuizModel.create({
    userId: userObjectId,
    type: 'mock',
    difficulty: 'medium',
    questionCount: allQuestions.length,
    timeLimit,
    questions: allQuestions,
    generatedByModel: 'claude-sonnet-4-5',
  })

  return quiz
}

export async function startMockAttempt(userId: string, mockId: string): Promise<IQuizAttempt> {
  const userObjectId = new Types.ObjectId(userId)
  const mockObjectId = new Types.ObjectId(mockId)

  const mock = await QuizModel.findOne({
    _id: mockObjectId,
    userId: userObjectId,
    type: 'mock',
  }).lean()

  if (!mock) throw new NotFoundError('Mock exam not found')

  const attempt = await QuizAttemptModel.create({
    quizId: mockObjectId,
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

export async function submitMock(
  userId: string,
  attemptId: string,
  input: {
    quizId: string
    answers: Array<{
      questionId: string
      selectedOptionId: string
      timeSpentSec: number
    }>
    durationSec: number
  },
): Promise<{ attempt: IQuizAttempt; xpAwarded: number }> {
  const userObjectId = new Types.ObjectId(userId)
  const attemptObjectId = new Types.ObjectId(attemptId)

  const [attempt, quiz] = await Promise.all([
    QuizAttemptModel.findOne({ _id: attemptObjectId, userId: userObjectId }),
    QuizModel.findById(input.quizId).lean(),
  ])

  if (!attempt) throw new NotFoundError('Attempt not found')
  if (!quiz) throw new NotFoundError('Mock quiz not found')
  if (attempt.completedAt) throw new AppError(400, 'Attempt already submitted')

  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]))

  const gradedAnswers = input.answers.map((a) => {
    const question = questionMap.get(a.questionId)
    return {
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId as 'A' | 'B' | 'C' | 'D',
      isCorrect: question ? question.correctOptionId === a.selectedOptionId : false,
      timeSpentSec: a.timeSpentSec,
    }
  })

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length
  const totalCount = gradedAnswers.length
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Group by topic for byTopic results
  const topicGroups = new Map<string, { correct: number; total: number }>()
  for (const answer of gradedAnswers) {
    const question = questionMap.get(answer.questionId)
    const topicSlug = question?.topicSlug ?? 'unknown'
    const group = topicGroups.get(topicSlug) ?? { correct: 0, total: 0 }
    group.total += 1
    if (answer.isCorrect) group.correct += 1
    topicGroups.set(topicSlug, group)
  }

  const byTopic = Array.from(topicGroups.entries()).map(([topicSlug, { correct, total }]) => ({
    topicSlug,
    correct,
    total,
    masteryDelta: 0,
  }))

  // XP: base 100 + 1 per percent
  const xpAwarded = 100 + score

  await XPEventModel.create({
    userId: userObjectId,
    source: 'mock',
    sourceId: attempt._id,
    amount: xpAwarded,
    reason: `Mock exam: ${score}% score`,
  })

  attempt.answers = gradedAnswers
  attempt.score = score
  attempt.byTopic = byTopic
  attempt.xpAwarded = xpAwarded
  attempt.durationSec = input.durationSec
  attempt.completedAt = new Date()
  await attempt.save()

  return { attempt, xpAwarded }
}

export async function getMockAttemptResult(
  userId: string,
  attemptId: string,
): Promise<{ attempt: IQuizAttempt; quiz: IQuiz }> {
  const userObjectId = new Types.ObjectId(userId)

  const attempt = await QuizAttemptModel.findOne({
    _id: new Types.ObjectId(attemptId),
    userId: userObjectId,
  }).lean()

  if (!attempt) throw new NotFoundError('Attempt not found')

  const quiz = await QuizModel.findById(attempt.quizId).lean()
  if (!quiz) throw new NotFoundError('Mock quiz not found')

  return {
    attempt: attempt as unknown as IQuizAttempt,
    quiz: quiz as unknown as IQuiz,
  }
}

export async function getMockHistory(userId: string): Promise<
  Array<{
    mockId: string
    attemptId: string | null
    score: number | null
    questionCount: number
    timeLimit: number
    createdAt: string
    completedAt: string | null
  }>
> {
  const userObjectId = new Types.ObjectId(userId)

  const mocks = await QuizModel.find({ userId: userObjectId, type: 'mock' })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const mockIds = mocks.map((m) => m._id)
  const attempts = await QuizAttemptModel.find({
    userId: userObjectId,
    quizId: { $in: mockIds },
  })
    .sort({ createdAt: -1 })
    .lean()

  const attemptMap = new Map<string, (typeof attempts)[number]>()
  for (const a of attempts) {
    const key = a.quizId.toString()
    if (!attemptMap.has(key)) attemptMap.set(key, a)
  }

  return mocks.map((m) => {
    const attempt = attemptMap.get(m._id.toString())
    return {
      mockId: m._id.toString(),
      attemptId: attempt ? attempt._id.toString() : null,
      score: attempt?.completedAt ? attempt.score : null,
      questionCount: m.questionCount,
      timeLimit: m.timeLimit ?? JAMB_TIME_LIMIT,
      createdAt: (m as unknown as { createdAt: Date }).createdAt.toISOString(),
      completedAt: attempt?.completedAt
        ? (attempt.completedAt as unknown as Date).toISOString()
        : null,
    }
  })
}
