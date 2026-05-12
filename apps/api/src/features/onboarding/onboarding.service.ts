import type {
  OnboardingStep1Input,
  OnboardingStep2JambInput,
  OnboardingStep2WaecInput,
  OnboardingStep3Input,
  OnboardingStep4Input,
  OnboardingStep5Input,
  OnboardingStep6Input,
} from '@propella/shared'
import { UserModel } from '../../models/User'
import { ExamProfileModel, type IExamProfile } from '../../models/ExamProfile'
import { SubjectModel } from '../../models/Subject'
import { RoadmapModel } from '../../models/Roadmap'
import { AppError, NotFoundError } from '../../middleware/error-handler'
import { generateInitialRoadmap } from '../../lib/adaptive-engine'
import type { Types } from 'mongoose'

// Window label → start/end time mapping
const WINDOW_TIMES: Record<string, { start: string; end: string }> = {
  'early-morning': { start: '05:00', end: '08:00' },
  morning: { start: '08:00', end: '12:00' },
  afternoon: { start: '12:00', end: '17:00' },
  evening: { start: '17:00', end: '22:00' },
}

function getPreferredWindow(
  windows: string[],
): { start: string; end: string } {
  if (windows.length === 0) return { start: '08:00', end: '22:00' }
  const first = windows[0]!
  const last = windows[windows.length - 1]!
  return {
    start: WINDOW_TIMES[first]?.start ?? '08:00',
    end: WINDOW_TIMES[last]?.end ?? '22:00',
  }
}

async function getUser(userId: string) {
  const user = await UserModel.findById(userId)
  if (!user) throw new NotFoundError('User not found')
  return user
}

async function ensureExamProfile(userId: string): Promise<IExamProfile> {
  const profile = await ExamProfileModel.findOne({ userId })
  if (!profile) {
    throw new AppError(400, 'Exam profile not initialised — complete step 1 first')
  }
  return profile
}

export async function getStatus(userId: string) {
  const user = await getUser(userId)
  return {
    step: user.onboardingStep,
    completed: user.onboardingCompleted,
  }
}

export async function saveStep1(
  userId: string,
  data: OnboardingStep1Input,
): Promise<void> {
  const user = await getUser(userId)

  // Upsert the ExamProfile with the chosen exam type
  await ExamProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        examType: data.examType,
        // Provide placeholder values that later steps will overwrite
        examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    },
    { upsert: true, new: true },
  )

  user.onboardingStep = 1
  await user.save()
}

export async function saveStep2Jamb(
  userId: string,
  data: OnboardingStep2JambInput,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  if (data.intendedCourse !== undefined) {
    profile.intendedCourse = data.intendedCourse
  }
  if (data.institutionType !== undefined) {
    profile.institutionType = data.institutionType
  }
  await profile.save()

  user.onboardingStep = 2
  await user.save()
}

export async function saveStep2Waec(
  userId: string,
  data: OnboardingStep2WaecInput,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  profile.learningStyle = data.learningStyle
  await profile.save()

  user.onboardingStep = 2
  await user.save()
}

export async function saveStep3(
  userId: string,
  data: OnboardingStep3Input,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  // Validate that the slugs exist in the Subject collection
  const foundSubjects = await SubjectModel.find({
    slug: { $in: data.subjectSlugs },
  })
    .select('slug name _id')
    .lean()

  const foundSlugsSet = new Set(foundSubjects.map((s) => s.slug))
  const invalidSlugs = data.subjectSlugs.filter((s) => !foundSlugsSet.has(s))
  if (invalidSlugs.length > 0) {
    throw new AppError(
      400,
      `Invalid subject slugs: ${invalidSlugs.join(', ')}`,
    )
  }

  profile.subjects = foundSubjects.map((s) => ({
    subjectId: (s._id as Types.ObjectId).toString(),
    slug: s.slug,
    name: s.name,
    isWeak: false,
    isStrong: false,
    currentMastery: 50,
  }))
  await profile.save()

  user.onboardingStep = 3
  await user.save()
}

export async function saveStep4(
  userId: string,
  data: OnboardingStep4Input,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  for (const strength of data.strengths) {
    const subject = profile.subjects.find(
      (s) => s.slug === strength.subjectSlug,
    )
    if (subject) {
      subject.isWeak = strength.level === 'weak'
      subject.isStrong = strength.level === 'strong'
    }
  }

  profile.markModified('subjects')
  await profile.save()

  user.onboardingStep = 4
  await user.save()
}

export async function saveStep5(
  userId: string,
  data: OnboardingStep5Input,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  profile.examDate = new Date(data.examDate)
  await profile.save()

  user.onboardingStep = 5
  await user.save()
}

export async function saveStep6(
  userId: string,
  data: OnboardingStep6Input,
): Promise<void> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  profile.dailyStudyMinutes = data.dailyStudyMinutes
  profile.preferredStudyWindow = getPreferredWindow(data.preferredStudyWindows)
  await profile.save()

  user.onboardingStep = 6
  await user.save()
}

interface CompletedUser {
  id: string
  name: string
  email: string
  plan: string
  onboardingCompleted: boolean
  onboardingStep: number
  theme: string
  timezone: string
  avatarUrl: string | undefined
}

export async function completeOnboarding(userId: string): Promise<{
  user: CompletedUser
  roadmap: { id: string } | null
}> {
  const user = await getUser(userId)
  const profile = await ensureExamProfile(userId)

  // Generate the roadmap (fire-and-forget style but we await it so the
  // response includes the roadmap ID)
  await generateInitialRoadmap(userId, profile)

  user.onboardingCompleted = true
  user.onboardingStep = 6
  await user.save()

  const roadmap = await RoadmapModel.findOne({ userId })
    .select('_id')
    .lean()

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      theme: user.theme,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
    },
    roadmap: roadmap ? { id: (roadmap._id as Types.ObjectId).toString() } : null,
  }
}
