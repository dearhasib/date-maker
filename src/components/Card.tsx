import { forwardRef, type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className = '', padded = true, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`relative w-full max-w-[460px] rounded-3xl bg-white shadow-card ${
        padded ? 'px-6 py-8 sm:px-9 sm:py-10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
