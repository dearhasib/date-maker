import {
  buildCalendarFile,
  formatDateLongWithYear,
  formatTime12h,
  type PlanSelection,
} from './date'
import { getPlan } from './plans'
import { cleanEmailAddress } from './share'

export interface EmailResponseInput {
  senderName: string
  recipientName: string
  selection: PlanSelection
  replyUrl: string
}

export function buildEmailSubject(input: EmailResponseInput): string {
  const acceptedBy =
    input.recipientName === 'you' ? 'Someone' : input.recipientName
  return `💌 Date Confirmed! ${acceptedBy} accepted your invite`
}

export function buildEmailCalendar(input: EmailResponseInput): string {
  return buildCalendarFile(
    input.selection,
    input.recipientName === 'you' ? 'your person' : input.recipientName,
  )
}

export function buildEmailMessage(
  input: EmailResponseInput,
  calendar = buildEmailCalendar(input),
): string {
  const plan = getPlan(input.selection.plan)
  const dateLabel = formatDateLongWithYear(input.selection.date)
  const timeLabel = formatTime12h(input.selection.time)

  return [
    'A date has been sealed! 💌',
    '',
    `Accepted by (to): ${input.recipientName}`,
    `Invitation from (from): ${input.senderName}`,
    `Day: ${dateLabel}`,
    `Time: ${timeLabel}`,
    `Plan: ${plan.emoji} ${plan.label}`,
    `Confirmed view: ${input.replyUrl}`,
    '',
    'Calendar (.ics):',
    calendar,
  ].join('\n')
}

export function buildMailtoUrl(
  emailAddress: string | null | undefined,
  input: EmailResponseInput,
): string {
  const address = cleanEmailAddress(emailAddress)
  if (!address) return ''

  const subject = buildEmailSubject(input)
  const body = buildEmailMessage(input)
  const safeAddress = encodeURIComponent(address).replace(/%40/gi, '@')
  return `mailto:${safeAddress}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
}
