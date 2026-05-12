'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, getAccessToken } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { API_URL } from '@/lib/constants'

interface ChatThread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface ThreadDetail {
  id: string
  title: string
  messages: ChatMessage[]
}

const SUGGESTED_PROMPTS = [
  'Explain how to solve simultaneous equations',
  'What is the cell cycle and why is it important?',
  'Summarize the causes of the Nigerian Civil War',
  'How do I calculate compound interest?',
]

function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: ChatThread
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: active ? 'var(--color-accent-tint)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-paper-3)'
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? 'var(--color-accent)' : 'var(--color-ink-2)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {thread.title}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-ink-3)',
          marginTop: 2,
        }}
      >
        {new Date(thread.updatedAt).toLocaleDateString()}
      </p>
    </button>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: isUser ? '12px 16px' : '0',
          backgroundColor: isUser ? 'var(--color-accent-tint)' : 'transparent',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        ) : (
          <div className="prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
      <div
        style={{
          maxWidth: '70%',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
        }}
      >
        <div className="prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: 14,
            backgroundColor: 'var(--color-accent)',
            animation: 'blink 0.8s step-end infinite',
            marginLeft: 2,
            verticalAlign: 'middle',
          }}
        />
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const queryClient = useQueryClient()
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: () =>
      api
        .get<{ data: { threads: ChatThread[] } }>('/assistant/threads')
        .then((r) => r.data.threads),
  })

  const { data: threadDetail, isLoading: threadLoading } = useQuery({
    queryKey: ['chat-thread', activeThreadId],
    queryFn: () =>
      api
        .get<{ data: ThreadDetail }>(`/assistant/threads/${activeThreadId}`)
        .then((r) => r.data),
    enabled: !!activeThreadId,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadDetail?.messages, streamingText])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  async function handleNewThread() {
    const result = await api.post<{ data: { id: string; title: string } }>('/assistant/threads')
    await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
    setActiveThreadId(result.data.id)
  }

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      let threadId = activeThreadId

      // Create thread if none selected
      if (!threadId) {
        const result = await api.post<{ data: { id: string } }>('/assistant/threads')
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
        threadId = result.data.id
        setActiveThreadId(threadId)
      }

      setInputValue('')
      setIsStreaming(true)
      setStreamingText('')

      try {
        const token = getAccessToken()
        const response = await fetch(`${API_URL}/api/assistant/threads/${threadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ content }),
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullText = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]') && !line.includes('[ERROR]')) {
                fullText += line.slice(6)
                setStreamingText(fullText)
              }
            }
          }
        }
      } finally {
        setIsStreaming(false)
        setStreamingText('')
        await queryClient.invalidateQueries({ queryKey: ['chat-thread', threadId] })
        await queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
      }
    },
    [activeThreadId, isStreaming, queryClient],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend(inputValue)
    }
  }

  const messages = threadDetail?.messages ?? []
  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 80px)',
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {/* Thread list — desktop only */}
      <div
        className="hidden lg:flex flex-col"
        style={{
          width: 280,
          minWidth: 280,
          borderRight: '1px solid var(--color-rule)',
          padding: '16px 8px',
          overflowY: 'auto',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNewThread}
          style={{ marginBottom: 12, width: '100%', justifyContent: 'flex-start', gap: 8 }}
        >
          <Plus size={14} strokeWidth={1.5} />
          New conversation
        </Button>

        {threadsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !threadsData || threadsData.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-ink-3)',
              padding: '8px 14px',
            }}
          >
            No conversations yet.
          </p>
        ) : (
          threadsData.map((thread) => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              active={activeThreadId === thread.id}
              onClick={() => setActiveThreadId(thread.id)}
            />
          ))
        )}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Thread title */}
        {threadDetail && (
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--color-rule)',
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {threadDetail.title}
            </p>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
          {isEmpty && !activeThreadId ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 24,
                paddingBottom: 48,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  textAlign: 'center',
                }}
              >
                What do you want to learn?
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void handleSend(prompt)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-rule-2)',
                      backgroundColor: 'var(--color-paper)',
                      color: 'var(--color-ink-2)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : threadLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-3/4" />
              ))}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isStreaming && streamingText && <StreamingBubble text={streamingText} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-rule)',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything from your syllabus..."
            rows={1}
            disabled={isStreaming}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid var(--color-rule-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-ink)',
              backgroundColor: 'var(--color-paper)',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: 120,
              overflow: 'auto',
            }}
          />
          <Button
            variant="accent"
            size="sm"
            onClick={() => void handleSend(inputValue)}
            disabled={!inputValue.trim() || isStreaming}
            style={{ flexShrink: 0, padding: '10px 14px' }}
          >
            <Send size={15} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .prose-sm p { margin: 0 0 8px 0; }
        .prose-sm p:last-child { margin-bottom: 0; }
        .prose-sm ul, .prose-sm ol { margin: 0 0 8px 1.2em; }
        .prose-sm code { background: var(--color-paper-3); padding: 1px 4px; border-radius: 3px; font-size: 12px; }
        .prose-sm pre { background: var(--color-paper-3); padding: 12px; border-radius: 6px; overflow-x: auto; }
      `}</style>
    </div>
  )
}
