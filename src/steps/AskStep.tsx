import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Flower } from '../components/Flower'

const DODGE_LABELS = [
  'No',
  'Sure?',
  'Wait—',
  'Think again!',
  'Last chance!',
  'Nope!',
  'Try Yes!',
]

const DODGE_SUBTITLES = [
  'Nice try — I dodged you.',
  'Faster than romance.',
  'No is waiting...',
  'Yes is blooming, hm? 🌸',
  'So shy.',
]

const MAX_DODGES = 8

interface Point {
  x: number
  y: number
}

interface AskStepProps {
  onYes: () => void
}

function intersects(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
  gap = 8,
): boolean {
  return (
    a.left < b.right + gap &&
    a.right > b.left - gap &&
    a.top < b.bottom + gap &&
    a.bottom > b.top - gap
  )
}

export function AskStep({ onYes }: AskStepProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const lastDodge = useRef(0)
  const [dodges, setDodges] = useState(0)
  const [noGone, setNoGone] = useState(false)
  const [noPos, setNoPos] = useState<Point | null>(null)
  const reduceMotion = useReducedMotion()

  const subtitle =
    noGone
      ? 'Only yes left now. 💛'
      : dodges === 0
        ? 'Catch No if you can.'
        : DODGE_SUBTITLES[(dodges - 1) % DODGE_SUBTITLES.length]

  const noLabel = DODGE_LABELS[Math.min(dodges, DODGE_LABELS.length - 1)]
  const noScale = Math.max(0.7, 1 - dodges * 0.045)
  const yesWidth = noGone
    ? '100%'
    : dodges === 0
      ? 'calc(100% - 110px)'
      : `${Math.min(100, 66 + dodges * 4.7)}%`

  const positionInitially = useCallback(() => {
    const card = cardRef.current
    const no = noRef.current
    if (!card || !no) return

    const cardRect = card.getBoundingClientRect()
    const noRect = no.getBoundingClientRect()
    const yes = card.querySelector<HTMLElement>('[data-yes-button]')

    if (yes) {
      const yesRect = yes.getBoundingClientRect()
      setNoPos({
        x: yesRect.right - cardRect.left + 14,
        y: yesRect.top - cardRect.top + (yesRect.height - noRect.height) / 2,
      })
      return
    }

    setNoPos({
      x: cardRect.width - noRect.width - 24,
      y: cardRect.height - noRect.height - 40,
    })
  }, [])

  useLayoutEffect(() => {
    if (dodges === 0) positionInitially()
  }, [dodges, positionInitially])

  useEffect(() => {
    if (dodges !== 0) return

    const card = cardRef.current
    let cancelled = false

    document.fonts?.ready.then(() => {
      if (!cancelled) positionInitially()
    })

    if (!card || typeof ResizeObserver === 'undefined') {
      return () => {
        cancelled = true
      }
    }

    const observer = new ResizeObserver(() => positionInitially())
    observer.observe(card)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [dodges, positionInitially])

  useEffect(() => {
    const handleResize = () => {
      if (dodges === 0) {
        positionInitially()
        return
      }

      const card = cardRef.current
      const no = noRef.current
      if (!card || !no || !noPos) return

      const cardRect = card.getBoundingClientRect()
      const noRect = no.getBoundingClientRect()
      const maxX = Math.max(14, cardRect.width - noRect.width - 14)
      const maxY = Math.max(14, cardRect.height - noRect.height - 14)
      setNoPos({
        x: Math.min(Math.max(14, noPos.x), maxX),
        y: Math.min(Math.max(14, noPos.y), maxY),
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dodges, noPos, positionInitially])

  const dodge = useCallback(
    (pointer?: { x: number; y: number }) => {
      if (noGone || dodges >= MAX_DODGES) return

      const now = performance.now()
      if (now - lastDodge.current < 260) return
      lastDodge.current = now

      const card = cardRef.current
      const no = noRef.current
      if (!card || !no) return

      const cardRect = card.getBoundingClientRect()
      const noRect = no.getBoundingClientRect()
      const margin = 16
      const maxX = Math.max(margin, cardRect.width - noRect.width - margin)
      // Keep a clear runway above the action row, even while YES grows.
      const maxY = Math.max(
        margin,
        cardRect.height - noRect.height - 112,
      )

      const avoid = Array.from(
        card.querySelectorAll<HTMLElement>('[data-dodge-avoid]'),
      )
        .map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => ({
          left: rect.left - cardRect.left,
          right: rect.right - cardRect.left,
          top: rect.top - cardRect.top,
          bottom: rect.bottom - cardRect.top,
        }))

      // Avoid simply re-appearing under the same button or cursor.
      avoid.push({
        left: noRect.left - cardRect.left,
        right: noRect.right - cardRect.left,
        top: noRect.top - cardRect.top,
        bottom: noRect.bottom - cardRect.top,
      })
      if (pointer && pointer.x > 0 && pointer.y > 0) {
        avoid.push({
          left: pointer.x - cardRect.left - 14,
          right: pointer.x - cardRect.left + 14,
          top: pointer.y - cardRect.top - 14,
          bottom: pointer.y - cardRect.top + 14,
        })
      }

      // The counter will appear in the top-right after this dodge.
      avoid.push({
        left: cardRect.width - 154,
        right: cardRect.width,
        top: 0,
        bottom: 58,
      })

    // Keep the whole action strip clear as YES will grow into it.
    avoid.push({
      left: 0,
      right: cardRect.width,
      top: cardRect.height - 90,
      bottom: cardRect.height,
    })

    const currentCenter = noPos
      ? {
          x: noPos.x + noRect.width / 2,
          y: noPos.y + noRect.height / 2,
        }
      : null
    const minimumJump = Math.max(88, noRect.width * 1.35)

    function isGoodSpot(candidate: Point): boolean {
      const box = {
        left: candidate.x,
        right: candidate.x + noRect.width,
        top: candidate.y,
        bottom: candidate.y + noRect.height,
      }
      if (avoid.some((rect) => intersects(box, rect, 7))) return false
      if (!currentCenter) return true

      const dx = candidate.x + noRect.width / 2 - currentCenter.x
      const dy = candidate.y + noRect.height / 2 - currentCenter.y
      return Math.hypot(dx, dy) >= minimumJump
    }

    let next: Point | null = null

    for (let attempt = 0; attempt < 120; attempt += 1) {
      const candidate = {
        x: margin + Math.random() * (maxX - margin),
        y: margin + Math.random() * (maxY - margin),
      }
      if (isGoodSpot(candidate)) {
        next = candidate
        break
      }
    }

    if (!next) {
      const fallbacks: Point[] = [
        { x: margin, y: Math.max(70, cardRect.height * 0.52) },
        { x: maxX, y: Math.max(70, cardRect.height * 0.48) },
        { x: margin, y: Math.max(70, cardRect.height * 0.7) },
        { x: maxX, y: Math.max(70, cardRect.height * 0.68) },
        { x: cardRect.width / 2 - noRect.width / 2, y: margin },
      ]
      next = fallbacks.find(isGoodSpot) ?? null
    }

    if (!next) {
      // Last resort: keep the dodge moving by choosing the farthest edge slot.
      const base = noPos ?? { x: margin, y: margin }
      next = {
        x: base.x < cardRect.width / 2 ? maxX : margin,
        y: Math.min(maxY, Math.max(margin, (base.y + cardRect.height * 0.42) % maxY)),
      }
    }

    setNoPos(next)

    const nextDodges = dodges + 1
    setDodges(nextDodges)
    if (nextDodges >= MAX_DODGES) {
      window.setTimeout(() => setNoGone(true), 260)
    }
  }, [dodges, noGone, noPos])

  return (
    <motion.div
      key="ask"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <Card ref={cardRef} className="overflow-visible">
        <AnimatePresence>
          {dodges > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              data-dodge-avoid
              className="absolute right-4 top-4 z-20 rounded-full border border-line bg-cream px-3 py-1.5 text-[9px] font-semibold tracking-[0.02em] text-muted shadow-[0_2px_10px_rgba(70,52,38,0.06)] sm:right-5 sm:top-5"
            >
              {dodges} {dodges === 1 ? 'dodge' : 'dodges'}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col items-center text-center">
          <div data-dodge-avoid>
            <Badge>A tiny ask</Badge>
          </div>

          <h1
            data-dodge-avoid
            className="mt-6 text-balance font-serif text-[2.62rem] font-medium leading-[1.02] tracking-[-0.035em] text-ink sm:text-[2.9rem]"
          >
            <span className="block">Will you go</span>
            <span className="block">
              <em className="font-normal italic text-coral">out</em> with me?
            </span>
          </h1>

          <div className="mt-3.5 flex min-h-[22px] items-center justify-center" data-dodge-avoid>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={subtitle}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="text-[13px] font-medium tracking-[-0.005em] text-muted"
              >
                {subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-1.5">
            <Flower bloom={dodges} size={190} />
          </div>

          <div className="relative mt-2 h-14 w-full">
            <motion.button
              type="button"
              data-yes-button
              data-dodge-avoid
              onClick={onYes}
              animate={{ width: yesWidth, scale: 1 + Math.min(dodges, 8) * 0.011 }}
              whileHover={reduceMotion ? undefined : { scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              className="absolute inset-y-0 left-0 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-sage text-ink shadow-[0_5px_0_rgba(126,153,113,0.22),0_10px_24px_rgba(126,153,113,0.14)] transition-colors duration-200 hover:bg-sage-dark active:shadow-[0_2px_0_rgba(126,153,113,0.22)] focus-visible:outline-coral"
            >
              <span className="text-[15px] font-bold tracking-[0.16em]">YES</span>
              <motion.span
                animate={{ opacity: dodges > 0 ? 1 : 0.72, rotate: dodges * 8 }}
                className="flex items-center gap-1 text-sage-ink"
                aria-hidden="true"
              >
                {dodges > 2 ? (
                  <Sparkles size={15} strokeWidth={2.2} />
                ) : (
                  <Heart size={13} fill="currentColor" strokeWidth={0} />
                )}
              </motion.span>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {!noGone ? (
            <motion.button
              ref={noRef}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: noPos ? 1 : 0, scale: noScale }}
              exit={{ opacity: 0, scale: 0.5, rotate: -8 }}
              transition={{ duration: 0.2 }}
              whileHover={reduceMotion ? undefined : { scale: noScale + 0.035 }}
              whileTap={{ scale: 0.94 }}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') {
                  dodge({ x: event.clientX, y: event.clientY })
                }
              }}
              onClick={(event) => {
                event.preventDefault()
                dodge({ x: event.clientX, y: event.clientY })
              }}
              style={
                noPos
                  ? {
                      left: noPos.x,
                      top: noPos.y,
                      transitionProperty: 'left, top',
                      transitionDuration: reduceMotion ? '0s' : '0.3s',
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    }
                  : undefined
              }
              aria-label={noLabel}
              data-no-button
              className={`absolute z-30 flex h-10 w-[96px] items-center justify-center whitespace-nowrap rounded-full border border-line bg-white px-2 text-[11.5px] font-semibold tracking-[-0.01em] text-muted shadow-[0_4px_14px_rgba(70,52,38,0.08)] transition-colors hover:border-coral/30 hover:text-coral ${
                noPos ? '' : 'invisible bottom-10 right-6 sm:right-9'
              }`}
            >
              {noLabel}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
