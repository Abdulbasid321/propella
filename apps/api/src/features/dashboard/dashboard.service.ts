import { Types } from 'mongoose'
import { ExamProfileModel } from '../../models/ExamProfile'
import { RoadmapModel } from '../../models/Roadmap'
import { StreakModel } from '../../models/Streak'
import { XPEventModel } from '../../models/XPEvent'
import { QuizAttemptModel } from '../../models/QuizAttempt'
import { SubjectModel } from '../../models/Subject'
import { AppError } from '../../middleware/error-handler'
import { getRank, getNextRank } from '@propella/shared'
import type {
  DashboardData,
  TodayTopic,
  WeakTopic,
  DailyScore,
  UpcomingRevision,
  UserStreak,
  XPSummary,
} from '@propella/shared'

export async function getDashboard(userId: string): Promise<DashboardData> {
  const userObjectId = new Types.ObjectId(userId)

  // 1. Fetch ExamProfile
  const examProfile = await ExamProfileModel.findOne({ userId: userObjectId }).lean()
  if (!examProfile) {
    throw new AppError(404, 'Exam profile not found — please complete onboarding')
  }

  const user = await import('../../models/User').then((m) => m.UserModel.findById(userObjectId).lean())
  if (!user?.onboardingCompleted) {
    throw new AppError(404, 'Onboarding not complete')
  }

  // 2. Fetch Roadmap
  const roadmap = await RoadmapModel.findOne({ userId: userObjectId }).lean()

  // 3. Fetch Streak
  const streakDoc = await StreakModel.findOne({ userId: userObjectId }).lean()

  const streak: UserStreak = streakDoc
    ? {
        currentStreak: streakDoc.currentStreak,
        longestStreak: streakDoc.longestStreak,
        lastActiveDate: streakDoc.lastActiveDate.toISOString(),
        freezesAvailable: streakDoc.freezesAvailable,
      }
    : {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString(),
        freezesAvailable: 1,
      }

  // 4. Aggregate total XP
  const xpAgg = await XPEventModel.aggregate<{ _id: null; total: number }>([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  const totalXP = xpAgg[0]?.total ?? 0

  // 5. Compute rank
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  const xp: XPSummary = {
    totalXP,
    rankName: rank.name,
    nextRankName: nextRank?.name ?? null,
    nextRankThreshold: nextRank?.threshold ?? null,
    xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
  }

  const nodes = roadmap?.nodes ?? []

  // Load subjects for name resolution
  const subjectSlugs = [...new Set(nodes.map((n) => n.subjectSlug))]
  const subjects = await SubjectModel.find({ slug: { $in: subjectSlugs } })
    .select('slug name topics')
    .lean()

  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  // 6. Today's planned topics
  const today = new Date()
  const todayTopics: TodayTopic[] = []

  for (const node of nodes) {
    if (
      node.plannedStartDate <= today &&
      node.plannedEndDate >= today &&
      (node.status === 'ready' || node.status === 'in-progress')
    ) {
      const subject = subjectMap.get(node.subjectSlug)
      const topic = subject?.topics.find((t) => t.slug === node.topicSlug)

      todayTopics.push({
        subjectSlug: node.subjectSlug,
        subjectName: subject?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topic?.name ?? node.topicSlug,
        estimatedMinutes: topic?.estimatedMinutes ?? 30,
        status: node.status,
        nodeStatus: node.revisionsCompleted > 0 ? 'revision' : 'new',
      })
    }
  }

  // 7. Weakest topics: mastery < 50, sorted asc, limit 3
  const weakestTopics: WeakTopic[] = nodes
    .filter((n) => n.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((node) => {
      const subject = subjectMap.get(node.subjectSlug)
      const topic = subject?.topics.find((t) => t.slug === node.topicSlug)
      return {
        subjectSlug: node.subjectSlug,
        subjectName: subject?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topic?.name ?? node.topicSlug,
        mastery: node.mastery,
      }
    })

  // 8. Recent quiz scores: last 7 attempts
  const recentAttempts = await QuizAttemptModel.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(7)
    .lean()

  const recentScores: DailyScore[] = recentAttempts.map((attempt) => ({
    date: attempt.createdAt.toISOString().split('T')[0] ?? attempt.createdAt.toISOString(),
    averageScore: attempt.score,
  }))

  // 9. Upcoming revisions: nextRevisionAt within next 48 hours, status != 'locked'
  const in48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000)
  const upcomingRevisions: UpcomingRevision[] = []

  for (const node of nodes) {
    if (
      node.nextRevisionAt &&
      node.nextRevisionAt <= in48Hours &&
      node.status !== 'locked'
    ) {
      const subject = subjectMap.get(node.subjectSlug)
      const topic = subject?.topics.find((t) => t.slug === node.topicSlug)
      upcomingRevisions.push({
        subjectSlug: node.subjectSlug,
        subjectName: subject?.name ?? node.subjectSlug,
        topicSlug: node.topicSlug,
        topicName: topic?.name ?? node.topicSlug,
        nextRevisionAt: node.nextRevisionAt.toISOString(),
      })
    }
  }

  const examDate = new Date(examProfile.examDate)
  const daysToExam = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  return {
    daysToExam,
    examType: examProfile.examType,
    examDate: examProfile.examDate.toISOString(),
    todayTopics,
    streak,
    xp,
    weakestTopics,
    recentScores,
    upcomingRevisions,
    examReadiness: roadmap?.examReadiness ?? 0,
  }
}
