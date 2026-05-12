import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IQuizOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface IQuizQuestion {
  id: string
  stem: string
  options: IQuizOption[]
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  explanation: string
  topicSlug: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface IQuiz extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: 'topic' | 'subject' | 'mixed' | 'weakness' | 'mock'
  topicRef?: {
    subjectSlug: string
    topicSlug: string
  }
  subjectSlug?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  questionCount: number
  timeLimit?: number
  questions: IQuizQuestion[]
  generatedByModel: string
  createdAt: Date
}

const quizOptionSchema = new Schema<IQuizOption>(
  {
    id: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: { type: String, required: true },
  },
  { _id: false },
)

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    id: { type: String, required: true },
    stem: { type: String, required: true },
    options: { type: [quizOptionSchema], required: true },
    correctOptionId: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, required: true },
    topicSlug: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  },
  { _id: false },
)

const quizSchema = new Schema<IQuiz>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['topic', 'subject', 'mixed', 'weakness', 'mock'],
      required: true,
    },
    topicRef: {
      subjectSlug: { type: String },
      topicSlug: { type: String },
    },
    subjectSlug: { type: String },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'adaptive'],
      required: true,
    },
    questionCount: { type: Number, required: true },
    timeLimit: { type: Number },
    questions: { type: [quizQuestionSchema], default: [] },
    generatedByModel: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

quizSchema.index({ userId: 1, createdAt: -1 })

export const QuizModel = (mongoose.models['Quiz'] as ReturnType<typeof model<IQuiz>>) ?? model<IQuiz>('Quiz', quizSchema)
