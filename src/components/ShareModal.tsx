import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Heart,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { Badge } from './Badge'
import { QrInvite } from './QrInvite'
import { ShareLinkBox } from './ShareLinkBox'
import { copyToClipboard, shareOrCopy } from '../lib/clipboard'
import { isNotificationConfigured } from '../lib/notify'
import {
  buildProposalUrl,
  cleanNotificationKey,
  cleanWhatsAppNumber,
  isLocalPreview,
} from '../lib/share'
import type { ToastData } from './Toast'

interface ShareModalProps {
  onClose: () => void
  notify: (message: string, tone?: ToastData['tone']) => void
}

function limitName(value: string): string {
  return Array.from(value).slice(0, 40).join('')
}

export function ShareModal({ onClose, notify }: ShareModalProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [useWhatsappReply, setUseWhatsappReply] = useState(false)
  const [notificationKey, setNotificationKey] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const senderLabel = useMemo(() => from.trim() || 'Me', [from])
  const recipientLabel = useMemo(() => to.trim() || 'you', [to])
  const localPreview = useMemo(() => isLocalPreview(), [])
  const whatsappDigits = cleanWhatsAppNumber(whatsapp)
  const notificationKeyIsValid =
    !notificationKey.trim() || Boolean(cleanNotificationKey(notificationKey))
  const canGenerate =
    notificationKeyIsValid &&
    (!useWhatsappReply || Boolean(whatsappDigits))

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canGenerate) return

    setGenerated(
      buildProposalUrl({
        from,
        to,
        whatsapp: useWhatsappReply ? whatsapp : '',
        notificationKey,
      }),
    )
    setCopied(false)
  }

  async function handleCopy() {
    if (!generated) return
    const didCopy = await copyToClipboard(generated)
    if (didCopy) {
      setCopied(true)
      notify('Invite link copied — go make someone smile 💌')
      window.setTimeout(() => setCopied(false), 2300)
    } else {
      notify('Copy was blocked — select the link above and copy it.', 'error')
    }
  }

  async function handleShare() {
    if (!generated) return
    const result = await shareOrCopy({
      title: 'A tiny ask 💌',
      text: 'I have a tiny question for you...',
      url: generated,
    })

    if (result === 'copied') {
      setCopied(true)
      notify('Invite link copied — go make someone smile 💌')
      window.setTimeout(() => setCopied(false), 2300)
    } else if (result === 'failed') {
      notify('Could not share the link just yet.', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-[#2c211a]/20 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] backdrop-blur-[6px] sm:items-center sm:py-6"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        generated ? 'share-modal-title-success' : 'share-modal-title-compose'
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative my-auto w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white p-6 text-left shadow-[0_30px_80px_rgba(60,40,25,0.18)] sm:p-7"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream hover:text-ink"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <Badge icon={<Heart size={10} fill="currentColor" className="text-coral" />}>
          Share the love
        </Badge>

        <AnimatePresence mode="wait" initial={false}>
          {!generated ? (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <h2
                id="share-modal-title-compose"
                className="mt-4 font-serif text-[2rem] font-medium leading-[1.05] tracking-[-0.035em] text-ink"
              >
                Make your own <em className="italic text-coral">ask</em>.
              </h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                Add your names, send the link, and let them choose the day, time
                and plan.
              </p>

              <form onSubmit={handleGenerate} className="mt-5 space-y-3.5">
                <label className="block">
                  <span className="eyebrow mb-2 block text-[9px]">From</span>
                  <input
                    value={from}
                    onChange={(event) => setFrom(limitName(event.target.value))}
                    placeholder="Me"
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    className="min-h-[48px] w-full rounded-2xl border border-line bg-white px-3.5 text-[16px] font-medium text-ink outline-none transition placeholder:text-muted/50 focus:border-coral/60 focus:shadow-[0_0_0_4px_rgba(232,93,74,0.08)] sm:text-[13px]"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow mb-2 block text-[9px]">To</span>
                  <input
                    value={to}
                    onChange={(event) => setTo(limitName(event.target.value))}
                    placeholder="you"
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    className="min-h-[48px] w-full rounded-2xl border border-line bg-white px-3.5 text-[16px] font-medium text-ink outline-none transition placeholder:text-muted/50 focus:border-coral/60 focus:shadow-[0_0_0_4px_rgba(232,93,74,0.08)] sm:text-[13px]"
                  />
                </label>

                <details className="group rounded-2xl border border-line bg-cream/60 p-3.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[11.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-coral" />
                      Instant Notify Setup
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted">
                        Optional
                      </span>
                    </span>
                    <ChevronDown
                      size={14}
                      className="shrink-0 text-muted transition-transform group-open:rotate-180"
                    />
                  </summary>

                  <div className="mt-3 space-y-3">
                    {isNotificationConfigured() ? (
                      <p className="rounded-xl bg-sage-pale/70 px-2.5 py-2 text-[10px] leading-relaxed text-sage-ink">
                        This deployment can send automatic notifications when
                        someone seals the plan.
                      </p>
                    ) : null}

                    <label className="block">
                      <span className="mb-1.5 block text-[10.5px] font-semibold text-ink">
                        Web3Forms access key
                      </span>
                      <input
                        value={notificationKey}
                        onChange={(event) =>
                          setNotificationKey(event.target.value.slice(0, 100))
                        }
                        placeholder="Optional access key"
                        autoComplete="off"
                        spellCheck={false}
                        className="min-h-[44px] w-full rounded-xl border border-line bg-white px-3 text-[16px] font-medium text-ink outline-none transition placeholder:text-muted/45 focus:border-coral/60 focus:shadow-[0_0_0_4px_rgba(232,93,74,0.08)] sm:text-[12px]"
                      />
                      <span className="mt-1 block text-[10px] leading-relaxed text-muted/80">
                        Sends you an email when they seal the plan. The key
                        travels inside the invite link.
                      </span>
                      {notificationKey.trim() && !notificationKeyIsValid ? (
                        <span className="mt-1 block text-[10px] font-medium text-coral">
                          That does not look like a valid Web3Forms key.
                        </span>
                      ) : null}
                    </label>

                    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={useWhatsappReply}
                        onChange={(event) =>
                          setUseWhatsappReply(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-coral"
                      />
                      <span>
                        <span className="block text-[10.5px] font-semibold text-ink">
                          Send the plan directly to my WhatsApp
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-muted/80">
                          Their primary button will open WhatsApp with the full
                          plan ready to send.
                        </span>
                      </span>
                    </label>

                    {useWhatsappReply ? (
                      <label className="block">
                        <span className="mb-1.5 block text-[10.5px] font-semibold text-ink">
                          Your WhatsApp number (optional)
                        </span>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={whatsapp}
                          onChange={(event) =>
                            setWhatsapp(event.target.value.slice(0, 24))
                          }
                          placeholder="Country code + number"
                          className="min-h-[44px] w-full rounded-xl border border-line bg-white px-3 text-[16px] font-medium text-ink outline-none transition placeholder:text-muted/45 focus:border-coral/60 focus:shadow-[0_0_0_4px_rgba(232,93,74,0.08)] sm:text-[12px]"
                        />
                        <span className="mt-1 block text-[10px] leading-relaxed text-muted/80">
                          Include the country code. This number is visible to
                          anyone with the invite link.
                        </span>
                        {!whatsappDigits ? (
                          <span className="mt-1 block text-[10px] font-medium text-coral">
                            Enter 8–15 digits including the country code.
                          </span>
                        ) : null}
                      </label>
                    ) : null}

                    <p className="text-[9.5px] leading-relaxed text-muted/70">
                      Optional settings travel inside the invite link. Only add a
                      notification key or phone number you are comfortable
                      sharing with the recipient.
                    </p>
                  </div>
                </details>

                <button
                  type="submit"
                  className="primary-button mt-1"
                  disabled={!canGenerate}
                >
                  <Heart size={14} fill="currentColor" strokeWidth={0} />
                  Create proposal link
                </button>
              </form>

              <p className="mt-3.5 text-center text-[10.5px] leading-relaxed text-muted/80">
                They&apos;ll say yes, pick the details, and send a response link
                back to you.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="share-modal-title-success"
                    className="font-serif text-[2rem] font-medium leading-[1.05] tracking-[-0.035em] text-ink"
                  >
                    Your link is <em className="italic text-coral">ready</em>.
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                    For {recipientLabel}, from {senderLabel}. One tiny click and
                    the plan begins.
                  </p>
                </div>
                <motion.span
                  initial={{ scale: 0.6, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-pale text-sage-ink"
                  aria-hidden="true"
                >
                  <Check size={20} strokeWidth={2.5} />
                </motion.span>
              </div>

              {localPreview ? (
                <p
                  role="note"
                  className="mt-3 rounded-xl border border-coral/20 bg-coral-pale/40 px-3 py-2 text-[10px] font-medium leading-relaxed text-coral-dark"
                >
                  Local preview link — deploy the app before sharing. This link
                  will not open on another device.
                </p>
              ) : null}

              <QrInvite value={generated} notify={notify} />

              <ShareLinkBox
                value={generated}
                label="Your proposal link"
                hint="If the copy or share buttons are blocked, select the link above manually."
                className="mt-3"
              />

              <div className="mt-3 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={canNativeShare ? handleShare : handleCopy}
                  className="primary-button"
                >
                  {canNativeShare ? (
                    <Send size={14} strokeWidth={2.1} />
                  ) : copied ? (
                    <Check size={15} strokeWidth={2.4} />
                  ) : (
                    <Copy size={14} strokeWidth={2.1} />
                  )}
                  {canNativeShare
                    ? 'Share the invite'
                    : copied
                      ? 'Link copied!'
                      : 'Copy invite link'}
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="secondary-button px-3 text-[12px]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <a
                    href={generated}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button px-3 text-[12px]"
                  >
                    <ExternalLink size={13} />
                    Preview
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGenerated(null)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
              >
                <ArrowLeft size={11} strokeWidth={2} />
                Edit names
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
