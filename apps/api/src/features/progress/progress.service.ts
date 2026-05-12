import { Types } from 'mongoose'
import { StudySessionModel } from '../../models/StudySession'
import { QuizAttemptModel } from '../../models/QuizAttempt'
import { RoadmapModel } from '../../models/Roadmap'
import { SubjectModel } from '../../models/Subject'

interface SubjectMastery {
  subjectSlug: string
  subjectName: string
  averageMastery: number
  topicsTotal: number
  topicsMastered: number
}

interface ActivityDay {
  date: string
  minutes: number
  sessions: number
}

interface ScoreDay {
  date: string
  averageScore: number
}

interface WeakTopicEntry {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  mastery: number
}

interface ProgressData {
  totalStudyHours: number
  topicsMastered: number
  quizzesTaken: number
  averageScore: number
  subjectMastery: SubjectMastery[]
  activityHeatmap: ActivityDay[]
  scoreTrend: ScoreDay[]
  weakestTopics: WeakTopicEntry[]
}

export async function getProgress(userId: string): Promise<ProgressData> {
  const userObjectId = new Types.ObjectId(userId)
  const now = new Date()

  // Last 84 days for heatmap
  const heatmapStart = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000)
  // Last 30 days for score trend
  const scoreTrendStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [sessionAgg, quizStats, quizTrend, roadmap] = await Promise.all([
    // Total study hours and heatmap
    StudySessionModel.aggregate<{ _id: string; totalSec: number; count: number }>([
      {
        $match: {
          userId: userObjectId,
          status: 'completed',
          startedAt: { $gte: heatmapStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startedAt' },
          },
          totalSec: { $sum: '$durationSec' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Quiz stats (all time)
    QuizAttemptModel.aggregate<{ totalQuizzes: number; avgScore: number; totalStudySec: number }>([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
    ]),

    // Score trend: last 30 days
    QuizAttemptModel.aggregate<{ _id: string; averageScore: number }>([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: scoreTrendStart },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          averageScore: { $avg: '$score' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Roadmap for mastery data
    RoadmapModel.findOne({ userId: userObjectId }).lean(),
  ])

  // Total study hours from all completed sessions (all time)
  const allSessionsAgg = await StudySessionModel.aggregate<{ total: number }>([
    { $match: { userId: userObjectId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$durationSec' } } },
  ])
  const totalStudyHours = (allSessionsAgg[0]?.total ?? 0) / 3600

  const quizzesTaken = quizStats[0]?.totalQuizzes ?? 0
  const averageScore = Math.round(quizStats[0]?.avgScore ?? 0)

  const nodes = roadmap?.nodes ?? []

  // Topics mastered
  const topicsMastered = nodes.filter((n) => n.mastery >= 80).length

  // Subject mastery
  const subjectSlugs = [...new Set(nodes.map((n) => n.subjectSlug))]
  const subjects = await SubjectModel.find({ slug: { $in: subjectSlugs } })
    .select('slug name topics')
    .lean()
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]))

  const subjectMastery: SubjectMastery[] = subjectSlugs.map((slug) => {
    const subjectNodes = nodes.filter((n) => n.subjectSlug === slug)
    const avgMastery =
      subjectNodes.length > 0
        ? Math.round(subjectNodes.reduce((acc, n) => acc + n.mastery, 0) / subjectNodes.length)
        : 0
    const mastered = subjectNodes.filter((n) => n.mastery >= 80).length
    const subjectDoc = subjectMap.get(slug)
    return {
      subjectSlug: slug,
      subjectName: subjectDoc?.name ?? slug,
      averageMastery: avgMastery,
      topicsTotal: subjectNodes.length,
      topicsMastered: mastered,
    }
  })

  // Activity heatmap
  const activityHeatmap: ActivityDay[] = sessionAgg.map((day) => ({
    date: day._id,
    minutes: Math.round(day.totalSec / 60),
    sessions: day.count,
  }))

  // Score trend
  const scoreTrend: ScoreDay[] = quizTrend.map((day) => ({
    date: day._id,
    averageScore: Math.round(day.averageScore),
  }))

  // Weakest topics
  const weakestTopics: WeakTopicEntry[] = nodes
    .filter((n) => n.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery)
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

  return {
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    topicsMastered,
    quizzesTaken,
    averageScore,
    subjectMastery,
    activityHeatmap,
    scoreTrend,
    weakestTopics,
  }
}
