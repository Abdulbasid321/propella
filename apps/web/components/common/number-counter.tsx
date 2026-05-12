'use client'
import { useMotionValue, useTransform, animate, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface NumberCounterProps {
  value: number
  className?: string
  duration?: number
  prefix?: string
  suffix?: string
}

export function NumberCounter({
  value,
  className,
  duration = 0.8,
  prefix = '',
  suffix = '',
}: NumberCounterProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))
  const prevValue = useRef(0)

  useEffect(() => {
    motionValue.set(prevValue.current)
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    prevValue.current = value
    return () => controls.stop()
  }, [value, duration, motionValue])

  return (
    <span
      className={cn('font-display tabular-nums', className)}
      style={{ fontFeatureSettings: '"ss01", "tnum"' }}
    >
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
