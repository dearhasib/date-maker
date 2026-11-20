import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarPlus, Check, Copy, Heart } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Flower } from '../components/Flower'
import { copyToClipboard } from '../lib/clipboard'
import {
  downloadCalendarFile,
  formatDateLong,
  formatSelectionSummary,
  formatTime12h,
  type PlanSelection,
} from '../lib/date'
import { getPlan } from '../lib/plans'
import { softCelebrate } from '../lib/confetti'
import type { ToastData } from '../components/Toast'

interface ReplyStepProps {
  selection: PlanSelection
  responder: string
  originalSender: string
  notify: (message: string, tone?: ToastData['tone']) => void
}

function isGenericName(name: string): boolean {
  return ['you', 'me', 'your person'].includes(name.trim().toLowerCase())
}

export function ReplyStep({
  selection,
  responder,
  originalSender,
  notify,
}: ReplyStepProps) {
  const reduceMotion = useReducedMotion()
  const fired = useRef(false)
  const plan = getPlan(selection.plan)
  const dateLabel = formatDateLong(selection.date)
  const timeLabel = formatTime12h(selection.time)
  const genericResponder = isGenericName(responder)
  const withName = genericResponder ? 'your person' : responder
  const addressee = originalSender === 'Me' ? 'you' : originalSender
  const signer = responder === 'you' ? 'Me' : responder

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const timer = window.setTimeout(() => softCelebrate(), 180)
    return () => window.clearTimeout(timer)
  }, [])

  async function copyDetails() {
    const details = `${formatSelectionSummary(selection)} ${plan.emoji}`
    const copied = await copyToClipboard(details)
    notify(
      copied ? 'Date details copied 💛' : 'Could not copy the details.',
      copied ? 'success' : 'error',
    )
  }

  return (
    <motion.div
      key="reply"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <Card>
        <div className="flex flex-col items-center text-center">
          <Badge icon={<Check size={10} strokeWidth={3} className="text-coral" />}>
            Their answer
          </Badge>

          <h1 className="mt-6 text-balance font-serif text-[2.55rem] font-medium leading-[1.04] tracking-[-0.035em] text-ink sm:text-[2.8rem]">
            {genericResponder ? (
              <>
                They said <em className="italic text-coral">yes</em>.
              </>
            ) : (
              <>
                {responder} said <em className="italic text-coral">yes</em>.
              </>
            )}
          </h1>

          <p className="mt-2 text-[13px] font-medium text-muted">
            Your date with {withName} is on the calendar 💛
          </p>

          <Flower bloom={6} size={158} className="mt-1" />

          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
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

          <div className="relative mt-5 w-full rounded-[20px] border border-[#EAE1D5] bg-cream px-5 py-5 text-left sm:px-6">
            <div
              aria-hidden="true"
              className="absolute -right-2 -top-3 flex h-9 w-9 rotate-[7deg] items-center justify-center rounded-full border-[3px] border-white bg-coral text-white shadow-[0_4px_12px_rgba(232,93,74,0.25)]"
            >
              <Heart size={14} fill="currentColor" strokeWidth={0} />
            </div>

            <div className="space-y-[10px] font-serif text-[13.5px] leading-[1.7] text-[#4b4741]">
              <p className="text-[14.5px] font-medium">Dear {addressee},</p>
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
              <p>I promise good vibes, terrible jokes, and my very best self.</p>
              <p>I already can&apos;t stop smiling. See you there.</p>
              <div className="pt-1">
                <p className="text-muted">Yours (a little nervously),</p>
                <p className="mt-0.5 text-[14.5px] font-medium italic">
                  — {signer} <span aria-hidden="true">💌</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-col gap-2.5">
            <motion.button
              type="button"
              onClick={() => {
                downloadCalendarFile(selection, withName)
                notify('Calendar invite downloaded 📅')
              }}
              whileHover={reduceMotion ? undefined : { y: -1.5 }}
              whileTap={{ scale: 0.985 }}
              className="primary-button"
            >
              <CalendarPlus size={15} strokeWidth={2.1} />
              Add to calendar
            </motion.button>
            <motion.button
              type="button"
              onClick={copyDetails}
              whileTap={{ scale: 0.99 }}
              className="secondary-button"
            >
              <Copy size={14} strokeWidth={2} />
              Copy the details
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
