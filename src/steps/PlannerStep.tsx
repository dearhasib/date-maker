import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, Clock3, LockKeyhole } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import {
  isValidDateString,
  isValidTimeString,
  todayISO,
  type PlanSelection,
} from '../lib/date'
import { PLANS, type PlanId } from '../lib/plans'

interface PlannerStepProps {
  onSeal: (selection: PlanSelection) => void
  initialSelection?: PlanSelection | null
}

interface PickerFieldProps {
  type: 'date' | 'time'
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  min?: string
  icon: ReactNode
}

function PickerField({
  type,
  value,
  onChange,
  placeholder,
  label,
  min,
  icon,
}: PickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function openPicker() {
    const input = inputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // Fall back to focus for Safari versions that reject showPicker().
      }
    }

    try {
      input.focus({ preventScroll: true })
    } catch {
      input.focus()
    }
  }

  return (
    <span className="field-shell group cursor-pointer" onClick={openPicker}>
      <span
        aria-hidden="true"
        className={`pointer-events-none shrink-0 whitespace-nowrap pr-5 text-[11px] font-medium tabular-nums tracking-[-0.01em] sm:text-[13px] ${
          value ? 'text-ink' : 'text-muted/45'
        }`}
      >
        {value || placeholder}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 text-muted/70 transition-colors group-focus-within:text-coral/80 sm:right-3"
      >
        {icon}
      </span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        min={min}
        step={type === 'time' ? 60 : undefined}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => {
          event.stopPropagation()
          openPicker()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === 'ArrowDown') {
            event.preventDefault()
            openPicker()
          }
        }}
        className="native-date-time-input absolute inset-0 h-full min-h-[52px] w-full cursor-pointer appearance-none rounded-2xl border-0 bg-transparent p-0 text-[16px] text-transparent opacity-0 outline-none"
        aria-label={label}
        autoComplete="off"
        required
      />
    </span>
  )
}

export function PlannerStep({ onSeal, initialSelection }: PlannerStepProps) {
  const [date, setDate] = useState(initialSelection?.date ?? '')
  const [time, setTime] = useState(initialSelection?.time ?? '')
  const [plan, setPlan] = useState<PlanId | null>(
    initialSelection?.plan ?? null,
  )
  const reduceMotion = useReducedMotion()

  const dateIsValid =
    isValidDateString(date) && date >= todayISO()
  const canSeal = Boolean(dateIsValid && isValidTimeString(time) && plan)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSeal || !isValidDateString(date) || !isValidTimeString(time) || !plan) {
      return
    }
    onSeal({ date, time, plan })
  }

  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px]"
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <Badge>Let&apos;s make it official</Badge>

          <h1 className="mt-6 text-balance text-center font-serif text-[2.5rem] font-medium leading-[1.03] tracking-[-0.035em] text-ink sm:text-[2.75rem]">
            Pick the <em className="italic text-coral">day</em>,
            <br />
            <em className="italic text-coral">time</em> &amp; plan
          </h1>

          <div className="mt-7 grid w-full grid-cols-2 gap-3">
            <label className="min-w-0">
              <span className="eyebrow mb-2 block text-[9px]">Which day?</span>
              <PickerField
                type="date"
                value={date}
                onChange={setDate}
                min={todayISO()}
                placeholder="YYYY-MM-DD"
                label="Choose the day"
                icon={<CalendarDays size={15} strokeWidth={1.9} />}
              />
            </label>

            <label className="min-w-0">
              <span className="eyebrow mb-2 block text-[9px]">What time?</span>
              <PickerField
                type="time"
                value={time}
                onChange={setTime}
                placeholder="HH:MM"
                label="Choose the time"
                icon={<Clock3 size={15} strokeWidth={1.9} />}
              />
            </label>
          </div>

          <div className="mt-6 flex w-full items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="eyebrow text-[9px]">The plan</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div
            role="group"
            aria-label="Choose the plan"
            className="mt-3.5 grid w-full grid-cols-2 gap-2"
          >
            {PLANS.map((option) => {
              const selected = plan === option.id
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setPlan(option.id)}
                  whileTap={{ scale: 0.97 }}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  className={`flex min-h-[44px] items-center justify-center gap-1 rounded-full border px-2 py-2 text-[11.5px] font-medium tracking-[-0.01em] transition-colors duration-200 sm:gap-1.5 sm:px-2.5 sm:text-[12.5px] ${
                    selected
                      ? 'border-coral bg-coral text-white shadow-[0_6px_16px_rgba(232,93,74,0.22)]'
                      : 'border-line bg-white text-ink hover:border-sage-dark/70 hover:bg-sage-pale/70'
                  }`}
                >
                  <span aria-hidden="true">{option.emoji}</span>
                  <span>{option.label}</span>
                </motion.button>
              )
            })}
          </div>

          <motion.button
            type="submit"
            disabled={!canSeal}
            animate={canSeal ? { scale: [1, 1.012, 1] } : { scale: 1 }}
            transition={
              canSeal
                ? { duration: 0.45, ease: 'easeOut' }
                : { duration: 0.2 }
            }
            whileHover={canSeal && !reduceMotion ? { y: -1.5 } : undefined}
            whileTap={canSeal ? { scale: 0.985 } : undefined}
            className="primary-button mt-7"
          >
            {canSeal ? (
              <>
                <span>Seal it with a letter</span>
                <span aria-hidden="true">💌</span>
              </>
            ) : (
              <>
                <span>Pick day, time &amp; plan</span>
                <span aria-hidden="true">✍️</span>
              </>
            )}
          </motion.button>

          <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-medium text-muted/80">
            <LockKeyhole size={11} strokeWidth={2} aria-hidden="true" />
            Your plans stay inside this little link.
          </p>
        </form>
      </Card>
    </motion.div>
  )
}
