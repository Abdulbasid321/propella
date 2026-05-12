import { z } from 'zod'

export const StartSessionSchema = z.object({
  subjectSlug: z.string(),
  topicSlug: z.string(),
  isMarathon: z.boolean().default(false),
})

export const EndSessionSchema = z.object({
  sessionId: z.string(),
  durationSec: z.number().int().min(0),
  notesMarkdown: z.string().max(50000).optional(),
})

export const StartMarathonSchema = z.object({
  plannedDurationMin: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(90),
    z.literal(120),
  ]),
  pomodoroLength: z.union([z.literal(25), z.literal(50)]),
  subjectSlugs: z.array(z.string()).min(1),
})

export type StartSessionInput = z.infer<typeof StartSessionSchema>
export type EndSessionInput = z.infer<typeof EndSessionSchema>
export type StartMarathonInput = z.infer<typeof StartMarathonSchema>
