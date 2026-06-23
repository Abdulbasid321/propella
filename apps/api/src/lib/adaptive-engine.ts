import { differenceInWeeks, addDays, startOfDay } from 'date-fns'
import type { IExamProfile } from '../models/ExamProfile'
import { RoadmapModel, type IRoadmapNode, type IWeeklyTarget } from '../models/Roadmap'
import { SubjectModel } from '../models/Subject'

export async function generateInitialRoadmap(
  userId: string,
  profile: IExamProfile,
): Promise<void> {
  // Remove any existing roadmap for this user
  await RoadmapModel.deleteOne({ userId })

  const selectedExamTypes = profile.examTypes?.length
    ? profile.examTypes
    : [profile.examType]

  const subjects = await SubjectModel.find({
    slug: { $in: profile.subjects.map((s) => s.slug) },
    examTypes: { $in: selectedExamTypes },
  })

  const examDate = new Date(profile.examDate)
  const now = new Date()
  const totalWeeks = Math.max(1, differenceInWeeks(examDate, now))

  const nodes: Omit<IRoadmapNode, never>[] = []

  let dayOffset = 0

  for (const subject of subjects) {
    const profileSubject = profile.subjects.find((s) => s.slug === subject.slug)
    const timeMultiplier =
      profileSubject?.isWeak ? 1.3 : profileSubject?.isStrong ? 0.8 : 1.0

    const subjectTopics = subject.topics
      .filter((t) => t.examTypes.some((examType) => selectedExamTypes.includes(examType)))
      .sort((a, b) => a.order - b.order)

    for (let i = 0; i < subjectTopics.length; i++) {
      const topic = subjectTopics[i]!
      const studyMinutesPerDay = profile.dailyStudyMinutes
      const estimatedDays = Math.max(
        1,
        Math.round((topic.estimatedMinutes * timeMultiplier) / studyMinutesPerDay),
      )

      const plannedStart = startOfDay(addDays(now, dayOffset))
      const plannedEnd = startOfDay(addDays(plannedStart, estimatedDays))
      dayOffset += estimatedDays

      const isMilestone = (i + 1) % 5 === 0 || i === subjectTopics.length - 1
      const milestoneLabel = isMilestone
        ? i === subjectTopics.length - 1
          ? `${subject.name} Complete`
          : `${subject.name} Checkpoint`
        : undefined

      const node: IRoadmapNode = {
        subjectSlug: subject.slug,
        topicSlug: topic.slug,
        plannedStartDate: plannedStart,
        plannedEndDate: plannedEnd,
        status: i === 0 ? 'ready' : 'locked',
        mastery: 0,
        revisionsCompleted: 0,
        revisionsScheduled: 1,
        sm2: { easeFactor: 2.5, interval: 1, repetitions: 0 },
        isMilestone,
        ...(milestoneLabel !== undefined ? { milestoneLabel } : {}),
        nextRevisionAt: addDays(plannedEnd, 1),
      }

      nodes.push(node)
    }
  }

  const weeklyTargets: IWeeklyTarget[] = Array.from(
    { length: totalWeeks },
    (_, w): IWeeklyTarget => ({
      weekStartDate: addDays(now, w * 7),
      topicsToComplete: Math.ceil(nodes.length / totalWeeks),
      minutesGoal: profile.dailyStudyMinutes * 7,
      quizzesTargeted: 3,
    }),
  )

  await RoadmapModel.create({
    userId,
    generatedAt: now,
    examDate,
    totalWeeks,
    examReadiness: 0,
    nodes,
    weeklyTargets,
  })
}
