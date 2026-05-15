'use client'
import { useState, use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Clock, Calendar, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '@/lib/api-client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { RoadmapNode } from '@propella/shared'

function getSubjectColor(slug: string): string {
  const map: Record<string, string> = {
    english: 'var(--color-subj-english)',
    mathematics: 'var(--color-subj-math)',
    physics: 'var(--color-subj-physics)',
    chemistry: 'var(--color-subj-chemistry)',
    biology: 'var(--color-subj-biology)',
    economics: 'var(--color-subj-economics)',
    government: 'var(--color-subj-government)',
    literature: 'var(--color-subj-literature)',
  }
  return map[slug] ?? 'var(--color-subj-default)'
}

function statusBadgeVariant(status: string) {
  if (status === 'completed') return 'success' as const
  if (status === 'in-progress') return 'accent' as const
  if (status === 'needs-revision') return 'warning' as const
  return 'default' as const
}

function statusLabel(status: string) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'needs-revision') return 'Needs Revision'
  if (status === 'completed') return 'Completed'
  if (status === 'ready') return 'Ready'
  return 'Locked'
}

type Tab = 'overview' | 'study' | 'practice' | 'notes'

interface TopicDetailData extends RoadmapNode {
  description?: string
  keyConcepts?: string[]
}

interface PageProps {
  params: Promise<{ subjectSlug: string; topicSlug: string }>
}

export default function TopicDetailPage({ params }: PageProps) {
  const { subjectSlug, topicSlug } = use(params)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  const { data: node, isLoading } = useQuery<TopicDetailData>({
    queryKey: ['roadmap-node', subjectSlug, topicSlug],
    queryFn: () =>
      api
        .get<{ data: TopicDetailData }>(`/roadmap/${subjectSlug}/${topicSlug}`)
        .then((r) => r.data),
  })

  const subjectColor = getSubjectColor(subjectSlug)

  function handleSaveNotes() {
    // Fire and forget
    api.post(`/roadmap/${subjectSlug}/${topicSlug}/notes`, { notes }).catch(() => undefined)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'study', label: 'Study' },
    { key: 'practice', label: 'Practice' },
    { key: 'notes', label: 'Notes' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        <Link
          href="/roadmap"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-ink-3)',
            textDecoration: 'none',
          }}
          className="hover:text-[var(--color-ink)]"
        >
          Roadmap
        </Link>
        <ChevronRight size={13} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)', textTransform: 'capitalize' }}>
          {subjectSlug.replace(/-/g, ' ')}
        </span>
        <ChevronRight size={13} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-2)' }}>
          {isLoading ? '...' : (node?.topicName ?? topicSlug.replace(/-/g, ' '))}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content */}
        <div className="lg:col-span-8">
          {/* Subject overline */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: subjectColor,
              marginBottom: 8,
            }}
          >
            {subjectSlug.replace(/-/g, ' ')}
          </p>

          {/* Topic title */}
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-64 mb-4" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </>
          ) : node ? (
            <>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 36,
                  color: 'var(--color-ink)',
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                {node.topicName}
              </h1>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)' }}>
                    {node.estimatedMinutes} min
                  </span>
                </div>
                {node.plannedStartDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)' }}>
                      {format(new Date(node.plannedStartDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <Badge variant={statusBadgeVariant(node.status)}>{statusLabel(node.status)}</Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-3)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-ink-3)' }}>
                    {node.mastery}% mastery
                  </span>
                </div>
              </div>
            </>
          ) : null}

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-rule)',
              marginBottom: 24,
              gap: 0,
            }}
          >
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: activeTab === key ? '2px solid var(--color-accent)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: activeTab === key ? 600 : 400,
                  fontSize: 14,
                  color: activeTab === key ? 'var(--color-ink)' : 'var(--color-ink-3)',
                  marginBottom: -1,
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : node ? (
            <>
              {activeTab === 'overview' && (
                <div>
                  {node.description ? (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 15,
                        color: 'var(--color-ink-2)',
                        lineHeight: 1.7,
                        marginBottom: 24,
                      }}
                    >
                      {node.description}
                    </p>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)', marginBottom: 24 }}>
                      No description available for this topic.
                    </p>
                  )}

                  {node.keyConcepts && node.keyConcepts.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 600,
                          fontSize: 15,
                          color: 'var(--color-ink)',
                          marginBottom: 12,
                        }}
                      >
                        Key concepts
                      </h3>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none' }}>
                        {node.keyConcepts.map((concept, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              fontFamily: 'var(--font-sans)',
                              fontSize: 14,
                              color: 'var(--color-ink-2)',
                            }}
                          >
                            <span
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-paper-3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 600,
                                color: 'var(--color-ink-3)',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              {i + 1}
                            </span>
                            {concept}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'study' && (
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--color-ink-3)',
                      marginBottom: 20,
                    }}
                  >
                    Start a focused study session for this topic. Sessions use the Pomodoro technique and track your mastery.
                  </p>
                  <Button variant="accent" size="lg" asChild>
                    <Link href={`/study/new?subject=${node.subjectSlug}&topic=${node.topicSlug}`}>
                      Start study session
                    </Link>
                  </Button>
                </div>
              )}

              {activeTab === 'practice' && (
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--color-ink-3)',
                      marginBottom: 20,
                    }}
                  >
                    Test your knowledge with a practice quiz on this topic.
                  </p>
                  <Button variant="accent" size="lg" asChild>
                    <Link href={`/quizzes/new?subject=${node.subjectSlug}&topic=${node.topicSlug}`}>
                      Start a quiz
                    </Link>
                  </Button>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); setNotesSaved(false) }}
                    placeholder="Write your notes here (markdown supported)..."
                    style={{
                      width: '100%',
                      minHeight: 240,
                      padding: 16,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--color-ink)',
                      backgroundColor: 'var(--color-paper-2)',
                      border: '1px solid var(--color-rule)',
                      borderRadius: 'var(--radius-md)',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    <Button variant="accent" size="sm" onClick={handleSaveNotes}>
                      Save notes
                    </Button>
                    {notesSaved && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-success)' }}>
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Right rail: revision schedule (lg only) */}
        <div className="hidden lg:block lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15 }}>
                Revision schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : node ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      Revisions done
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, color: 'var(--color-ink)' }}>
                      {node.revisionsCompleted} / {node.revisionsScheduled}
                    </p>
                  </div>

                  {node.nextRevisionAt && (
                    <div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Next revision
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)' }}>
                        {format(new Date(node.nextRevisionAt), 'EEEE, MMM d')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      Mastery
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          backgroundColor: 'var(--color-paper-3)',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${node.mastery}%`,
                            backgroundColor: 'var(--color-accent)',
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-3)', flexShrink: 0 }}>
                        {node.mastery}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      SM-2 Interval
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-2)' }}>
                      Every {node.sm2.interval} day{node.sm2.interval !== 1 ? 's' : ''} (ease {node.sm2.easeFactor.toFixed(1)})
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
