import mongoose, { Schema, model, Document, Types } from 'mongoose'

export interface IChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  tokens?: number
  attachedTopic?: {
    subjectSlug: string
    topicSlug: string
  }
}

export interface IChatThread extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  title: string
  messages: IChatMessage[]
  archivedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    tokens: { type: Number },
    attachedTopic: {
      subjectSlug: { type: String },
      topicSlug: { type: String },
    },
  },
  { _id: false },
)

const chatThreadSchema = new Schema<IChatThread>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, default: 'New conversation' },
    messages: { type: [chatMessageSchema], default: [] },
    archivedAt: { type: Date },
  },
  { timestamps: true },
)

export const ChatThreadModel = (mongoose.models['ChatThread'] as ReturnType<typeof model<IChatThread>>) ?? model<IChatThread>('ChatThread', chatThreadSchema)
