import {
  buildCalendarFile,
  formatDateLongWithYear,
  formatTime12h,
  type PlanSelection,
} from './date'
import { getPlan } from './plans'
import { cleanNotificationKey } from './share'

const DISCORD_WEBHOOK_URL = getDiscordWebhookUrl(
  import.meta.env.VITE_DISCORD_WEBHOOK_URL,
)
const WEB3FORMS_ENV_KEY = cleanNotificationKey(
  import.meta.env.VITE_WEB3FORMS_KEY,
)
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const completedNotifications = new Set<string>()
const inFlightNotifications = new Set<string>()

export type NotificationResult = 'sent' | 'skipped' | 'failed'

interface ResponseNotificationInput {
  senderName: string
  recipientName: string
  selection: PlanSelection
  replyUrl: string
  notificationKey?: string
}

function getDiscordWebhookUrl(value: string | undefined): string {
  const candidate = value?.trim()
  if (!candidate) return ''

  try {
    const url = new URL(candidate)
    const allowedHosts = new Set([
      'discord.com',
      'discordapp.com',
      'canary.discord.com',
      'ptb.discord.com',
    ])

    if (
      url.protocol !== 'https:' ||
      !allowedHosts.has(url.hostname) ||
      !url.pathname.startsWith('/api/webhooks/')
    ) {
      return ''
    }

    return url.toString()
  } catch {
    return ''
  }
}

function limit(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function getIcsDetails(calendar: string): { start: string; end: string } {
  return {
    start: calendar.match(/^DTSTART:(.+)$/m)?.[1] ?? '',
    end: calendar.match(/^DTEND:(.+)$/m)?.[1] ?? '',
  }
}

async function postJson(
  url: string,
  payload: unknown,
  timeoutMs = 8000,
): Promise<boolean> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    })
    return response.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

async function postToWeb3Forms(
  accessKey: string,
  payload: {
    subject: string
    message: string
  },
): Promise<boolean> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: payload.subject,
        from_name: 'A Tiny Ask 💌',
        name: 'A Tiny Ask',
        email: 'noreply@example.com',
        message: payload.message,
      }),
      signal: controller.signal,
      keepalive: true,
    })

    if (!response.ok) return false

    const result = (await response.json().catch(() => null)) as {
      success?: boolean
    } | null
    return result ? result.success !== false : true
  } catch {
    return false
  } finally {
    window.clearTimeout(timer)
  }
}

function buildWeb3FormsMessage(
  input: ResponseNotificationInput,
  calendar: string,
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

function buildDiscordPayload(
  input: ResponseNotificationInput,
  calendar: string,
): unknown {
  const plan = getPlan(input.selection.plan)
  const dateLabel = formatDateLongWithYear(input.selection.date)
  const timeLabel = formatTime12h(input.selection.time)
  const ics = getIcsDetails(calendar)

  return {
    username: 'A Tiny Ask',
    embeds: [
      {
        title: limit(`${input.recipientName} said yes! 💌`, 256),
        description: limit(
          `**${input.recipientName}** accepted **${input.senderName}**'s invitation.`,
          4096,
        ),
        color: 0xe85d4a,
        fields: [
          {
            name: 'Accepted by (to)',
            value: limit(input.recipientName || 'you', 1024),
            inline: true,
          },
          {
            name: 'Invite from (from)',
            value: limit(input.senderName || 'Me', 1024),
            inline: true,
          },
          { name: 'Day', value: dateLabel, inline: false },
          { name: 'Time', value: timeLabel, inline: true },
          {
            name: 'Plan',
            value: `${plan.emoji} ${plan.label}`,
            inline: true,
          },
          {
            name: 'Confirmed view',
            value: limit(input.replyUrl, 1024),
            inline: false,
          },
          {
            name: 'Calendar (.ics)',
            value: limit(
              `Start: ${ics.start}\nEnd: ${ics.end}\nAdd it from the confirmed view.`,
              1024,
            ),
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Automatic response from A Tiny Ask' },
      },
    ],
  }
}

export function isNotificationConfigured(): boolean {
  return Boolean(DISCORD_WEBHOOK_URL || WEB3FORMS_ENV_KEY)
}

/**
 * Sends the sealed plan to the optional Discord/Web3Forms destinations.
 * Never throws: the recipient's letter must stay usable when offline, when
 * CORS blocks a webhook, or when no notification channel is configured.
 */
export async function sendResponseNotification(
  input: ResponseNotificationInput,
): Promise<NotificationResult> {
  let dedupeKey = ''

  try {
    const web3Keys = Array.from(
      new Set(
        [
          cleanNotificationKey(input.notificationKey),
          WEB3FORMS_ENV_KEY,
        ].filter(Boolean),
      ),
    )

    if (!DISCORD_WEBHOOK_URL && web3Keys.length === 0) return 'skipped'

    dedupeKey = [
      input.replyUrl,
      DISCORD_WEBHOOK_URL ? 'discord' : '',
      ...web3Keys,
    ].join('|')

    if (
      completedNotifications.has(dedupeKey) ||
      inFlightNotifications.has(dedupeKey)
    ) {
      return 'skipped'
    }

    inFlightNotifications.add(dedupeKey)

    const dateLabel = formatDateLongWithYear(input.selection.date)
    const calendar = buildCalendarFile(
      input.selection,
      input.recipientName === 'you' ? 'your person' : input.recipientName,
    )
    const subject = `💌 ${input.recipientName} said yes — ${dateLabel}`
    const message = buildWeb3FormsMessage(input, calendar)

    const requests: Promise<boolean>[] = []

    if (DISCORD_WEBHOOK_URL) {
      requests.push(
        postJson(DISCORD_WEBHOOK_URL, buildDiscordPayload(input, calendar)),
      )
    }

    web3Keys.forEach((key) => {
      requests.push(postToWeb3Forms(key, { subject, message }))
    })

    const results = await Promise.all(requests)
    const sent = results.some(Boolean)

    if (sent) {
      completedNotifications.add(dedupeKey)
      return 'sent'
    }

    return 'failed'
  } catch {
    return 'failed'
  } finally {
    if (dedupeKey) inFlightNotifications.delete(dedupeKey)
  }
}
