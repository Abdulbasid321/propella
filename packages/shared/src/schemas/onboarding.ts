import { z } from 'zod'
import { EXAM_TYPES } from '../constants'

// export const OnboardingStep1Schema = z.object({
//   examType: z.enum(EXAM_TYPES),
// })

// after
export const OnboardingStep1Schema = z.object({
  examTypes: z.array(z.enum(EXAM_TYPES)).min(1),
})

export const OnboardingStep2JambSchema = z.object({
  intendedCourse: z.string().max(200).optional(),
  institutionType: z.enum(['university', 'polytechnic', 'college']).optional(),
})

export const OnboardingStep2WaecSchema = z.object({
  learningStyle: z.enum(['visual', 'reading', 'practice', 'mixed']),
})

export const OnboardingStep3Schema = z.object({
  subjectSlugs: z.array(z.string()).min(1).max(9),
})

export const SubjectStrengthSchema = z.object({
  subjectSlug: z.string(),
  level: z.enum(['weak', 'average', 'strong']),
})

export const OnboardingStep4Schema = z.object({
  strengths: z.array(SubjectStrengthSchema),
})

export const OnboardingStep5Schema = z.object({
  examDate: z.string().datetime(),
})

export const OnboardingStep6Schema = z.object({
  dailyStudyMinutes: z.number().int().min(30).max(360),
  preferredStudyWindows: z.array(
    z.enum(['early-morning', 'morning', 'afternoon', 'evening']),
  ),
})

export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>
export type OnboardingStep2JambInput = z.infer<typeof OnboardingStep2JambSchema>
export type OnboardingStep2WaecInput = z.infer<typeof OnboardingStep2WaecSchema>
export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>
export type OnboardingStep4Input = z.infer<typeof OnboardingStep4Schema>
export type OnboardingStep5Input = z.infer<typeof OnboardingStep5Schema>
export type OnboardingStep6Input = z.infer<typeof OnboardingStep6Schema>
