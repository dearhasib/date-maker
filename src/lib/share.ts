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
  whatsapp: string
  email: string
  notificationKey: string
  selection: PlanSelection | null
}

export interface ProposalLinkOptions {
  from: string
  to: string
  whatsapp?: string
  email?: string
  notificationKey?: string
}

function cleanName(value: string | null): string {
  const normalized = (value ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Slice by Unicode code point rather than UTF-16 unit so an emoji in a name
  // is never cut in half. Drop dangling joiners left by a truncated sequence.
  return Array.from(normalized)
    .slice(0, 40)
    .join('')
    .replace(/[\u200D\uFE0F]+$/u, '')
}

/**
 * WhatsApp links require the full international number without punctuation.
 * Keep whatever the user typed in the composer, but only put a valid number
 * into the invite URL.
 */
export function cleanWhatsAppNumber(
  value: string | null | undefined,
): string {
  const digits = (value ?? '').replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? digits : ''
}

/** Web3Forms access keys are short, URL-safe identifiers. */
export function cleanNotificationKey(
  value: string | null | undefined,
): string {
  const key = (value ?? '').trim()
  return /^[A-Za-z0-9_-]{8,100}$/.test(key) ? key : ''
}

/** Keep only a syntactically valid address that is safe to put in a URL. */
export function cleanEmailAddress(
  value: string | null | undefined,
): string {
  const email = (value ?? '').trim()
  if (
    email.length === 0 ||
    email.length > 254 ||
    /[\u0000-\u001F\u007F]/.test(email)
  ) {
    return ''
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : ''
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
    whatsapp: cleanWhatsAppNumber(params.get('wa')),
    email: cleanEmailAddress(params.get('email')),
    notificationKey: cleanNotificationKey(params.get('wf')),
    selection: isReply ? readSelection(params) : null,
  }
}

export function getBaseUrl(): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function isLocalPreview(): boolean {
  if (typeof window === 'undefined') return false
  if (window.location.protocol === 'file:') return true

  return ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(
    window.location.hostname,
  )
}

export function buildProposalUrl({
  from,
  to,
  whatsapp,
  email,
  notificationKey,
}: ProposalLinkOptions): string {
  const url = new URL(getBaseUrl())
  const sender = cleanName(from) || 'Me'
  const recipient = cleanName(to) || 'you'
  const phone = cleanWhatsAppNumber(whatsapp)
  const address = cleanEmailAddress(email)
  const key = cleanNotificationKey(notificationKey)

  url.searchParams.set('from', sender)
  url.searchParams.set('to', recipient)
  if (phone) url.searchParams.set('wa', phone)
  if (address) url.searchParams.set('email', address)
  if (key) url.searchParams.set('wf', key)
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
