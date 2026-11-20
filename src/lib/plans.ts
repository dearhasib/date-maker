export const PLANS = [
  {
    id: 'coffee',
    label: 'Coffee',
    emoji: '☕',
    phrase: 'coffee',
    ariaLabel: 'Coffee',
  },
  {
    id: 'movie',
    label: 'A movie',
    emoji: '🎬',
    phrase: 'a movie',
    ariaLabel: 'A movie',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    emoji: '🍝',
    phrase: 'dinner',
    ariaLabel: 'Dinner',
  },
  {
    id: 'walk',
    label: 'Walk in the park',
    emoji: '🌳',
    phrase: 'a walk in the park',
    ariaLabel: 'Walk in the park',
  },
  {
    id: 'drinks',
    label: 'Drinks',
    emoji: '🍸',
    phrase: 'drinks',
    ariaLabel: 'Drinks',
  },
  {
    id: 'surprise',
    label: 'Surprise me',
    emoji: '🎁',
    phrase: 'a little surprise',
    ariaLabel: 'Surprise me',
  },
] as const

export type PlanId = (typeof PLANS)[number]['id']
export type Plan = (typeof PLANS)[number]

export function isPlanId(value: string | null): value is PlanId {
  return PLANS.some((plan) => plan.id === value)
}

export function getPlan(id: PlanId): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0]
}
