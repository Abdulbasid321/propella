import mongoose, { Schema, model, Document, Types } from 'mongoose'

export type NotificationType =
  | 'study_reminder'
  | 'revision_due'
  | 'streak_warning'
  | 'streak_milestone'
  | 'mock_available'
  | 'quiz_result'
  | 'topic_unlocked'
  | 'rank_up'
  | 'badge_earned'
  | 'weekly_review'
  | 'system'
  | 'plan_change'

export interface INotification extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: NotificationType
  title: string
  body: string
  deeplink: string | null
  metadata: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
  expiresAt: Date | null
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'study_reminder',
        'revision_due',
        'streak_warning',
        'streak_milestone',
        'mock_available',
        'quiz_result',
        'topic_unlocked',
        'rank_up',
        'badge_earned',
        'weekly_review',
        'system',
        'plan_change',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 80 },
    body: { type: String, required: true, maxlength: 200 },
    deeplink: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: false },
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, readAt: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true })

export const NotificationModel =
  (mongoose.models['Notification'] as ReturnType<typeof model<INotification>>) ??
  model<INotification>('Notification', notificationSchema)
