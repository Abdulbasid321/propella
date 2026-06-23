import type { Metadata } from 'next'
import { Link } from '@/lib/i18n/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Pricing — Propella',
  description:
    'Free until you decide it\'s worth paying for. No card required to start.',
}

interface PlanFeature {
  text: string
  included: boolean
}

const freeFeatures: PlanFeature[] = [
  { text: 'Full access to the official syllabi', included: true },
  { text: 'Personalised study roadmap', included: true },
  { text: 'Up to 3 active subjects', included: true },
  { text: '20 AI assistant messages per day', included: true },
  { text: 'Basic progress tracking', included: true },
  { text: 'Unlimited subjects', included: false },
  { text: 'Full mock exam library', included: false },
  { text: 'Marathon mode', included: false },
  { text: 'Detailed mastery analytics', included: false },
]

const proFeatures: PlanFeature[] = [
  { text: 'Everything in Free', included: true },
  { text: 'Unlimited subjects', included: true },
  { text: 'Unlimited AI assistant messages', included: true },
  { text: 'Full mock exam library with scoring', included: true },
  { text: 'Marathon mode', included: true },
  { text: 'Detailed mastery analytics', included: true },
  { text: 'Priority support', included: true },
]

function PricingCard({
  tier,
  price,
  cadence,
  note,
  features,
  cta,
  href,
  highlighted,
}: {
  tier: string
  price: string
  cadence?: string
  note: string
  features: PlanFeature[]
  cta: string
  href: string
  highlighted?: boolean
}) {
  return (
    <div
      className={
        highlighted
          ? 'border-2 border-[var(--color-accent)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)] relative'
          : 'border border-[var(--color-rule)] rounded-[var(--radius-md)] p-8 bg-[var(--color-card)]'
      }
    >
      {highlighted && (
        <Badge variant="accent" className="absolute top-6 right-6">
          Most popular
        </Badge>
      )}

      <div className="mb-6">
        <p
          className={`text-[11px] font-mono font-medium tracking-[0.12em] uppercase mb-3 ${
            highlighted ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]'
          }`}
        >
          {tier}
        </p>
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="text-[40px] leading-none tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {price}
          </span>
          {cadence && (
            <span className="text-[14px] text-[var(--color-ink-3)]">{cadence}</span>
          )}
        </div>
        <p className="text-[14px] text-[var(--color-ink-3)]">{note}</p>
      </div>

      <Separator className="mb-6" />

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            <Check
              size={14}
              strokeWidth={1.5}
              className={
                feature.included
                  ? highlighted
                    ? 'text-[var(--color-accent)] mt-0.5 shrink-0'
                    : 'text-[var(--color-ink-3)] mt-0.5 shrink-0'
                  : 'text-[var(--color-rule-2)] mt-0.5 shrink-0'
              }
            />
            <span
              className={`text-[14px] ${
                feature.included ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)] line-through'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? 'accent' : 'secondary'}
        size="lg"
        className="w-full"
        asChild
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}

export default function PricingPage() {
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Page header */}
      <div className="py-20 border-b border-[var(--color-rule)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-5">
            Pricing
          </p>
          <h1
            className="text-[var(--color-ink)] leading-[1.0] tracking-[-0.02em] mb-5"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 500,
            }}
          >
            Free until you decide<br />it&apos;s worth paying for.
          </h1>
          <p className="text-[17px] leading-[1.6] text-[var(--color-ink-2)] max-w-[520px]">
            Start with everything you need to build a study habit. Upgrade when you want the full
            toolkit — and only then.
          </p>
        </div>
      </div>

      {/* Plans */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[840px]">
            <PricingCard
              tier="Free"
              price="₦0"
              note="Forever free, no card required."
              features={freeFeatures}
              cta="Start for free"
              href="/signup"
            />
            <PricingCard
              tier="Pro"
              price="₦2,500"
              cadence="/month"
              note="Or ₦18,000/year — two months free."
              features={proFeatures}
              cta="Start studying"
              href="/signup"
              highlighted
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <p className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-12">
            Common questions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-[840px]">
            {[
              {
                q: 'Do I need a card to start?',
                a: 'No. The free plan requires no payment information. You only enter billing details if you choose to upgrade to Pro.',
              },
              {
                q: 'Can I cancel at any time?',
                a: 'Yes. Pro is billed monthly or annually. You can cancel at any time and your access continues until the end of the billing period.',
              },
              {
                q: 'Which exams does Propella cover?',
                a: 'JAMB (UTME), WAEC (SSCE), and NECO (SSCE). All syllabi are sourced directly from the official examination bodies.',
              },
              {
                q: 'What happens if my exam passes?',
                a: 'Your account stays active. You can reset your roadmap for a new exam date, switch to a different exam body, or simply close your account.',
              },
              {
                q: 'Is there a student discount?',
                a: 'The free tier is intentionally generous. If cost is a barrier, reach out to us directly — we offer waivers on a case-by-case basis.',
              },
              {
                q: 'Does the AI assistant help with all subjects?',
                a: 'The AI companion is scoped strictly to the syllabus topics in your roadmap. It will not answer questions outside your selected subjects and exam body.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3
                  className="text-[16px] leading-[1.3] tracking-[-0.01em] text-[var(--color-ink)] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {q}
                </h3>
                <p className="text-[14px] leading-[1.6] text-[var(--color-ink-2)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA strip */}
      <section className="py-20 bg-[var(--color-paper-2)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="max-w-[560px]">
            <h2
              className="text-[var(--color-ink)] leading-[1.05] tracking-[-0.02em] mb-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 500,
              }}
            >
              Three months to exam day. That&apos;s twelve weeks. That&apos;s enough.
            </h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-ink-2)] mb-7">
              The syllabus is already mapped. Your roadmap takes two minutes to set up.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link href="/signup">Build my roadmap</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <footer className="py-10 bg-[var(--color-paper)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p
            className="text-[16px] leading-none tracking-[-0.01em] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Propella
          </p>
          <p className="text-[13px] text-[var(--color-ink-3)]">
            &copy; {year} Propella. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
