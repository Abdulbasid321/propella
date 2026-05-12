import { z } from 'zod'
import { DIFFICULTY_LEVELS, QUIZ_TYPES } from '../constants'

export const GenerateQuizSchema = z.object({
  subjectSlug: z.string(),
  topicSlug: z.string().optional(),
  type: z.enum(QUIZ_TYPES),
  difficulty: z.enum(DIFFICULTY_LEVELS).default('adaptive'),
  questionCount: z.number().int().min(5).max(50).default(10),
  timeLimitSeconds: z.number().int().optional(),
})

export const SubmitQuizSchema = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string(),
      timeSpentSec: z.number().int().min(0),
    }),
  ),
  durationSec: z.number().int().min(0),
})

export type GenerateQuizInput = z.infer<typeof GenerateQuizSchema>
export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>
