import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Flower } from '../components/Flower'
import { celebrate } from '../lib/confetti'

interface ConfirmedStepProps {
  onPlan: () => void
}

export function ConfirmedStep({ onPlan }: ConfirmedStepProps) {
  const fired = useRef(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const timer = window.setTimeout(() => celebrate(), 140)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <motion.div
      key="confirmed"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <Card>
        <div className="flex flex-col items-center text-center">
          <Badge
            icon={<Heart size={10} fill="currentColor" className="text-coral" />}
          >
            Date confirmed
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 text-balance font-serif text-[2.55rem] font-medium leading-[1.05] tracking-[-0.035em] text-ink sm:text-[2.85rem]"
          >
            Yay — it&apos;s a <em className="italic text-coral">date</em>.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 100, damping: 15 }}
            className="relative mt-2"
          >
            <span className="absolute inset-6 -z-10 rounded-full bg-coral-pale/60 blur-2xl" />
            <Flower bloom={4} size={200} />
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.4, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 240, damping: 16 }}
              className="absolute -right-3 top-7 text-coral"
            >
              <Heart size={18} fill="currentColor" />
            </motion.span>
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.4, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.68, type: 'spring', stiffness: 240, damping: 16 }}
              className="absolute -left-5 bottom-12 text-sage-dark"
            >
              <Sparkle />
            </motion.span>
          </motion.div>

          <p className="mt-1 text-[13.5px] font-medium text-muted">
            See? That wasn&apos;t so hard 💛
          </p>

          <motion.button
            type="button"
            onClick={onPlan}
            whileHover={reduceMotion ? undefined : { y: -1.5 }}
            whileTap={{ scale: 0.985 }}
            className="primary-button mt-7"
          >
            Now let&apos;s plan it
            <ArrowRight size={16} strokeWidth={2.4} />
            <span aria-hidden="true">💌</span>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  )
}

function Sparkle() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 1.5c.5 4.7 3.8 8 8.5 8.5-4.7.5-8 3.8-8.5 8.5C9.5 13.8 6.2 10.5 1.5 10 6.2 9.5 9.5 6.2 10 1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
