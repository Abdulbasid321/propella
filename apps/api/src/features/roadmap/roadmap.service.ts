import { Types } from 'mongoose'
import { RoadmapModel } from '../../models/Roadmap'
import { SubjectModel } from '../../models/Subject'
import { ExamProfileModel } from '../../models/ExamProfile'
import { UserModel } from '../../models/User'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { generateInitialRoadmap } from '../../lib/adaptive-engine'
import type { Roadmap, RoadmapNode } from '@propella/shared'

export async function getRoadmap(userId: string): Promise<Roadmap> {
  const userObjectId = new Types.ObjectId(userId)
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId }).lean()
  if (!roadmap) {
    throw new NotFoundError('Roadmap not found')
  }

  // Load all subjects referenced by the roadmap nodes
  const subjectSlugs = [...new Set(roadmap.nodes.map((n) => n.subjectSlug))]
  const subjects = await SubjectModel.find({ slug: { $in: subjectSlugs } })
    .select('slug name topics')
    .lean()

  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  const enrichedNodes: RoadmapNode[] = roadmap.nodes.map((node) => {
    const subject = subjectMap.get(node.subjectSlug)
    const topic = subject?.topics.find((t) => t.slug === node.topicSlug)
    const subjectTopics = subject?.topics ?? []

    const enriched: RoadmapNode = {
      subjectSlug: node.subjectSlug,
      topicSlug: node.topicSlug,
      topicName: topic?.name ?? node.topicSlug,
      subjectName: subject?.name ?? node.subjectSlug,
      topicOrder: topic?.order ?? 0,
      topicTotal: subjectTopics.length,
      plannedStartDate: node.plannedStartDate.toISOString(),
      plannedEndDate: node.plannedEndDate.toISOString(),
      status: node.status,
      mastery: node.mastery,
      revisionsCompleted: node.revisionsCompleted,
      revisionsScheduled: node.revisionsScheduled,
      sm2: {
        easeFactor: node.sm2.easeFactor,
        interval: node.sm2.interval,
        repetitions: node.sm2.repetitions,
      },
      isMilestone: node.isMilestone,
      estimatedMinutes: topic?.estimatedMinutes ?? 30,
    }

    if (node.lastStudiedAt) enriched.lastStudiedAt = node.lastStudiedAt.toISOString()
    if (node.nextRevisionAt) enriched.nextRevisionAt = node.nextRevisionAt.toISOString()
    if (node.milestoneLabel) enriched.milestoneLabel = node.milestoneLabel

    return enriched
  })

  return {
    id: roadmap._id.toString(),
    userId: roadmap.userId.toString(),
    generatedAt: roadmap.generatedAt.toISOString(),
    examDate: roadmap.examDate.toISOString(),
    totalWeeks: roadmap.totalWeeks,
    examReadiness: roadmap.examReadiness,
    nodes: enrichedNodes,
    weeklyTargets: roadmap.weeklyTargets.map((wt) => ({
      weekStartDate: wt.weekStartDate.toISOString(),
      topicsToComplete: wt.topicsToComplete,
      minutesGoal: wt.minutesGoal,
      quizzesTargeted: wt.quizzesTargeted,
    })),
  }
}

export async function updateNodeStatus(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
  status: string,
): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId })
  if (!roadmap) {
    throw new NotFoundError('Roadmap not found')
  }

  const node = roadmap.nodes.find(
    (n) => n.subjectSlug === subjectSlug && n.topicSlug === topicSlug,
  )
  if (!node) {
    throw new NotFoundError(`Node not found: ${subjectSlug}/${topicSlug}`)
  }

  const validStatuses = ['locked', 'ready', 'in-progress', 'completed', 'needs-revision']
  if (!validStatuses.includes(status)) {
    throw new AppError(400, `Invalid status: ${status}`)
  }

  node.status = status as 'locked' | 'ready' | 'in-progress' | 'completed' | 'needs-revision'
  roadmap.markModified('nodes')
  await roadmap.save()
}

export async function updateNodeMastery(
  userId: string,
  subjectSlug: string,
  topicSlug: string,
  mastery: number,
): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId })
  if (!roadmap) {
    throw new NotFoundError('Roadmap not found')
  }

  const node = roadmap.nodes.find(
    (n) => n.subjectSlug === subjectSlug && n.topicSlug === topicSlug,
  )
  if (!node) {
    throw new NotFoundError(`Node not found: ${subjectSlug}/${topicSlug}`)
  }

  if (mastery < 0 || mastery > 100) {
    throw new AppError(400, 'Mastery must be between 0 and 100')
  }

  node.mastery = mastery

  if (mastery >= 80 && node.revisionsCompleted >= 1) {
    node.status = 'completed'
  }

  roadmap.markModified('nodes')
  await roadmap.save()
}

export async function regenerateRoadmap(userId: string): Promise<void> {
  const userObjectId = new Types.ObjectId(userId)
  const user = await UserModel.findById(userObjectId).lean()
  if (!user) {
    throw new NotFoundError('User not found')
  }

  // Use non-lean to get full IExamProfile document as required by generateInitialRoadmap
  const profile = await ExamProfileModel.findOne({ userId: userObjectId })
  if (!profile) {
    throw new NotFoundError('Exam profile not found')
  }

  await generateInitialRoadmap(userId, profile)
}
