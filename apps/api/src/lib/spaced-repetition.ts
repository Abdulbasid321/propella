export interface SM2Input {
  easeFactor: number  // starts at 2.5
  interval: number    // days, starts at 1
  repetitions: number // starts at 0
  grade: number       // 0-5
}

export interface SM2Result {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
}

export function calculateSM2(input: SM2Input): SM2Result {
  let { easeFactor, interval, repetitions } = input
  const { grade } = input

  if (grade >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return { easeFactor, interval, repetitions, nextReviewDate }
}

export function gradeFromPercentage(pct: number): number {
  if (pct <= 20) return 0
  if (pct <= 40) return 1
  if (pct <= 60) return 2
  if (pct <= 75) return 3
  if (pct <= 90) return 4
  return 5
}
