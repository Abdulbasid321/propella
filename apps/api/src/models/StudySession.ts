import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IStudySession extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  topicRef: {
    subjectSlug: string
    topicSlug: string
  }
  startedAt: Date
  endedAt?: Date
  durationSec: number
  isMarathon: boolean
  pomodoros?: number
  status: 'in-progress' | 'completed' | 'abandoned'
  notesMarkdown?: string
  xpAwarded: number
  createdAt: Date
  updatedAt: Date
}

const studySessionSchema = new Schema<IStudySession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topicRef: {
      subjectSlug: { type: String, required: true },
      topicSlug: { type: String, required: true },
    },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    durationSec: { type: Number, default: 0 },
    isMarathon: { type: Boolean, default: false },
    pomodoros: { type: Number },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    notesMarkdown: { type: String },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true },
)

studySessionSchema.index({ userId: 1, startedAt: -1 })

export const StudySessionModel = (mongoose.models['StudySession'] as ReturnType<typeof model<IStudySession>>) ?? model<IStudySession>('StudySession', studySessionSchema)
