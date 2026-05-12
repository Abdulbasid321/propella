import { Schema, model, Document, Types } from 'mongoose'

export interface ISm2 {
  easeFactor: number
  interval: number
  repetitions: number
}

export interface IRoadmapNode {
  subjectSlug: string
  topicSlug: string
  plannedStartDate: Date
  plannedEndDate: Date
  status: 'locked' | 'ready' | 'in-progress' | 'completed' | 'needs-revision'
  mastery: number
  revisionsCompleted: number
  revisionsScheduled: number
  lastStudiedAt?: Date
  nextRevisionAt?: Date
  sm2: ISm2
  isMilestone: boolean
  milestoneLabel?: string
}

export interface IWeeklyTarget {
  weekStartDate: Date
  topicsToComplete: number
  minutesGoal: number
  quizzesTargeted: number
}

export interface IRoadmap extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  generatedAt: Date
  examDate: Date
  totalWeeks: number
  examReadiness: number
  nodes: IRoadmapNode[]
  weeklyTargets: IWeeklyTarget[]
  createdAt: Date
  updatedAt: Date
}

const sm2Schema = new Schema<ISm2>(
  {
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 },
    repetitions: { type: Number, default: 0 },
  },
  { _id: false },
)

const roadmapNodeSchema = new Schema<IRoadmapNode>(
  {
    subjectSlug: { type: String, required: true },
    topicSlug: { type: String, required: true },
    plannedStartDate: { type: Date, required: true },
    plannedEndDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['locked', 'ready', 'in-progress', 'completed', 'needs-revision'],
      default: 'locked',
    },
    mastery: { type: Number, min: 0, max: 100, default: 0 },
    revisionsCompleted: { type: Number, default: 0 },
    revisionsScheduled: { type: Number, default: 0 },
    lastStudiedAt: { type: Date },
    nextRevisionAt: { type: Date },
    sm2: { type: sm2Schema, default: () => ({}) },
    isMilestone: { type: Boolean, default: false },
    milestoneLabel: { type: String },
  },
  { _id: false },
)

const weeklyTargetSchema = new Schema<IWeeklyTarget>(
  {
    weekStartDate: { type: Date, required: true },
    topicsToComplete: { type: Number, required: true },
    minutesGoal: { type: Number, required: true },
    quizzesTargeted: { type: Number, required: true },
  },
  { _id: false },
)

const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    generatedAt: { type: Date, required: true, default: Date.now },
    examDate: { type: Date, required: true },
    totalWeeks: { type: Number, required: true },
    examReadiness: { type: Number, min: 0, max: 100, default: 0 },
    nodes: { type: [roadmapNodeSchema], default: [] },
    weeklyTargets: { type: [weeklyTargetSchema], default: [] },
  },
  { timestamps: true },
)

roadmapSchema.index({ userId: 1 }, { unique: true })
roadmapSchema.index({ 'nodes.plannedStartDate': 1 })

export const RoadmapModel = model<IRoadmap>('Roadmap', roadmapSchema)
