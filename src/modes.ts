import type { Mode } from './types'

/**
 * Given a point's normalized offset from blob center (ndx, ndy),
 * its normalized distance (dist), falloff weight, and mode-specific params,
 * returns [rdx, rdy] — displacement values in range [-1, 1].
 *
 * These get mapped to [0, 255] pixel values:
 *   128 + rdx * 127  →  R channel (X displacement)
 *   128 + rdy * 127  →  G channel (Y displacement)
 */
export function computeDisplacement(
  ndx: number,
  ndy: number,
  dist: number,
  falloff: number,
  mode: Mode,
  frequency: number,
): [number, number] {
  const safeDist = dist + 0.0001

  switch (mode) {
    case 'refract': {
      // Push content outward from center — convex lens
      const rdx = (ndx / safeDist) * 0.7 * falloff
      const rdy = (ndy / safeDist) * 0.7 * falloff
      return [rdx, rdy]
    }

    case 'attract': {
      // Pull content inward toward center — concave lens / gravity well
      const rdx = -(ndx / safeDist) * 0.7 * falloff
      const rdy = -(ndy / safeDist) * 0.7 * falloff
      return [rdx, rdy]
    }

    case 'swirl': {
      // Rotate displacement direction 90° — content spirals around center
      // Normal direction is (ndx/dist, ndy/dist); perpendicular is (-ndy/dist, ndx/dist)
      const rdx = (-ndy / safeDist) * 0.7 * falloff
      const rdy = (ndx / safeDist) * 0.7 * falloff
      return [rdx, rdy]
    }

    case 'ripple': {
      // Concentric sine rings radiating outward
      // dist goes 0→1 inside blob; multiply by frequency for ring count
      const wave = Math.sin(dist * frequency * Math.PI)
      const rdx = (ndx / safeDist) * wave * 0.7 * falloff
      const rdy = (ndy / safeDist) * wave * 0.7 * falloff
      return [rdx, rdy]
    }

    case 'wave': {
      // Horizontal sine wave — only displaces vertically based on X position
      // ndx goes -1→1 across blob width
      const wave = Math.sin(ndx * frequency * Math.PI)
      const rdx = 0
      const rdy = wave * 0.7 * falloff
      return [rdx, rdy]
    }
  }
}
