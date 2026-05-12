import { Types } from 'mongoose'
import Anthropic from '@anthropic-ai/sdk'
import { nanoid } from 'nanoid'
import { ChatThreadModel, type IChatThread } from '../../models/ChatThread'
import { NotFoundError } from '../../middleware/error-handler'
import { env } from '../../config/env'

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Propella, a focused study companion for Nigerian secondary school students preparing for JAMB, WAEC, and NECO. Answer clearly and concisely. Use Nigerian curriculum examples where helpful. When a student asks about a topic in their syllabus, structure answers as: a 1-2 sentence definition, the core principle, a worked example, and 2 practice questions they can try. Never claim to know things you don't. Refuse off-topic requests politely (entertainment, off-curriculum subjects).`

export async function getThreads(userId: string): Promise<IChatThread[]> {
  const userObjectId = new Types.ObjectId(userId)
  return ChatThreadModel.find({ userId: userObjectId, archivedAt: { $exists: false } })
    .sort({ updatedAt: -1 })
    .select('_id title createdAt updatedAt')
    .lean() as unknown as IChatThread[]
}

export async function createThread(userId: string): Promise<IChatThread> {
  const userObjectId = new Types.ObjectId(userId)
  const thread = await ChatThreadModel.create({
    userId: userObjectId,
    title: 'New conversation',
    messages: [],
  })
  return thread
}

export async function getThread(userId: string, threadId: string): Promise<IChatThread> {
  const userObjectId = new Types.ObjectId(userId)
  const thread = await ChatThreadModel.findOne({
    _id: new Types.ObjectId(threadId),
    userId: userObjectId,
  }).lean()

  if (!thread) throw new NotFoundError('Thread not found')
  return thread as unknown as IChatThread
}

export async function streamMessage(
  userId: string,
  threadId: string,
  content: string,
  attachedTopic?: { subjectSlug: string; topicSlug: string },
  onChunk?: (chunk: string) => void,
): Promise<string> {
  const userObjectId = new Types.ObjectId(userId)

  const thread = await ChatThreadModel.findOne({
    _id: new Types.ObjectId(threadId),
    userId: userObjectId,
  })

  if (!thread) throw new NotFoundError('Thread not found')

  // Add user message
  const userMessageId = nanoid()
  const userMessage = {
    id: userMessageId,
    role: 'user' as const,
    content,
    createdAt: new Date(),
    ...(attachedTopic ? { attachedTopic } : {}),
  }
  thread.messages.push(userMessage)

  // Prepare messages for Claude
  const anthropicMessages: Anthropic.MessageParam[] = thread.messages
    .filter((m) => m.id !== userMessageId)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  // Add the new user message
  anthropicMessages.push({ role: 'user', content })

  // Stream response from Claude Haiku
  let fullText = ''

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      const chunk = event.delta.text
      fullText += chunk
      if (onChunk) onChunk(chunk)
    }
  }

  // Save assistant message to thread
  const assistantMessage = {
    id: nanoid(),
    role: 'assistant' as const,
    content: fullText,
    createdAt: new Date(),
  }
  thread.messages.push(assistantMessage)

  // Update title if first exchange (user + assistant = 2 messages)
  if (thread.messages.length === 2) {
    thread.title = content.slice(0, 60)
  }

  await thread.save()

  return fullText
}
