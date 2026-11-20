import {
  isValidDateString,
  isValidTimeString,
  type PlanSelection,
} from './date'
import { isPlanId } from './plans'

export interface SharedState {
  isReply: boolean
  from: string
  to: string
  selection: PlanSelection | null
}

function cleanName(value: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
}

function readSelection(params: URLSearchParams): PlanSelection | null {
  const date = params.get('date')
  const time = params.get('time')
  const plan = params.get('plan')

  if (!isValidDateString(date) || !isValidTimeString(time) || !isPlanId(plan)) {
    return null
  }

  return { date, time, plan }
}

export function readSharedState(
  search = typeof window === 'undefined' ? '' : window.location.search,
): SharedState {
  const params = new URLSearchParams(search)
  const isReply =
    params.get('reply') === '1' || params.get('mode') === 'reply'
  const from =
    cleanName(params.get('from')) || (isReply ? 'you' : 'Me')
  const to = cleanName(params.get('to')) || (isReply ? 'Me' : 'you')

  return {
    isReply,
    from,
    to,
    selection: isReply ? readSelection(params) : null,
  }
}

export function getBaseUrl(): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function buildProposalUrl(from: string, to: string): string {
  const url = new URL(getBaseUrl())
  const sender = cleanName(from) || 'Me'
  const recipient = cleanName(to) || 'you'

  url.searchParams.set('from', sender)
  url.searchParams.set('to', recipient)
  return url.toString()
}

export function buildReplyUrl(
  selection: PlanSelection,
  responder: string,
  originalSender: string,
): string {
  const url = new URL(getBaseUrl())
  url.searchParams.set('reply', '1')
  url.searchParams.set('from', cleanName(responder) || 'you')
  url.searchParams.set('to', cleanName(originalSender) || 'Me')
  url.searchParams.set('date', selection.date)
  url.searchParams.set('time', selection.time)
  url.searchParams.set('plan', selection.plan)
  return url.toString()
}
