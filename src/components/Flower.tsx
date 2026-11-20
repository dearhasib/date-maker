import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface FlowerProps {
  bloom?: number
  className?: string
  size?: number
}

export function Flower({ bloom = 0, className = '', size = 154 }: FlowerProps) {
  const reduceMotion = useReducedMotion()
  const uid = useId().replace(/:/g, '')
  const rotation = reduceMotion ? 0 : Math.min(bloom, 8) * 3.2
  const scale = 1 + Math.min(bloom, 8) * 0.006

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
      animate={{ opacity: 1, scale, rotate: rotation }}
      whileHover={reduceMotion ? undefined : { scale: scale + 0.035, rotate: rotation + 3 }}
      transition={{ type: 'spring', stiffness: 90, damping: 16 }}
      role="img"
      aria-label="A coral five-petal flower with one sage leaf"
    >
      <div className={reduceMotion ? 'h-full w-full' : 'h-full w-full animate-flower-sway'}>
        <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={`${uid}-petal`} cx="52%" cy="82%" r="86%">
              <stop offset="0%" stopColor="#FCE9E4" />
              <stop offset="48%" stopColor="#F7B9AB" />
              <stop offset="100%" stopColor="#F09380" />
            </radialGradient>
            <linearGradient id={`${uid}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4E2CA" />
              <stop offset="100%" stopColor="#A8C69F" />
            </linearGradient>
          </defs>

          <g transform="translate(100 100)">
            <path
              d="M0 7C-2 31 5 53 23 70"
              fill="none"
              stroke="#A8C69F"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.92"
            />
            <path
              d="M22 68C35 51 58 45 74 53C71 73 48 84 22 68Z"
              fill={`url(#${uid}-leaf)`}
              stroke="#91B085"
              strokeWidth="1.25"
            />
            <path
              d="M29 65C42 59 56 54 69 53"
              fill="none"
              stroke="#7F9D75"
              strokeWidth="1.1"
              strokeLinecap="round"
              opacity="0.5"
            />

            {[0, 72, 144, 216, 288].map((angle, index) => (
              <g key={angle} transform={`rotate(${angle})`} opacity={index === 0 ? 1 : 0.96}>
                <path
                  d="M0 4C-17 -7 -23 -29 -13 -49C-7 -61 7 -61 13 -49C23 -29 17 -7 0 4Z"
                  fill={`url(#${uid}-petal)`}
                  stroke="#E85D4A"
                  strokeOpacity="0.36"
                  strokeWidth="1.35"
                />
                <path
                  d="M0 -7C-1 -22 -1 -38 0 -51"
                  fill="none"
                  stroke="#E85D4A"
                  strokeOpacity="0.16"
                  strokeWidth="1.05"
                  strokeLinecap="round"
                />
              </g>
            ))}

            <circle
              cx="0"
              cy="0"
              r="7.5"
              fill="#FBE4DE"
              stroke="#E85D4A"
              strokeOpacity="0.4"
              strokeWidth="1.25"
            />
            <circle cx="0" cy="0" r="2.2" fill="#E85D4A" opacity="0.58" />
          </g>
        </svg>
      </div>
    </motion.div>
  )
}
