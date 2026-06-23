import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  passwordHash: string
  name: string
  avatarUrl?: string
  onboardingCompleted: boolean
  onboardingStep: number
  plan: 'free' | 'scholar'
  planExpiresAt?: Date
  notifications: {
    email: boolean
    push: boolean
    studyReminders: boolean
    streakReminders: boolean
    weeklyDigest: boolean
  }
  theme: 'system' | 'light' | 'dark'
  timezone: string
  locale: 'en' | 'yo' | 'ha' | 'ig'
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      enum: ['free', 'scholar'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true },
      streakReminders: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system',
    },
    timezone: {
      type: String,
      default: 'Africa/Lagos',
    },
    locale: {
      type: String,
      enum: ['en', 'yo', 'ha', 'ig'],
      default: 'en',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
)

userSchema.index({ createdAt: 1 })

export const UserModel = (mongoose.models['User'] as ReturnType<typeof model<IUser>>) ?? model<IUser>('User', userSchema)
