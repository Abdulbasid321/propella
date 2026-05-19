import { Link } from '@/lib/i18n/navigation'
import { Compass, Sparkles, FileText, Timer, Check, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StickyNav } from '@/components/marketing/sticky-nav'

// ─── Hero topic card ─────────────────────────────────────────────────────────

function HeroTopicCard() {
  return (
    <div
      className="bg-[var(--color-card)] border border-[var(--color-rule)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-md)] max-w-[340px] w-full"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* accent left bar */}
      <div className="flex">
        <div className="w-[3px] bg-[var(--color-accent)] shrink-0" />
        <div className="flex-1 p-5">
          <div className="mb-3">
            <h3
              className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quadratic Equations
            </h3>
            <p className="text-[12px] text-[var(--color-ink-3)] font-mono">
              Mathematics · Topic 8 of 15
            </p>
          </div>

          {/* mastery bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[var(--color-ink-3)] font-mono uppercase tracking-[0.06em]">
                Mastery
              </span>
              <span className="text-[11px] text-[var(--color-ink-2)] font-mono">67%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-paper-3)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full"
                style={{ width: '67%' }}
              />
            </div>
          </div>

          {/* next revision */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} strokeWidth={1.5} className="text-[var(--color-ink-3)]" />
              <span className="text-[12px] text-[var(--color-ink-3)]">Next revision in 2 days</span>
            </div>
            <Badge variant="warning">In progress</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <StickyNav />

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            {/* Left col */}
            <div className="lg:col-span-7">
              {/* eyebrow */}
              <p
                className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-accent)] mb-6"
              >
                Propella — for JAMB, WAEC &amp; NECO candidates
              </p>

              {/* headline */}
              <h1
                className="text-[var(--color-ink)] mb-6 leading-[0.95] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: 500,
                }}
              >
                The structured way<br />
                to prepare for the<br />
                exam that matters.
              </h1>

              {/* subhead */}
              <p
                className="text-[17px] leading-[1.6] text-[var(--color-ink-2)] mb-8"
                style={{ maxWidth: '520px' }}
              >
                Propella builds a personalized study path from the official syllabus, schedules the
                revision your brain actually needs, and turns every spare hour into measurable
                progress. Built for serious candidates.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button variant="accent" size="lg" asChild>
                  <Link href="/signup">Start studying — it&apos;s free</Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              {/* caption */}
              <p className="text-[13px] text-[var(--color-ink-3)]">
                No card required. 2,400+ topics across the JAMB, WAEC, and NECO syllabi.
              </p>
            </div>

            {/* Right col — topic card */}
            <div className="hidden lg:flex lg:col-span-5 lg:justify-center lg:items-center mt-12 lg:mt-0">
              <HeroTopicCard />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 2. The repetition problem ───────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            {/* Left — headline */}
            <div>
              <h2
                className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                }}
              >
                The problem isn&apos;t that you didn&apos;t study. It&apos;s that you didn&apos;t
                study it enough times.
              </h2>
            </div>

            {/* Right — body copy */}
            <div className="mt-8 lg:mt-0 space-y-5">
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Most candidates read a topic once — maybe twice — and move on. By exam day, the
                early material has faded. The connections between topics never form. The confidence
                was never real.
              </p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                The research is unambiguous: retention requires spaced repetition. Seeing a concept
                once, then again two days later, then five days after that — this is how memory
                becomes reliable. This is how you walk into an exam hall and actually know the
                material.
              </p>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Propella automates this. Every topic you study gets scheduled for review at exactly
                the right moment — before you forget it. Not too soon, not too late. The system
                adapts to your performance so stronger topics review less often and weaker ones get
                the attention they deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 3. How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* section label */}
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-12">
            How it works
          </p>

          <div className="lg:grid lg:grid-cols-3 lg:divide-x lg:divide-[var(--color-rule)]">
            {/* Step 01 */}
            <div className="pb-12 lg:pb-0 lg:pr-10">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                01
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Tell us your exam and subjects
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Select your exam (JAMB, WAEC, or NECO), your target subjects, your exam date, and
                how many hours a day you can study. Propella builds a roadmap from the official
                syllabus — not from someone&apos;s guess at what might come up.
              </p>
            </div>

            {/* Step 02 */}
            <div className="py-12 lg:py-0 lg:px-10 border-t border-[var(--color-rule)] lg:border-t-0">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                02
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Study and get tested
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                Each session delivers concise topic notes, practice questions drawn from past papers,
                and instant feedback. The AI study companion answers questions about specific topics
                — within the scope of your syllabus. No distractions, no rabbit holes.
              </p>
            </div>

            {/* Step 03 */}
            <div className="pt-12 lg:pt-0 lg:pl-10 border-t border-[var(--color-rule)] lg:border-t-0">
              <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
                03
              </p>
              <h3
                className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The system schedules your reviews
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                After every session, the algorithm calculates when each topic needs revisiting.
                Topics you struggled with come back sooner. Topics you mastered rest longer. Over
                time, your entire syllabus shifts from &ldquo;seen once&rdquo; to &ldquo;properly
                memorised.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 4. Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-12">
            What&apos;s included
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-[var(--color-rule)] md:divide-y-0">
            {/* Row 1 */}
            <div className="md:grid md:grid-cols-2 md:col-span-2 md:divide-x divide-[var(--color-rule)]">
              {/* Adaptive roadmap */}
              <div className="py-8 md:pr-10">
                <Compass
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--color-accent)] mb-4"
                />
                <h3
                  className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Adaptive roadmap
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                  Your roadmap rebuilds itself after every quiz and every missed session.
                  The plan you started with is a starting point, not a contract.
                </p>
              </div>

              {/* AI study companion */}
              <div className="py-8 md:pl-10">
                <Sparkles
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--color-accent)] mb-4"
                />
                <h3
                  className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  AI study companion
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                  Ask anything in your syllabus and get an explanation written for the
                  Nigerian curriculum, not a generic answer. Concepts, worked examples,
                  and practice questions in one reply.
                </p>
              </div>
            </div>

            {/* Separator between rows — desktop */}
            <div className="hidden md:block md:col-span-2">
              <Separator />
            </div>

            {/* Row 2 */}
            <div className="md:grid md:grid-cols-2 md:col-span-2 md:divide-x divide-[var(--color-rule)]">
              {/* Mock exams */}
              <div className="py-8 md:pr-10">
                <FileText
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--color-accent)] mb-4"
                />
                <h3
                  className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Mock exams from real syllabi
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                  Take full-length mocks structured like the actual paper, generated from
                  your specific subject combination. Get a marked breakdown, not just a
                  score.
                </p>
              </div>

              {/* Marathon mode */}
              <div className="py-8 md:pl-10">
                <Timer
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--color-accent)] mb-4"
                />
                <h3
                  className="text-[18px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Marathon mode
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--color-ink-2)]">
                  Lock in for a 30, 60, or 120-minute focused run with built-in breaks.
                  Earn double XP. Use the long stretch you actually have on a Saturday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 5. Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* heading */}
          <div className="mb-12">
            <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-4">
              Pricing
            </p>
            <h2
              className="text-[var(--color-ink)] leading-[1.1] tracking-[-0.02em]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 500,
              }}
            >
              Free until you decide it&apos;s worth paying for.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[840px]">
            {/* Free plan */}
            <div className="border border-[var(--color-rule)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)]">
              <div className="mb-6">
                <p
                  className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-3"
                >
                  Free
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-[40px] leading-none tracking-[-0.02em] text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ₦0
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-ink-3)]">Forever free, no card required.</p>
              </div>

              <Separator className="mb-6" />

              <ul className="space-y-3 mb-8">
                {[
                  'Full roadmap for one exam',
                  'Up to 20 AI assistant messages per day',
                  '5 quizzes per day, unlimited mocks per month',
                  '1 streak freeze per month',
                  'All core features',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--color-ink-3)] mt-0.5 shrink-0"
                    />
                    <span className="text-[14px] text-[var(--color-ink-2)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </div>

            {/* Scholar plan */}
            <div className="border border-[var(--color-rule)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)]">
              <div className="mb-6">
                <p
                  className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-3"
                >
                  Scholar
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-[40px] leading-none tracking-[-0.02em] text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ₦2,500
                  </span>
                  <span className="text-[14px] text-[var(--color-ink-3)]">/month</span>
                </div>
                <p className="text-[14px] text-[var(--color-ink-3)]">
                  ₦18,000/year (40% off)
                </p>
              </div>

              <Separator className="mb-6" />

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Unlimited AI assistant',
                  'Unlimited quizzes',
                  'Advanced analytics & weakness breakdown',
                  '4 streak freezes per month',
                  'Marathon mode with 50-min pomodoros',
                  'Priority access to new features',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--color-accent)] mt-0.5 shrink-0"
                    />
                    <span className="text-[14px] text-[var(--color-ink-2)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="accent" size="lg" className="w-full" asChild>
                <Link href="/signup">Start free, upgrade anytime</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 6. Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="max-w-[640px]">
            <h2
              className="text-[var(--color-ink)] leading-[1.05] tracking-[-0.02em] mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 500,
              }}
            >
              Three months to exam day. That&apos;s twelve weeks. That&apos;s enough.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[var(--color-ink-2)] mb-8 max-w-[480px]">
              The students who pass aren&apos;t smarter. They started earlier and they came
              back to every topic until it was theirs. Start now.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link href="/signup">Build my roadmap</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-16 bg-[var(--color-paper)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Wordmark */}
            <div className="col-span-2 md:col-span-1">
              <p
                className="text-[20px] leading-none tracking-[-0.02em] text-[var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Propella
              </p>
              <p className="text-[13px] text-[var(--color-ink-3)] leading-[1.6] max-w-[200px]">
                Structured exam preparation for JAMB, WAEC, and NECO candidates.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Product
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Mock exams', href: '/signup' },
                  { label: 'Study roadmap', href: '/signup' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Company
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Contact', href: '/contact' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.1em] uppercase text-[var(--color-ink-3)] mb-4">
                Legal
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Privacy policy', href: '/privacy' },
                  { label: 'Terms of use', href: '/terms' },
                  { label: 'Support', href: 'mailto:support@propella.app' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="mb-6" />

          <p className="text-[13px] text-[var(--color-ink-3)]">
            &copy; {year} Propella. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
