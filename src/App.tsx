import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { PetalRain } from './components/PetalRain'
import { ShareModal } from './components/ShareModal'
import { Toast, type ToastData } from './components/Toast'
import { AskStep } from './steps/AskStep'
import { ConfirmedStep } from './steps/ConfirmedStep'
import { LetterStep } from './steps/LetterStep'
import { PlannerStep } from './steps/PlannerStep'
import { ReplyStep } from './steps/ReplyStep'
import type { PlanSelection } from './lib/date'
import { clearConfetti } from './lib/confetti'
import { readSharedState } from './lib/share'

type Step = 'ask' | 'confirmed' | 'plan' | 'letter' | 'reply'

export default function App() {
  const shared = useMemo(() => readSharedState(), [])
  const initialStep: Step =
    shared.isReply && shared.selection ? 'reply' : 'ask'

  const [step, setStep] = useState<Step>(initialStep)
  const [selection, setSelection] = useState<PlanSelection | null>(
    shared.selection,
  )
  const [shareOpen, setShareOpen] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showPetals = step === 'confirmed' || step === 'letter' || step === 'reply'
  const petalCount = step === 'confirmed' ? 15 : 23

  const notify = useCallback(
    (message: string, tone: ToastData['tone'] = 'success') => {
      setToast({ id: Date.now(), message, tone })
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToast(null), 3400)
    },
    [],
  )

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  useEffect(() => {
    const titles: Record<Step, string> = {
      ask: 'Will you go out with me?',
      confirmed: "Yay — it's a date.",
      plan: 'Pick the day, time & plan',
      letter: 'A little letter for you',
      reply: 'It’s a date! 💌',
    }
    document.title = titles[step]
    if (step === 'plan') clearConfetti()
  }, [step])

  const closeShare = useCallback(() => setShareOpen(false), [])

  function handleSeal(nextSelection: PlanSelection) {
    setSelection(nextSelection)
    setStep('letter')
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-cream px-4 py-8 sm:px-6 sm:py-12">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(244,196,188,0.3),transparent_28%),radial-gradient(circle_at_88%_92%,rgba(197,214,186,0.28),transparent_30%),linear-gradient(145deg,#FBF8F2_0%,#FAF6F0_48%,#F8F2EA_100%)]" />
          <div className="absolute -left-24 top-[-14%] h-[28rem] w-[28rem] animate-soft-pulse rounded-full bg-[#F3C4B8]/15 blur-3xl" />
          <div className="absolute -right-28 bottom-[-18%] h-[32rem] w-[32rem] rounded-full bg-[#C5D6BA]/15 blur-3xl" />
          <div className="absolute right-[12%] top-[14%] h-1.5 w-1.5 rounded-full bg-coral/20" />
          <div className="absolute left-[15%] top-[30%] h-1 w-1 rounded-full bg-coral/15" />
          <div className="absolute bottom-[22%] left-[9%] h-1.5 w-1.5 rounded-full bg-sage-dark/25" />
          <div className="absolute bottom-[32%] right-[7%] h-1 w-1 rounded-full bg-coral/20" />
        </div>

        {showPetals ? <PetalRain count={petalCount} /> : null}

        <main className="relative z-10 flex w-full flex-col items-center">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'ask' ? (
              <AskStep key="ask" onYes={() => setStep('confirmed')} />
            ) : null}

            {step === 'confirmed' ? (
              <ConfirmedStep key="confirmed" onPlan={() => setStep('plan')} />
            ) : null}

            {step === 'plan' ? (
              <PlannerStep
                key="plan"
                initialSelection={selection}
                onSeal={handleSeal}
              />
            ) : null}

            {step === 'letter' && selection ? (
              <LetterStep
                key="letter"
                selection={selection}
                senderName={shared.from}
                recipientName={shared.to}
                onEdit={() => setStep('plan')}
                notify={notify}
              />
            ) : null}

            {step === 'reply' && selection ? (
              <ReplyStep
                key="reply"
                selection={selection}
                responder={shared.from}
                originalSender={shared.to}
                notify={notify}
              />
            ) : null}
          </AnimatePresence>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative z-10 mt-6 flex flex-col items-center gap-2 pb-[env(safe-area-inset-bottom)] text-center"
          >
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-muted/60">
              <Sparkles size={10} strokeWidth={1.8} aria-hidden="true" />
              A little link, a big yes
            </p>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-muted transition-colors hover:text-coral"
            >
              <Heart
                size={10}
                fill="currentColor"
                strokeWidth={0}
                aria-hidden="true"
              />
              Create your own proposal
            </button>
          </motion.footer>
        </main>

        <AnimatePresence>
          {shareOpen ? (
            <ShareModal key="share-modal" onClose={closeShare} notify={notify} />
          ) : null}
        </AnimatePresence>

        <Toast toast={toast} />
      </div>
    </MotionConfig>
  )
}
