import mongoose, { Schema, model, Document, Types } from 'mongoose'

export type XPSource =
  | 'study_session'
  | 'quiz'
  | 'mock'
  | 'marathon'
  | 'streak_milestone'
  | 'topic_completed'
  | 'milestone_unlocked'
  | 'daily_challenge'

export interface IXPEvent extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  source: XPSource
  sourceId?: Types.ObjectId
  amount: number
  reason: string
  multiplier?: number
  createdAt: Date
}

const xpEventSchema = new Schema<IXPEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: [
        'study_session',
        'quiz',
        'mock',
        'marathon',
        'streak_milestone',
        'topic_completed',
        'milestone_unlocked',
        'daily_challenge',
      ],
      required: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    multiplier: { type: Number },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
)

export const XPEventModel = (mongoose.models['XPEvent'] as ReturnType<typeof model<IXPEvent>>) ?? model<IXPEvent>('XPEvent', xpEventSchema)
