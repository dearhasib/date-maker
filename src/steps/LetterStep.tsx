import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Copy, Heart, Link2, Pencil, Send } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { copyToClipboard, shareOrCopy } from '../lib/clipboard'
import {
  formatDateLong,
  formatTime12h,
  type PlanSelection,
} from '../lib/date'
import { getPlan } from '../lib/plans'
import { buildReplyUrl } from '../lib/share'
import type { ToastData } from '../components/Toast'

interface LetterStepProps {
  selection: PlanSelection
  senderName: string
  recipientName: string
  onEdit: () => void
  notify: (message: string, tone?: ToastData['tone']) => void
}

export function LetterStep({
  selection,
  senderName,
  recipientName,
  onEdit,
  notify,
}: LetterStepProps) {
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const reduceMotion = useReducedMotion()
  const plan = getPlan(selection.plan)
  const dateLabel = formatDateLong(selection.date)
  const timeLabel = formatTime12h(selection.time)

  const addressee = senderName === 'Me' ? 'you' : senderName
  const signer = recipientName === 'you' ? 'Me' : recipientName

  const replyUrl = useMemo(
    () => buildReplyUrl(selection, recipientName, senderName),
    [selection, recipientName, senderName],
  )

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  async function handleCopyLink() {
    const didCopy = await copyToClipboard(replyUrl)
    if (didCopy) {
      setCopied(true)
      notify('Response link copied — send it back 💌')
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2400)
    } else {
      notify('Could not copy the link. Please try again.', 'error')
    }
  }

  async function handleSendBack() {
    const result = await shareOrCopy({
      title: "It's a date! 💌",
      text: `It's official: ${dateLabel} at ${timeLabel}, for ${plan.phrase}.`,
      url: replyUrl,
    })

    if (result === 'copied') {
      setCopied(true)
      notify('Response link copied — send it back 💌')
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2400)
    } else if (result === 'failed') {
      notify('Could not share the link just yet. Please try copying it.', 'error')
    }
  }

  return (
    <motion.div
      key="letter"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <Card>
        <div className="flex flex-col items-center">
          <Badge
            icon={<span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />}
          >
            A little letter for you
          </Badge>
          <h1 className="sr-only">Your date is sealed</h1>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/80 px-2.5 py-1.5 text-[10.5px] font-medium text-ink">
              <span aria-hidden="true">📅</span>
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/80 px-2.5 py-1.5 text-[10.5px] font-medium text-ink">
              <span aria-hidden="true">⏰</span>
              {timeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/80 px-2.5 py-1.5 text-[10.5px] font-medium text-ink">
              <span aria-hidden="true">{plan.emoji}</span>
              {plan.label}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07, duration: 0.35 }}
            className="relative mt-5 w-full rounded-[20px] border border-[#EAE1D5] bg-cream px-5 py-6 sm:px-6 sm:py-7"
          >
            <div
              aria-hidden="true"
              className="absolute -left-2 -top-3 flex h-9 w-9 rotate-[-7deg] items-center justify-center rounded-full border-[3px] border-white bg-coral text-white shadow-[0_4px_12px_rgba(232,93,74,0.25)]"
            >
              <Heart size={14} fill="currentColor" strokeWidth={0} />
            </div>

            <div className="space-y-[11px] font-serif text-[14px] leading-[1.7] text-[#4b4741]">
              <p className="text-[15px] font-medium">Dear {addressee},</p>
              <p>
                So... it&apos;s official. It&apos;s a date! <span aria-hidden="true">🥂</span>
              </p>
              <p>
                Let&apos;s meet{' '}
                <span className="font-medium text-ink">{dateLabel}</span> at{' '}
                <span className="font-medium text-ink">{timeLabel}</span>, for{' '}
                <span className="font-medium text-ink">{plan.phrase}</span>.{' '}
                <span aria-hidden="true">{plan.emoji}</span>
              </p>
              <p>
                I promise good vibes, terrible jokes, and my very best self.
              </p>
              <p>I already can&apos;t stop smiling. See you there.</p>
              <div className="pt-1">
                <p className="text-muted">Yours (a little nervously),</p>
                <p className="mt-0.5 text-[15px] font-medium italic">
                  — {signer} <span aria-hidden="true">💌</span>
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-5 flex w-full flex-col gap-2.5">
            <motion.button
              type="button"
              onClick={handleSendBack}
              whileHover={reduceMotion ? undefined : { y: -1.5 }}
              whileTap={{ scale: 0.985 }}
              className="primary-button"
            >
              <Send size={15} strokeWidth={2.2} />
              <span>Send it back</span>
              <span aria-hidden="true">💌</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleCopyLink}
              whileTap={{ scale: 0.99 }}
              className="secondary-button"
            >
              {copied ? (
                <Check size={15} strokeWidth={2.4} className="text-sage-ink" />
              ) : (
                <Copy size={14} strokeWidth={2} />
              )}
              {copied ? 'Response link copied' : 'Copy response link'}
            </motion.button>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-center text-[10.5px] font-medium text-muted/80">
            <Link2 size={11} strokeWidth={2} aria-hidden="true" />
            The link carries your exact day, time &amp; plan.
          </p>

          <button
            type="button"
            onClick={onEdit}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
          >
            <Pencil size={11} strokeWidth={2} />
            Edit the plan
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
