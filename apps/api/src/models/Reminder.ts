import mongoose, { Schema, model, Document, Types } from 'mongoose'

export type ReminderType =
  | 'study_session'
  | 'revision'
  | 'mock'
  | 'streak_warning'
  | 'weekly_review'

export interface IReminderPayload {
  title: string
  body: string
  deeplink?: string
}

export interface IReminder extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: ReminderType
  scheduledFor: Date
  channel: 'push' | 'email'
  payload: IReminderPayload
  sentAt?: Date
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  createdAt: Date
}

const reminderPayloadSchema = new Schema<IReminderPayload>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    deeplink: { type: String },
  },
  { _id: false },
)

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['study_session', 'revision', 'mock', 'streak_warning', 'weekly_review'],
      required: true,
    },
    scheduledFor: { type: Date, required: true, index: true },
    channel: { type: String, enum: ['push', 'email'], required: true },
    payload: { type: reminderPayloadSchema, required: true },
    sentAt: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'failed', 'cancelled'],
      default: 'scheduled',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

reminderSchema.index({ scheduledFor: 1, status: 1 })

export const ReminderModel = (mongoose.models['Reminder'] as ReturnType<typeof model<IReminder>>) ?? model<IReminder>('Reminder', reminderSchema)
