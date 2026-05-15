'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

type RunPhase = 'running' | 'break' | 'paused' | 'done'

interface RunConfig {
  pomodoroLength: number
  plannedDurationMin: number
}

interface CompletionData {
  pomodorosCompleted: number
  actualDurationSec: number
  xpAwarded: number
}

const BREAK_DURATION_SEC = 5 * 60

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${pad(m)}:${pad(s)}`
}

function CircularProgress({
  elapsed,
  total,
  label,
}: {
  elapsed: number
  total: number
  label: string
}) {
  const radius = 110
  const stroke = 4
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = Math.min(1, elapsed / total)
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="var(--color-paper-3)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--color-accent)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

export default function ActiveMarathonPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('marathon')
  const runId = params.runId as string

  const [config, setConfig] = useState<RunConfig | null>(null)
  const [phase, setPhase] = useState<RunPhase>('running')
  const [pomodoroElapsed, setPomodoroElapsed] = useState(0)
  const [breakElapsed, setBreakElapsed] = useState(0)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [completion, setCompletion] = useState<CompletionData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pomodoroLengthSec = (config?.pomodoroLength ?? 25) * 60
  const plannedPomodoros = config
    ? Math.floor(config.plannedDurationMin / config.pomodoroLength)
    : 0

  // Load run config from query params (stored in sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem(`marathon-run-${runId}`)
    if (stored) {
      setConfig(JSON.parse(stored) as RunConfig)
    } else {
      // Fallback defaults
      setConfig({ pomodoroLength: 25, plannedDurationMin: 60 })
    }
  }, [runId])

  const endMarathon = useCallback(
    async (completed: number, durationSec: number) => {
      if (isSubmitting) return
      setIsSubmitting(true)
      try {
        const result = await api.post<{ data: { xpAwarded: number } }>(`/marathon/${runId}/end`, {
          actualDurationSec: durationSec,
          pomodorosCompleted: completed,
          topicsCovered: [],
        })
        setCompletion({
          pomodorosCompleted: completed,
          actualDurationSec: durationSec,
          xpAwarded: result.data.xpAwarded,
        })
        setPhase('done')
      } catch {
        setPhase('done')
        setCompletion({
          pomodorosCompleted: completed,
          actualDurationSec: durationSec,
          xpAwarded: 0,
        })
      }
    },
    [runId, isSubmitting],
  )

  // Timer tick
  useEffect(() => {
    if (!config || phase === 'paused' || phase === 'done') return

    intervalRef.current = setInterval(() => {
      if (phase === 'running') {
        setPomodoroElapsed((prev) => {
          const next = prev + 1
          if (next >= pomodoroLengthSec) {
            const nextCompleted = pomodorosCompleted + 1
            setPomodorosCompleted(nextCompleted)
            if (nextCompleted >= plannedPomodoros) {
              // All pomodoros done
              setTotalElapsed((t) => {
                void endMarathon(nextCompleted, t + 1)
                return t + 1
              })
              return 0
            }
            setPhase('break')
            setBreakElapsed(0)
            return 0
          }
          return next
        })
        setTotalElapsed((prev) => prev + 1)
      } else if (phase === 'break') {
        setBreakElapsed((prev) => {
          const next = prev + 1
          if (next >= BREAK_DURATION_SEC) {
            setPhase('running')
            return 0
          }
          return next
        })
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase, config, pomodoroLengthSec, pomodorosCompleted, plannedPomodoros, endMarathon])

  async function handlePause() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('paused')
    try {
      await api.post(`/marathon/${runId}/pause`)
    } catch {
      // ignore
    }
  }

  async function handleResume() {
    try {
      await api.post(`/marathon/${runId}/resume`)
    } catch {
      // ignore
    }
    setPhase('running')
  }

  async function handleEnd() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    await endMarathon(pomodorosCompleted, totalElapsed)
  }

  if (phase === 'done' && completion) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 32,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          {t('great')}
        </h1>
        <div style={{ display: 'flex', gap: 48 }}>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Pomodoros
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 40,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {completion.pomodorosCompleted}
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              Minutes
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 40,
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {Math.round(completion.actualDurationSec / 60)}
            </p>
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              XP Earned
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 40,
                fontWeight: 500,
                color: 'var(--color-accent)',
              }}
            >
              {completion.xpAwarded}
            </p>
          </div>
        </div>
        <Button variant="accent" size="lg" onClick={() => router.push('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    )
  }

  if (phase === 'break') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 24,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          Take a breath. 5-minute break.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            fontWeight: 500,
            color: 'var(--color-ink-2)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTime(breakElapsed)}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink-3)' }}>
          Pomodoro {pomodorosCompleted} of {plannedPomodoros} complete
        </p>
        <Button variant="ghost" onClick={handleEnd} style={{ color: 'var(--color-ink-3)' }}>
          End session early
        </Button>
      </div>
    )
  }

  if (phase === 'paused') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 24,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Paused
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          {formatTime(pomodoroElapsed)}
        </h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="accent" onClick={handleResume}>
            {t('resume')}
          </Button>
          <Button variant="ghost" onClick={handleEnd}>
            End session
          </Button>
        </div>
      </div>
    )
  }

  // Running state
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 32,
        padding: 32,
      }}
    >
      <CircularProgress
        elapsed={pomodoroElapsed}
        total={pomodoroLengthSec}
        label={formatTime(pomodoroLengthSec - pomodoroElapsed)}
      />
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Pomodoro {pomodorosCompleted + 1} of {plannedPomodoros}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={handlePause}>
          {t('pause')}
        </Button>
        <Button variant="ghost" onClick={handleEnd} style={{ color: 'var(--color-ink-3)' }}>
          End session
        </Button>
      </div>
    </div>
  )
}
