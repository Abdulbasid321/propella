import { SubjectModel, type ISubject } from '../../models/Subject'
import { NotFoundError } from '../../middleware/error-handler'

export async function getAllSubjects(): Promise<ISubject[]> {
  return SubjectModel.find().sort({ name: 1 }).lean<ISubject[]>()
}

export async function getSubjectBySlug(slug: string): Promise<ISubject> {
  const subject = await SubjectModel.findOne({ slug }).lean<ISubject>()
  if (!subject) {
    throw new NotFoundError(`Subject '${slug}' not found`)
  }
  return subject
}
