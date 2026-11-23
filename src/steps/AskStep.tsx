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

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Finds a dodge target inside the card, clear of headings, the YES button,
 * the top-right counter, the action row, and the user's pointer. Candidate
 * points include a deterministic grid so tiny screens never fall through to
 * an overlapping last-resort position.
 */
function pickDodgePosition(
  card: HTMLDivElement,
  no: HTMLButtonElement,
  current: Point | null,
  pointer?: { x: number; y: number },
): Point {
  const cardRect = card.getBoundingClientRect()
  const noRect = no.getBoundingClientRect()
  const margin = 16
  const noWidth = noRect.width
  const noHeight = noRect.height

  // Keep the button inside the visible viewport as well as inside the card.
  const visibleLeft = Math.max(margin, -cardRect.left + 8)
  const visibleRight = Math.min(
    cardRect.width - noWidth - margin,
    window.innerWidth - cardRect.left - noWidth - 8,
  )
  const maxX = Math.max(margin, visibleRight)
  const minX = Math.min(visibleLeft, maxX)

  // Leave the bottom action row free while YES grows, and keep the target in
  // the visible part of the card when the page has been scrolled on a short
  // mobile screen.
  const actionLimit = Math.max(
    margin,
    cardRect.height - noHeight - 112,
  )
  const visibleTop = 8 - cardRect.top
  const visibleBottom =
    window.innerHeight - cardRect.top - noHeight - 8
  const maxY = Math.max(
    margin,
    Math.min(actionLimit, visibleBottom > margin ? visibleBottom : actionLimit),
  )
  const minY = Math.min(Math.max(margin, visibleTop), maxY)

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

  // Do not reappear under the current button or the pointer.
  avoid.push({
    left: noRect.left - cardRect.left,
    right: noRect.right - cardRect.left,
    top: noRect.top - cardRect.top,
    bottom: noRect.bottom - cardRect.top,
  })
  if (pointer && pointer.x > 0 && pointer.y > 0) {
    avoid.push({
      left: pointer.x - cardRect.left - 16,
      right: pointer.x - cardRect.left + 16,
      top: pointer.y - cardRect.top - 16,
      bottom: pointer.y - cardRect.top + 16,
    })
  }

  // The counter appears in the top-right after a dodge.
  avoid.push({
    left: cardRect.width - 154,
    right: cardRect.width,
    top: 0,
    bottom: 58,
  })

  // Keep the whole action strip clear as YES grows into it.
  avoid.push({
    left: 0,
    right: cardRect.width,
    top: cardRect.height - 90,
    bottom: cardRect.height,
  })

  const isSafe = (candidate: Point, gap: number): boolean => {
    const box = {
      left: candidate.x,
      right: candidate.x + noWidth,
      top: candidate.y,
      bottom: candidate.y + noHeight,
    }
    return !avoid.some((rect) => intersects(box, rect, gap))
  }

  const candidates: Point[] = []

  for (let attempt = 0; attempt < 140; attempt += 1) {
    candidates.push({
      x: minX + Math.random() * Math.max(0, maxX - minX),
      y: minY + Math.random() * Math.max(0, maxY - minY),
    })
  }

  // A small grid guarantees a usable candidate even when random picks miss.
  const gridStep = 8
  for (let y = minY; y <= maxY; y += gridStep) {
    for (let x = minX; x <= maxX; x += gridStep) {
      candidates.push({ x, y })
    }
  }

  let safeCandidates = candidates.filter((candidate) => isSafe(candidate, 7))
  if (safeCandidates.length === 0) {
    safeCandidates = candidates.filter((candidate) => isSafe(candidate, 0))
  }

  if (safeCandidates.length > 0) {
    const currentCenter = current
      ? {
          x: current.x + noWidth / 2,
          y: current.y + noHeight / 2,
        }
      : null

    if (!currentCenter) {
      return safeCandidates[Math.floor(Math.random() * safeCandidates.length)]
    }

    const minimumJump = Math.max(88, noWidth * 1.35)
    const farEnough = safeCandidates.filter((candidate) => {
      const candidateCenter = {
        x: candidate.x + noWidth / 2,
        y: candidate.y + noHeight / 2,
      }
      return distance(candidateCenter, currentCenter) >= minimumJump
    })

    if (farEnough.length > 0) {
      return farEnough[Math.floor(Math.random() * farEnough.length)]
    }

    return safeCandidates.reduce((best, candidate) => {
      const candidateCenter = {
        x: candidate.x + noWidth / 2,
        y: candidate.y + noHeight / 2,
      }
      const bestCenter = {
        x: best.x + noWidth / 2,
        y: best.y + noHeight / 2,
      }
      return distance(candidateCenter, currentCenter) >
        distance(bestCenter, currentCenter)
        ? candidate
        : best
    })
  }

  // This is only reachable if the card is smaller than the button. Keep it
  // bounded rather than clipping outside the card.
  return {
    x: Math.min(Math.max(margin, current?.x ?? margin), maxX),
    y: Math.min(Math.max(minY, current?.y ?? minY), maxY),
  }
}

export function AskStep({ onYes }: AskStepProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const lastDodge = useRef(0)
  const lastTouch = useRef(-Infinity)
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
      const maxX = Math.max(
        12,
        Math.min(
          cardRect.width - noRect.width - 12,
          window.innerWidth - cardRect.left - noRect.width - 8,
        ),
      )
      setNoPos({
        x: Math.min(
          maxX,
          Math.max(12, yesRect.right - cardRect.left + 14),
        ),
        y: Math.min(
          Math.max(12, yesRect.top - cardRect.top + (yesRect.height - noRect.height) / 2),
          cardRect.height - noRect.height - 12,
        ),
      })
      return
    }

    setNoPos({
      x: Math.max(12, cardRect.width - noRect.width - 24),
      y: Math.max(12, cardRect.height - noRect.height - 40),
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

      // Mobile browser chrome changes the viewport height while scrolling.
      // Re-pick a safe, visible spot instead of letting the button drift out of
      // view or under reflowed copy.
      setNoPos(pickDodgePosition(card, no, noPos))
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

      setNoPos(pickDodgePosition(card, no, noPos, pointer))

      const nextDodges = dodges + 1
      setDodges(nextDodges)
      if (nextDodges >= MAX_DODGES) {
        window.setTimeout(() => setNoGone(true), 260)
      }
    },
    [dodges, noGone, noPos],
  )

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
        {/* Reserve the changing counter's corner so the first dodge cannot land
            under the badge that appears after it. */}
        <div
          aria-hidden="true"
          data-dodge-avoid
          className="pointer-events-none absolute right-4 top-4 h-[28px] w-[70px] sm:right-5 sm:top-5"
        />
        <AnimatePresence>
          {dodges > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              data-dodge-avoid
              className="absolute right-4 top-4 z-20 min-w-[70px] rounded-full border border-line bg-cream px-3 py-1.5 text-center text-[9px] font-semibold tracking-[0.02em] text-muted shadow-[0_2px_10px_rgba(70,52,38,0.06)] sm:right-5 sm:top-5"
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

          <div className="mt-3.5 flex min-h-[22px] w-full items-center justify-center" data-dodge-avoid>
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
              onMouseEnter={(event) => {
                // Ignore the synthetic mouseenter some webviews emit after a
                // tap, otherwise one touch could burn two dodges.
                if (performance.now() - lastTouch.current < 800) return
                dodge({ x: event.clientX, y: event.clientY })
              }}
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse') return
                lastTouch.current = performance.now()
                if (event.cancelable) event.preventDefault()
                dodge({ x: event.clientX, y: event.clientY })
              }}
              onTouchStart={(event) => {
                // Pointer Events cover every supported browser. This is a
                // fallback for very old WebKit versions that lack them.
                if ('PointerEvent' in window) return
                lastTouch.current = performance.now()
                if (event.cancelable) event.preventDefault()
                const touch = event.touches[0]
                dodge(
                  touch
                    ? { x: touch.clientX, y: touch.clientY }
                    : undefined,
                )
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
              className={`absolute z-30 flex h-11 w-[96px] touch-manipulation select-none items-center justify-center whitespace-nowrap rounded-full border border-line bg-white px-2 text-[11.5px] font-semibold tracking-[-0.01em] text-muted shadow-[0_4px_14px_rgba(70,52,38,0.08)] transition-colors hover:border-coral/30 hover:text-coral ${
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
