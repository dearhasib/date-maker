import { useMemo, type CSSProperties } from 'react'

interface PetalRainProps {
  count?: number
  className?: string
}

interface Petal {
  left: string
  size: number
  duration: string
  delay: string
  drift: string
  spin: string
  opacity: string
  color: string
  heart: boolean
}

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

export function PetalRain({ count = 20, className = '' }: PetalRainProps) {
  const petals = useMemo<Petal[]>(() => {
    const random = seededRandom(17)
    return Array.from({ length: count }, (_, index) => {
      const palette = ['#F3A493', '#F8C7BA', '#E85D4A', '#C5D6BA', '#F1B7AA']
      return {
        left: `${random() * 100}%`,
        size: 7 + random() * 12,
        duration: `${12 + random() * 11}s`,
        delay: `${-random() * 22}s`,
        drift: `${-70 + random() * 140}px`,
        spin: `${180 + random() * 420}deg`,
        opacity: `${0.18 + random() * 0.3}`,
        color: palette[Math.floor(random() * palette.length)],
        heart: index % 7 === 0,
      }
    })
  }, [count])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {petals.map((petal, index) => {
        const style = {
          left: petal.left,
          width: petal.size,
          height: petal.size,
          color: petal.color,
          animationDuration: petal.duration,
          animationDelay: petal.delay,
          '--petal-opacity': petal.opacity,
          '--petal-drift': petal.drift,
          '--petal-spin': petal.spin,
        } as CSSProperties

        return (
          <span
            key={index}
            className="absolute top-0 animate-petal-fall will-change-transform"
            style={style}
          >
            {petal.heart ? (
              <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
                <path d="M12 21s-7.1-4.4-9.6-8.1C.6 10 1.7 6.2 4.9 5.1 7 4.4 9.6 5.4 12 7.8c2.4-2.4 5-3.4 7.1-2.7 3.2 1.1 4.3 4.9 2.5 7.8C19.1 16.6 12 21 12 21Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
                <path d="M12 2C17 4.5 21.3 8.7 21.3 13.2c0 4.5-3.4 7.6-9.3 8.8-5.9-1.2-9.3-4.3-9.3-8.8C2.7 8.7 7 4.5 12 2Z" />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}
