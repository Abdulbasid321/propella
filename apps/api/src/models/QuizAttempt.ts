import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IQuizAnswer {
  questionId: string
  selectedOptionId: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  timeSpentSec: number
}

export interface IByTopicResult {
  topicSlug: string
  correct: number
  total: number
  masteryDelta: number
}

export interface IQuizAttempt extends Document {
  _id: Types.ObjectId
  quizId: Types.ObjectId
  userId: Types.ObjectId
  startedAt: Date
  completedAt?: Date
  durationSec: number
  answers: IQuizAnswer[]
  score: number
  byTopic: IByTopicResult[]
  xpAwarded: number
  createdAt: Date
  updatedAt: Date
}

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionId: { type: String, required: true },
    selectedOptionId: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpentSec: { type: Number, required: true },
  },
  { _id: false },
)

const byTopicResultSchema = new Schema<IByTopicResult>(
  {
    topicSlug: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    masteryDelta: { type: Number, required: true },
  },
  { _id: false },
)

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    durationSec: { type: Number, required: true, default: 0 },
    answers: { type: [quizAnswerSchema], default: [] },
    score: { type: Number, min: 0, max: 100, required: true, default: 0 },
    byTopic: { type: [byTopicResultSchema], default: [] },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const QuizAttemptModel = (mongoose.models['QuizAttempt'] as ReturnType<typeof model<IQuizAttempt>>) ?? model<IQuizAttempt>('QuizAttempt', quizAttemptSchema)
