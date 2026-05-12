import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IExamSubject {
  subjectId: string
  slug: string
  name: string
  isWeak: boolean
  isStrong: boolean
  currentMastery: number
  lastStudiedAt?: Date
}

export interface IExamProfile extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  examType: 'jamb' | 'waec' | 'neco'
  examDate: Date
  intendedCourse?: string
  institutionType?: 'university' | 'polytechnic' | 'college'
  subjects: IExamSubject[]
  dailyStudyMinutes: number
  preferredStudyWindow: { start: string; end: string }
  learningStyle?: 'visual' | 'reading' | 'practice' | 'mixed'
  createdAt: Date
  updatedAt: Date
}

const examSubjectSchema = new Schema<IExamSubject>(
  {
    subjectId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    isWeak: { type: Boolean, default: false },
    isStrong: { type: Boolean, default: false },
    currentMastery: { type: Number, min: 0, max: 100, default: 50 },
    lastStudiedAt: { type: Date },
  },
  { _id: false },
)

const examProfileSchema = new Schema<IExamProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    examType: {
      type: String,
      enum: ['jamb', 'waec', 'neco'],
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    intendedCourse: {
      type: String,
    },
    institutionType: {
      type: String,
      enum: ['university', 'polytechnic', 'college'],
    },
    subjects: {
      type: [examSubjectSchema],
      default: [],
    },
    dailyStudyMinutes: {
      type: Number,
      default: 120,
    },
    preferredStudyWindow: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '22:00' },
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'reading', 'practice', 'mixed'],
    },
  },
  { timestamps: true },
)

export const ExamProfileModel = (mongoose.models['ExamProfile'] as ReturnType<typeof model<IExamProfile>>) ?? model<IExamProfile>('ExamProfile', examProfileSchema)
