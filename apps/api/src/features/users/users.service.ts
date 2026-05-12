import { Types } from 'mongoose'
import { UserModel } from '../../models/User'
import { ExamProfileModel } from '../../models/ExamProfile'
import { StreakModel } from '../../models/Streak'
import { XPEventModel } from '../../models/XPEvent'
import { NotFoundError } from '../../middleware/error-handler'
import { getRank, getNextRank } from '@propella/shared'
import type { AuthUser } from '@propella/shared'

interface ExamProfileSummary {
  examType: string
  examDate: string
  subjects: { slug: string; name: string; isWeak: boolean; isStrong: boolean; currentMastery: number }[]
  dailyStudyMinutes: number
  preferredStudyWindow: { start: string; end: string }
  learningStyle?: string
  intendedCourse?: string
  institutionType?: string
}

interface MeResponse {
  user: AuthUser
  examProfile: ExamProfileSummary | null
  streak: {
    currentStreak: number
    longestStreak: number
    lastActiveDate: string
    freezesAvailable: number
  }
  xp: {
    totalXP: number
    rankName: string
    nextRankName: string | null
    nextRankThreshold: number | null
    xpToNextRank: number | null
  }
}

function buildAuthUser(user: {
  _id: { toString(): string }
  name: string
  email: string
  plan: 'free' | 'scholar'
  onboardingCompleted: boolean
  onboardingStep: number
  theme: 'system' | 'light' | 'dark'
  timezone: string
  avatarUrl?: string
}): AuthUser {
  const result: AuthUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    plan: user.plan,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    theme: user.theme,
    timezone: user.timezone,
  }
  if (user.avatarUrl !== undefined) result.avatarUrl = user.avatarUrl
  return result
}

export async function getMe(userId: string): Promise<MeResponse> {
  const userObjectId = new Types.ObjectId(userId)

  const user = await UserModel.findById(userObjectId).lean()
  if (!user) {
    throw new NotFoundError('User not found')
  }

  const [examProfile, streakDoc, xpAgg] = await Promise.all([
    ExamProfileModel.findOne({ userId: userObjectId }).lean(),
    StreakModel.findOne({ userId: userObjectId }).lean(),
    XPEventModel.aggregate<{ _id: null; total: number }>([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  const totalXP = xpAgg[0]?.total ?? 0
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)

  let examProfileSummary: ExamProfileSummary | null = null
  if (examProfile) {
    const summary: ExamProfileSummary = {
      examType: examProfile.examType,
      examDate: examProfile.examDate.toISOString(),
      subjects: examProfile.subjects.map((s) => ({
        slug: s.slug,
        name: s.name,
        isWeak: s.isWeak,
        isStrong: s.isStrong,
        currentMastery: s.currentMastery,
      })),
      dailyStudyMinutes: examProfile.dailyStudyMinutes,
      preferredStudyWindow: {
        start: examProfile.preferredStudyWindow.start,
        end: examProfile.preferredStudyWindow.end,
      },
    }
    if (examProfile.learningStyle !== undefined) summary.learningStyle = examProfile.learningStyle
    if (examProfile.intendedCourse !== undefined) summary.intendedCourse = examProfile.intendedCourse
    if (examProfile.institutionType !== undefined) summary.institutionType = examProfile.institutionType
    examProfileSummary = summary
  }

  return {
    user: buildAuthUser(user),
    examProfile: examProfileSummary,
    streak: streakDoc
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
        },
    xp: {
      totalXP,
      rankName: rank.name,
      nextRankName: nextRank?.name ?? null,
      nextRankThreshold: nextRank?.threshold ?? null,
      xpToNextRank: nextRank ? nextRank.threshold - totalXP : null,
    },
  }
}

interface UpdateProfileData {
  name?: string
  theme?: 'system' | 'light' | 'dark'
  timezone?: string
  notifications?: {
    email?: boolean
    push?: boolean
    studyReminders?: boolean
    streakReminders?: boolean
    weeklyDigest?: boolean
  }
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileData,
): Promise<AuthUser> {
  const userObjectId = new Types.ObjectId(userId)

  const user = await UserModel.findById(userObjectId)
  if (!user) {
    throw new NotFoundError('User not found')
  }

  if (data.name !== undefined) user.name = data.name
  if (data.theme !== undefined) user.theme = data.theme
  if (data.timezone !== undefined) user.timezone = data.timezone
  if (data.notifications !== undefined) {
    if (data.notifications.email !== undefined) user.notifications.email = data.notifications.email
    if (data.notifications.push !== undefined) user.notifications.push = data.notifications.push
    if (data.notifications.studyReminders !== undefined)
      user.notifications.studyReminders = data.notifications.studyReminders
    if (data.notifications.streakReminders !== undefined)
      user.notifications.streakReminders = data.notifications.streakReminders
    if (data.notifications.weeklyDigest !== undefined)
      user.notifications.weeklyDigest = data.notifications.weeklyDigest
  }

  await user.save()

  return buildAuthUser(user)
}
