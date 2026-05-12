import { Schema, model, Document, Types } from 'mongoose'

export interface ISubjectTopic {
  _id: Types.ObjectId
  slug: string
  name: string
  order: number
  description: string
  estimatedMinutes: number
  prerequisiteSlugs: string[]
  examWeight: number
  examTypes: ('jamb' | 'waec' | 'neco')[]
}

export interface ISubject extends Document {
  _id: Types.ObjectId
  slug: string
  name: string
  examTypes: ('jamb' | 'waec' | 'neco')[]
  description: string
  hue: string
  topics: ISubjectTopic[]
  createdAt: Date
  updatedAt: Date
}

const subjectTopicSchema = new Schema<ISubjectTopic>({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  description: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true },
  prerequisiteSlugs: { type: [String], default: [] },
  examWeight: { type: Number, min: 0, max: 1, required: true },
  examTypes: {
    type: [String],
    enum: ['jamb', 'waec', 'neco'],
    default: [],
  },
})

const subjectSchema = new Schema<ISubject>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    examTypes: {
      type: [String],
      enum: ['jamb', 'waec', 'neco'],
      default: [],
    },
    description: { type: String, required: true },
    hue: { type: String, required: true },
    topics: { type: [subjectTopicSchema], default: [] },
  },
  { timestamps: true },
)

export const SubjectModel = model<ISubject>('Subject', subjectSchema)
