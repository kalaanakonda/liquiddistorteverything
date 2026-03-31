import type { Falloff } from './types'

/**
 * Given a normalized distance t ∈ [0, 1], returns a falloff weight ∈ [0, 1].
 * 1 at center (t=0), 0 at edge (t=1).
 */
export function applyFalloff(t: number, curve: Falloff): number {
  // clamp
  const c = Math.min(1, Math.max(0, t))
  switch (curve) {
    case 'smoothstep':
      // 3t²-2t³ — classic smooth S curve
      return 1 - c * c * (3 - 2 * c)

    case 'linear':
      return 1 - c

    case 'exponential':
      // Stays strong near center, drops sharply near edge
      return 1 - Math.pow(c, 2.5)

    case 'cosine':
      return (1 + Math.cos(Math.PI * c)) * 0.5
  }
}
