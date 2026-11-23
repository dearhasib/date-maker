import {
  formatDateLongWithYear,
  formatTime12h,
  type PlanSelection,
} from './date'
import { getPlan } from './plans'
import { cleanWhatsAppNumber } from './share'

interface WhatsAppReplyInput {
  number: string
  senderName: string
  recipientName: string
  selection: PlanSelection
  replyUrl: string
}

export function buildWhatsAppReplyUrl({
  number,
  senderName,
  recipientName,
  selection,
  replyUrl,
}: WhatsAppReplyInput): string {
  const phone = cleanWhatsAppNumber(number)
  if (!phone) return ''

  const plan = getPlan(selection.plan)
  const dateLabel = formatDateLongWithYear(selection.date)
  const timeLabel = formatTime12h(selection.time)
  const greeting = senderName === 'Me' ? 'Hey!' : `Hey ${senderName}!`
  const acceptedBy = recipientName === 'you' ? 'I' : recipientName

  const message = [
    `${greeting} It's a date! 💌`,
    '',
    `${acceptedBy} said yes.`,
    `📅 ${dateLabel}`,
    `⏰ ${timeLabel}`,
    `${plan.emoji} ${plan.label}`,
    '',
    `Confirmed details: ${replyUrl}`,
  ].join('\n')

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function openWhatsAppReply(url: string): boolean {
  if (!url) return false

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  return true
}
