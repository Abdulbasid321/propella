'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check, AlertTriangle, Info, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/common/logo'
import { NumberCounter } from '@/components/common/number-counter'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { useToast } from '@/components/ui/toast'

// ---- helpers ----

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2
        className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-6 pb-3 border-b border-[var(--color-rule)]"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {label && (
        <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-3 uppercase tracking-[0.06em]">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

interface SwatchProps {
  variable: string
  label: string
  dark?: boolean
}

function Swatch({ variable, label, dark }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1.5 w-[88px]">
      <div
        className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-rule)]"
        style={{ background: `var(${variable})` }}
      />
      <p className="text-[10px] font-mono text-[var(--color-ink-3)] leading-tight truncate">{label}</p>
      {dark && (
        <p className="text-[9px] font-mono text-[var(--color-ink-3)] leading-tight opacity-60 truncate">{variable}</p>
      )}
    </div>
  )
}

function SubjectMarker({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: `var(${color})` }}
      />
      <span className="text-[13px] text-[var(--color-ink-2)]">{label}</span>
    </div>
  )
}

// ---- Main page ----

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [counterValue, setCounterValue] = useState(1234)
  const [inputError, setInputError] = useState(false)

  const surfaceColors = [
    { variable: '--color-paper', label: 'paper' },
    { variable: '--color-paper-2', label: 'paper-2' },
    { variable: '--color-paper-3', label: 'paper-3' },
    { variable: '--color-card', label: 'card' },
  ]

  const inkColors = [
    { variable: '--color-ink', label: 'ink' },
    { variable: '--color-ink-2', label: 'ink-2' },
    { variable: '--color-ink-3', label: 'ink-3' },
  ]

  const ruleColors = [
    { variable: '--color-rule', label: 'rule' },
    { variable: '--color-rule-2', label: 'rule-2' },
  ]

  const accentColors = [
    { variable: '--color-accent', label: 'accent' },
    { variable: '--color-accent-2', label: 'accent-2' },
    { variable: '--color-accent-tint', label: 'accent-tint' },
  ]

  const functionalColors = [
    { variable: '--color-success', label: 'success' },
    { variable: '--color-warning', label: 'warning' },
    { variable: '--color-danger', label: 'danger' },
  ]

  const subjectColors = [
    { variable: '--color-subj-english', label: 'English' },
    { variable: '--color-subj-math', label: 'Math' },
    { variable: '--color-subj-physics', label: 'Physics' },
    { variable: '--color-subj-chemistry', label: 'Chemistry' },
    { variable: '--color-subj-biology', label: 'Biology' },
    { variable: '--color-subj-economics', label: 'Economics' },
    { variable: '--color-subj-government', label: 'Government' },
    { variable: '--color-subj-literature', label: 'Literature' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[12px] font-mono text-[var(--color-ink-3)] uppercase tracking-[0.08em]">
              Design System
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                theme === 'light'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="Light theme"
            >
              <Sun size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                theme === 'system'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="System theme"
            >
              <Monitor size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                theme === 'dark'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="Dark theme"
            >
              <Moon size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-12">
          <h1
            className="text-[40px] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Propella Design System
          </h1>
          <p className="text-[16px] text-[var(--color-ink-2)] max-w-lg leading-relaxed">
            A living reference for all primitive components, color tokens, type scale, and patterns used across the product.
          </p>
        </div>

        {/* ---- Typography ---- */}
        <Section title="Typography">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display 2XL — Fraunces 56px</p>
              <p
                className="text-[56px] leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Propella
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display XL — Fraunces 40px</p>
              <p
                className="text-[40px] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Exam preparation
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display LG — Fraunces 32px</p>
              <p
                className="text-[32px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Build your study path
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Heading — Geist 24px / 600</p>
              <p className="text-[24px] font-semibold leading-[1.3] text-[var(--color-ink)]">
                JAMB, WAEC, NECO preparation
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Subheading — Geist 18px / 500</p>
              <p className="text-[18px] font-medium leading-[1.4] text-[var(--color-ink)]">
                Structured repetition. Real syllabus.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Body — Geist 15px / 400</p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)] max-w-lg">
                A personalized roadmap generated from your exam date, target subjects, and daily study time. Progress is tracked with spaced repetition so every revision hits at the right moment.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Small — Geist 13px</p>
              <p className="text-[13px] leading-[1.5] text-[var(--color-ink-3)]">
                Last active 3 days ago — 42 topics completed
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Overline — Mono 11px uppercase</p>
              <p className="text-[11px] font-mono font-medium tracking-[0.08em] uppercase text-[var(--color-ink-2)]">
                Subject — English Language
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Code / Mono — JetBrains Mono 13px</p>
              <p className="text-[13px] font-mono text-[var(--color-ink-2)] bg-[var(--color-paper-2)] px-3 py-2 rounded-[var(--radius-sm)] inline-block">
                mastery: 0.74 | interval: 4d | ease: 2.5
              </p>
            </div>
          </div>
        </Section>

        {/* ---- Colors ---- */}
        <Section title="Color Tokens">
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Surfaces</p>
              <div className="flex flex-wrap gap-4">
                {surfaceColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Ink</p>
              <div className="flex flex-wrap gap-4">
                {inkColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Rules</p>
              <div className="flex flex-wrap gap-4">
                {ruleColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Accent — Ink Red</p>
              <div className="flex flex-wrap gap-4">
                {accentColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Functional</p>
              <div className="flex flex-wrap gap-4">
                {functionalColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Subject Hues</p>
              <div className="flex flex-wrap gap-4">
                {subjectColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Buttons ---- */}
        <Section title="Buttons">
          <Row label="Default size — all variants">
            <Button variant="default">Default</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link variant</Button>
          </Row>
          <Row label="Sizes — default variant">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="With icons">
            <Button variant="default" size="sm">
              <Check size={13} strokeWidth={1.5} />
              Mark complete
            </Button>
            <Button variant="accent">
              <BookOpen size={14} strokeWidth={1.5} />
              Start session
            </Button>
            <Button variant="secondary">
              <AlertTriangle size={14} strokeWidth={1.5} />
              Report issue
            </Button>
          </Row>
          <Row label="Disabled state">
            <Button variant="default" disabled>Disabled</Button>
            <Button variant="accent" disabled>Disabled accent</Button>
            <Button variant="secondary" disabled>Disabled secondary</Button>
          </Row>
          <Row label="Interactive — fires toast">
            <Button
              variant="accent"
              onClick={() =>
                toast({ title: 'Session started', description: 'English Language — Comprehension', variant: 'success' })
              }
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({ title: 'Session paused', description: 'Progress saved automatically', variant: 'warning' })
              }
            >
              Warning toast
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast({ title: 'Something went wrong', description: 'Please try again in a moment', variant: 'danger' })
              }
            >
              Danger toast
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast({ title: 'Copied to clipboard' })}
            >
              Default toast
            </Button>
          </Row>
        </Section>

        {/* ---- Cards ---- */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  Border only, no shadow. Used for most content containers.
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  Border + subtle shadow. Used for interactive tiles.
                </p>
              </CardContent>
            </Card>
            <Card variant="flush">
              <CardHeader>
                <CardTitle>Flush card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  No border or shadow. Background only. Used inside other cards.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ---- Badges ---- */}
        <Section title="Badges">
          <Row label="All variants">
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </Row>
          <Row label="Contextual examples">
            <Badge variant="success">Completed</Badge>
            <Badge variant="warning">In progress</Badge>
            <Badge variant="accent">Due today</Badge>
            <Badge variant="danger">Overdue</Badge>
            <Badge variant="default">JAMB</Badge>
            <Badge variant="default">WAEC</Badge>
            <Badge variant="default">NECO</Badge>
          </Row>
        </Section>

        {/* ---- Inputs ---- */}
        <Section title="Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <Label htmlFor="default-input">Email address</Label>
              <Input
                id="default-input"
                type="email"
                placeholder="candidate@propella.app"
              />
            </div>
            <div>
              <Label htmlFor="error-input">Username</Label>
              <Input
                id="error-input"
                type="text"
                placeholder="Enter username"
                error={inputError ? 'Username is already taken' : undefined}
                defaultValue={inputError ? 'john_doe' : ''}
              />
              {inputError && (
                <p className="text-[12px] text-[var(--color-danger)] mt-1.5 flex items-center gap-1">
                  <Info size={11} strokeWidth={1.5} />
                  Username is already taken
                </p>
              )}
              <button
                onClick={() => setInputError((v) => !v)}
                className="text-[12px] text-[var(--color-ink-3)] mt-2 hover:text-[var(--color-ink)] transition-colors"
              >
                Toggle error state
              </button>
            </div>
            <div>
              <Label htmlFor="disabled-input">Read only</Label>
              <Input
                id="disabled-input"
                type="text"
                defaultValue="ammar@propella.app"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="password-input">Password</Label>
              <Input
                id="password-input"
                type="password"
                placeholder="Min 8 characters"
              />
            </div>
          </div>
        </Section>

        {/* ---- Skeleton ---- */}
        <Section title="Skeleton / Loading States">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-3 uppercase tracking-[0.06em]">Card skeleton</p>
              <Card>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <div className="pt-2">
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-3 uppercase tracking-[0.06em]">List skeleton</p>
              <LoadingState rows={4} />
            </div>
          </div>
        </Section>

        {/* ---- Number Counter ---- */}
        <Section title="Number Counter">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-baseline gap-8">
              <div className="text-center">
                <NumberCounter
                  value={counterValue}
                  className="text-[48px] leading-none text-[var(--color-ink)]"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">Questions answered</p>
              </div>
              <div className="text-center">
                <NumberCounter
                  value={Math.round(counterValue * 0.74)}
                  className="text-[32px] leading-none text-[var(--color-success)]"
                  suffix="%"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">Accuracy rate</p>
              </div>
              <div className="text-center">
                <NumberCounter
                  value={Math.round(counterValue / 10)}
                  prefix="+"
                  className="text-[32px] leading-none text-[var(--color-accent)]"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">XP earned</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCounterValue((v) => v + Math.floor(Math.random() * 200 + 50))}
              >
                Increment random
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCounterValue(0)}
              >
                Reset to zero
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCounterValue(1234)}
              >
                Reset to 1234
              </Button>
            </div>
          </div>
        </Section>

        {/* ---- Logo ---- */}
        <Section title="Logo">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-2 uppercase tracking-[0.06em]">Default</p>
                <Logo />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-2 uppercase tracking-[0.06em]">Large</p>
                <Logo className="text-[28px]" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-2 uppercase tracking-[0.06em]">XL</p>
                <Logo className="text-[40px]" />
              </div>
            </div>
            <div className="p-6 bg-[var(--color-ink)] rounded-[var(--radius-md)] inline-block">
              <Logo className="text-[var(--color-paper)] text-[20px]" />
            </div>
          </div>
        </Section>

        {/* ---- Subject Markers ---- */}
        <Section title="Subject Color Markers">
          <Card className="max-w-xs">
            <div className="space-y-3">
              {subjectColors.map((c) => (
                <SubjectMarker key={c.variable} color={c.variable} label={c.label} />
              ))}
              <SubjectMarker color="--color-subj-default" label="Other / Default" />
            </div>
          </Card>
        </Section>

        {/* ---- Empty State ---- */}
        <Section title="Empty State">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <EmptyState message="No study sessions recorded yet." />
            </Card>
            <Card>
              <EmptyState
                message="No topics match your current filters."
                action={
                  <Button variant="secondary" size="sm">
                    Clear filters
                  </Button>
                }
              />
            </Card>
          </div>
        </Section>

        {/* ---- Separator ---- */}
        <Section title="Separator">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--color-ink-2)]">Before</span>
              <Separator />
              <span className="text-[13px] text-[var(--color-ink-2)]">After</span>
            </div>
            <Separator />
            <div className="flex gap-4 h-8 items-center">
              <span className="text-[13px] text-[var(--color-ink-2)]">Left</span>
              <Separator orientation="vertical" />
              <span className="text-[13px] text-[var(--color-ink-2)]">Middle</span>
              <Separator orientation="vertical" />
              <span className="text-[13px] text-[var(--color-ink-2)]">Right</span>
            </div>
          </div>
        </Section>

        {/* ---- Shadows ---- */}
        <Section title="Shadows">
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'shadow-sm', shadow: 'var(--shadow-sm)' },
              { label: 'shadow-md', shadow: 'var(--shadow-md)' },
              { label: 'shadow-lg', shadow: 'var(--shadow-lg)' },
            ].map(({ label, shadow }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div
                  className="w-20 h-20 bg-[var(--color-card)] rounded-[var(--radius-md)]"
                  style={{ boxShadow: shadow }}
                />
                <p className="text-[10px] font-mono text-[var(--color-ink-3)] uppercase tracking-[0.06em]">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Border Radii ---- */}
        <Section title="Border Radii">
          <div className="flex flex-wrap gap-6 items-end">
            {[
              { label: 'xs — 4px', radius: 'var(--radius-xs)' },
              { label: 'sm — 6px', radius: 'var(--radius-sm)' },
              { label: 'md — 8px', radius: 'var(--radius-md)' },
              { label: 'lg — 12px', radius: 'var(--radius-lg)' },
              { label: 'full', radius: 'var(--radius-full)' },
            ].map(({ label, radius }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div
                  className="w-16 h-16 bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]"
                  style={{ borderRadius: radius }}
                />
                <p className="text-[9px] font-mono text-[var(--color-ink-3)] uppercase tracking-[0.05em] text-center max-w-[72px]">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        <footer className="border-t border-[var(--color-rule)] pt-8 mt-4 pb-12">
          <p className="text-[12px] font-mono text-[var(--color-ink-3)]">
            Propella Design System — internal reference
          </p>
        </footer>
      </main>
    </div>
  )
}
