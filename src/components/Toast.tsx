import { AnimatePresence, motion } from 'framer-motion'
import { Check, Heart } from 'lucide-react'

export interface ToastData {
  id: number
  message: string
  tone?: 'success' | 'error'
}

interface ToastProps {
  toast: ToastData | null
}

export function Toast({ toast }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[120] flex justify-center px-4"
    >
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border border-line bg-white px-4 py-3 text-[12px] font-medium text-ink shadow-soft"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                toast.tone === 'error'
                  ? 'bg-coral-pale text-coral'
                  : 'bg-sage-pale text-sage-ink'
              }`}
            >
              {toast.tone === 'error' ? (
                <Heart size={13} fill="currentColor" />
              ) : (
                <Check size={14} strokeWidth={2.5} />
              )}
            </span>
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
