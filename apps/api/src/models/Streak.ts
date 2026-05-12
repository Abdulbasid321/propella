import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IStreak extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
  freezesAvailable: number
  freezesUsed: Date[]
  createdAt: Date
  updatedAt: Date
}

const streakSchema = new Schema<IStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, required: true, default: Date.now },
    freezesAvailable: { type: Number, default: 1 },
    freezesUsed: { type: [Date], default: [] },
  },
  { timestamps: true },
)

export const StreakModel = (mongoose.models['Streak'] as ReturnType<typeof model<IStreak>>) ?? model<IStreak>('Streak', streakSchema)
