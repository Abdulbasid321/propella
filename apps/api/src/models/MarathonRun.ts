import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface ITopicCovered {
  subjectSlug: string
  topicSlug: string
  durationSec: number
}

export interface IMarathonPause {
  at: Date
  durationSec: number
}

export interface IMarathonRun extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  startedAt: Date
  endedAt?: Date
  plannedDurationMin: number
  actualDurationSec: number
  pomodoroLength: number
  pomodorosCompleted: number
  topicsCovered: ITopicCovered[]
  xpAwarded: number
  status: 'running' | 'paused' | 'completed' | 'abandoned'
  pauses: IMarathonPause[]
  createdAt: Date
  updatedAt: Date
}

const topicCoveredSchema = new Schema<ITopicCovered>(
  {
    subjectSlug: { type: String, required: true },
    topicSlug: { type: String, required: true },
    durationSec: { type: Number, required: true },
  },
  { _id: false },
)

const marathonPauseSchema = new Schema<IMarathonPause>(
  {
    at: { type: Date, required: true },
    durationSec: { type: Number, required: true },
  },
  { _id: false },
)

const marathonRunSchema = new Schema<IMarathonRun>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    plannedDurationMin: { type: Number, required: true },
    actualDurationSec: { type: Number, default: 0 },
    pomodoroLength: { type: Number, default: 25 },
    pomodorosCompleted: { type: Number, default: 0 },
    topicsCovered: { type: [topicCoveredSchema], default: [] },
    xpAwarded: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['running', 'paused', 'completed', 'abandoned'],
      default: 'running',
    },
    pauses: { type: [marathonPauseSchema], default: [] },
  },
  { timestamps: true },
)

export const MarathonRunModel = (mongoose.models['MarathonRun'] as ReturnType<typeof model<IMarathonRun>>) ?? model<IMarathonRun>('MarathonRun', marathonRunSchema)
