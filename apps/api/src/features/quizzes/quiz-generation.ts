import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export interface QuizQuestion {
  id: string
  stem: string
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
  correctOptionId: 'A' | 'B' | 'C' | 'D'
  explanation: string
  topicSlug: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export async function generateQuestions(params: {
  examType: string
  subjectName: string
  topicName: string
  topicSlug: string
  difficulty: string
  count: number
  recentStems?: string[]
}): Promise<QuizQuestion[]> {
  const avoidList = params.recentStems?.length
    ? `\nAvoid these recently-seen question stems: ${params.recentStems.slice(0, 10).join('; ')}`
    : ''

  const prompt = `Generate ${params.count} multiple-choice questions on the topic "${params.topicName}" within the subject "${params.subjectName}" for a Nigerian ${params.examType.toUpperCase()} candidate. Difficulty: ${params.difficulty}.

Questions must:
- Follow the exact style and structure of ${params.examType.toUpperCase()} past papers
- Have exactly 4 options (A, B, C, D) with exactly one correct answer
- Include a clear, teaching explanation that explains WHY the answer is correct and references the relevant principle${avoidList}

Return ONLY valid JSON — an array of objects with this exact shape:
[{ "stem": "...", "options": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}], "correctOptionId": "A", "explanation": "..." }]`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''

  // Extract JSON from response (may have markdown code fences)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    logger.error({ text }, 'No JSON array in AI response')
    throw new Error('No JSON array in AI response')
  }

  const raw = JSON.parse(jsonMatch[0]) as Array<{
    stem: string
    options: Array<{ id: string; text: string }>
    correctOptionId: string
    explanation: string
  }>

  return raw.map((q, i) => ({
    id: `q${Date.now()}_${i}`,
    stem: q.stem,
    options: q.options as Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>,
    correctOptionId: q.correctOptionId as 'A' | 'B' | 'C' | 'D',
    explanation: q.explanation,
    topicSlug: params.topicSlug,
    difficulty: params.difficulty as 'easy' | 'medium' | 'hard',
  }))
}
