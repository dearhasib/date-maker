import confetti from 'canvas-confetti'

const colors = ['#E85D4A', '#F3A493', '#F9C8BD', '#C5D6BA', '#F6D8C9', '#FFFFFF']

let shapes: confetti.Shape[] | null = null

function getShapes(): confetti.Shape[] {
  if (shapes) return shapes

  const petal = confetti.shapeFromPath({
    path: 'M50 4C73 13 94 33 94 56C94 79 76 96 50 96C24 96 6 79 6 56C6 33 27 13 50 4Z',
  })

  const heart = confetti.shapeFromPath({
    path: 'M50 88C20 67 4 49 4 30C4 14 16 4 30 4C39 4 47 9 50 17C53 9 61 4 70 4C84 4 96 14 96 30C96 49 80 67 50 88Z',
  })

  shapes = [petal, heart]
  return shapes
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function celebrate(): void {
  if (prefersReducedMotion()) return

  const shared = getShapes()

  confetti({
    particleCount: 44,
    spread: 78,
    startVelocity: 44,
    decay: 0.91,
    gravity: 0.9,
    ticks: 240,
    scalar: 1.12,
    origin: { x: 0.5, y: 0.62 },
    colors,
    shapes: shared,
    disableForReducedMotion: true,
    zIndex: 80,
  })

  window.setTimeout(() => {
    confetti({
      particleCount: 34,
      angle: 62,
      spread: 62,
      startVelocity: 42,
      decay: 0.92,
      gravity: 0.95,
      ticks: 220,
      scalar: 0.96,
      origin: { x: 0.08, y: 0.72 },
      colors,
      shapes: shared,
      disableForReducedMotion: true,
      zIndex: 80,
    })
    confetti({
      particleCount: 34,
      angle: 118,
      spread: 62,
      startVelocity: 42,
      decay: 0.92,
      gravity: 0.95,
      ticks: 220,
      scalar: 0.96,
      origin: { x: 0.92, y: 0.72 },
      colors,
      shapes: shared,
      disableForReducedMotion: true,
      zIndex: 80,
    })
  }, 150)
}

export function clearConfetti(): void {
  confetti.reset()
}

export function softCelebrate(): void {
  if (prefersReducedMotion()) return

  confetti({
    particleCount: 24,
    spread: 62,
    startVelocity: 30,
    decay: 0.92,
    gravity: 0.75,
    ticks: 200,
    scalar: 0.72,
    origin: { x: 0.5, y: 0.55 },
    colors,
    shapes: getShapes(),
    disableForReducedMotion: true,
    zIndex: 80,
  })
}
