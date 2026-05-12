import { format, formatDistanceToNow, differenceInDays, differenceInWeeks } from 'date-fns'

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt)
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysUntil(date: string | Date) {
  return differenceInDays(new Date(date), new Date())
}

export function weeksUntil(date: string | Date) {
  return differenceInWeeks(new Date(date), new Date())
}
