import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  Copy,
  Heart,
  Link2,
  Mail,
  MessageCircle,
  Pencil,
  Send,
} from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { ShareLinkBox } from '../components/ShareLinkBox'
import { copyToClipboard, shareOrCopy } from '../lib/clipboard'
import {
  formatDateLong,
  formatTime12h,
  type PlanSelection,
} from '../lib/date'
import { buildMailtoUrl } from '../lib/email'
import { sendResponseNotification } from '../lib/notify'
import { getPlan } from '../lib/plans'
import { buildReplyUrl } from '../lib/share'
import { buildWhatsAppReplyUrl, openWhatsAppReply } from '../lib/whatsapp'
import type { ToastData } from '../components/Toast'

interface LetterStepProps {
  selection: PlanSelection
  senderName: string
  recipientName: string
  whatsappNumber?: string
  emailAddress?: string
  notificationKey?: string
  onEdit: () => void
  notify: (message: string, tone?: ToastData['tone']) => void
}

export function LetterStep({
  selection,
  senderName,
  recipientName,
  whatsappNumber = '',
  emailAddress = '',
  notificationKey = '',
  onEdit,
  notify,
}: LetterStepProps) {
  const [copied, setCopied] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [autoSent, setAutoSent] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const notificationFired = useRef(false)
  const reduceMotion = useReducedMotion()
  const plan = getPlan(selection.plan)
  const dateLabel = formatDateLong(selection.date)
  const timeLabel = formatTime12h(selection.time)

  const addressee = senderName === 'Me' ? 'you' : senderName
  const signer = recipientName === 'you' ? 'Me' : recipientName
  const notificationRecipient =
    senderName === 'Me' ? 'the sender' : senderName

  const replyUrl = useMemo(
    () => buildReplyUrl(selection, recipientName, senderName),
    [selection, recipientName, senderName],
  )

  const whatsappReplyUrl = useMemo(
    () =>
      buildWhatsAppReplyUrl({
        number: whatsappNumber,
        senderName,
        recipientName,
        selection,
        replyUrl,
      }),
    [whatsappNumber, senderName, recipientName, selection, replyUrl],
  )

  const mailtoUrl = useMemo(
    () =>
      buildMailtoUrl(emailAddress, {
        senderName,
        recipientName,
        selection,
        replyUrl,
      }),
    [emailAddress, senderName, recipientName, selection, replyUrl],
  )

  useEffect(() => {
    if (notificationFired.current) return
    notificationFired.current = true

    let active = true
    void sendResponseNotification({
      senderName,
      recipientName,
      selection,
      replyUrl,
      emailAddress,
      notificationKey,
    }).then((result) => {
      if (active && result === 'sent') setAutoSent(true)
    })

    return () => {
      active = false
    }
  }, [
    emailAddress,
    notificationKey,
    recipientName,
    replyUrl,
    selection,
    senderName,
  ])

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
      setShowLink(true)
      notify('Copy was blocked — select the link below and copy it.', 'error')
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
      setShowLink(true)
      notify('Sharing was blocked — select the link below instead.', 'error')
    }
  }

  function handleSendViaWhatsApp() {
    openWhatsAppReply(whatsappReplyUrl)
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

          {autoSent ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage-pale px-3 py-1.5 text-[10.5px] font-semibold text-sage-ink"
            >
              <Check size={11} strokeWidth={2.6} />
              Sent to {notificationRecipient}! 💌
            </motion.p>
          ) : null}

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
              onClick={
                whatsappReplyUrl ? handleSendViaWhatsApp : handleSendBack
              }
              whileHover={reduceMotion ? undefined : { y: -1.5 }}
              whileTap={{ scale: 0.985 }}
              className="primary-button"
            >
              {whatsappReplyUrl ? (
                <MessageCircle size={15} strokeWidth={2.2} />
              ) : (
                <Send size={15} strokeWidth={2.2} />
              )}
              <span>
                {whatsappReplyUrl
                  ? 'Send Plan via WhatsApp'
                  : 'Share the good news'}
              </span>
              <span aria-hidden="true">
                {whatsappReplyUrl ? '💬' : '💌'}
              </span>
            </motion.button>

            {mailtoUrl ? (
              <a href={mailtoUrl} className="secondary-button">
                <Mail size={14} strokeWidth={2} />
                <span>Send via Email App</span>
                <span aria-hidden="true">✉️</span>
              </a>
            ) : null}

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

          {showLink ? (
            <ShareLinkBox
              value={replyUrl}
              label="Your response link"
              hint="Copy this link and send it back if the share sheet or clipboard is blocked."
              className="mt-3"
            />
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setShowLink((visible) => !visible)}
              aria-expanded={showLink}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
            >
              <Link2 size={11} strokeWidth={2} />
              {showLink ? 'Hide link' : 'Show link'}
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
            >
              <Pencil size={11} strokeWidth={2} />
              Edit the plan
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
