import { getPlan, type PlanId } from './plans'

export interface PlanSelection {
  date: string
  time: string
  plan: PlanId
}

export function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function isValidDateString(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day, 12, 0, 0)
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  )
}

export function isValidTimeString(value: string | null): value is string {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return false
  const [hours, minutes] = value.split(':').map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export function parseTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hours, minutes, 0)
}

export function formatDateLong(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(parseDate(date))
}

export function formatDateLongWithYear(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDate(date))
}

export function formatTime12h(time: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parseTime(time))
}

export function formatSelectionSummary(selection: PlanSelection): string {
  return `${formatDateLongWithYear(selection.date)} at ${formatTime12h(
    selection.time,
  )}, for ${getPlan(selection.plan).phrase}.`
}

export function toICSDate(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hours, minutes] = time.split(':')
  return `${year}${month}${day}T${hours}${minutes}00`
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildCalendarFile(
  selection: PlanSelection,
  withName: string,
): string {
  const plan = getPlan(selection.plan)
  const start = toICSDate(selection.date, selection.time)
  const [year, month, day] = selection.date.split('-').map(Number)
  const [hours, minutes] = selection.time.split(':').map(Number)
  const endDate = new Date(year, month - 1, day, hours, minutes + 120, 0)
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(
    endDate.getDate(),
  )}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A Tiny Ask//Date Planner//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@a-tiny-ask`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(`Date with ${withName}`)}`,
    `DESCRIPTION:${escapeICS(
      `${plan.emoji} ${plan.label}. Sealed with a little courage.`,
    )}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadCalendarFile(
  selection: PlanSelection,
  withName: string,
): void {
  const blob = new Blob([buildCalendarFile(selection, withName)], {
    type: 'text/calendar;charset=utf-8',
  })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = 'our-date.ics'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 1000)
}
