import type { Shape } from './types'

/**
 * Returns a normalized distance value (0 = center, 1 = edge, >1 = outside)
 * for a given pixel relative to the blob center.
 *
 * ndx, ndy — pixel offset normalized by radius (so 1.0 = one radius away)
 */
export function shapeDist(
  ndx: number,
  ndy: number,
  shape: Shape,
  aspectRatio: number,
  cornerRadius: number,
): number {
  switch (shape) {
    case 'circle':
      return Math.sqrt(ndx * ndx + ndy * ndy)

    case 'ellipse': {
      // aspectRatio stretches X axis: wide ellipse = aspectRatio > 1
      const ex = ndx / aspectRatio
      return Math.sqrt(ex * ex + ndy * ndy)
    }

    case 'rect': {
      // Chebyshev / box distance — max of abs components
      return Math.max(Math.abs(ndx / aspectRatio), Math.abs(ndy))
    }

    case 'roundedRect': {
      // SDF for a rounded rectangle.
      // cr = corner radius as fraction of blob radius (clamped 0–0.99)
      const cr = Math.min(0.99, Math.max(0, cornerRadius))
      const hw = aspectRatio   // half-width in normalized units
      const hh = 1.0           // half-height
      // Inner box extents (shrunk by corner radius)
      const qx = Math.abs(ndx / hw) - (1 - cr)
      const qy = Math.abs(ndy / hh) - (1 - cr)
      const outside = Math.sqrt(
        Math.max(qx, 0) * Math.max(qx, 0) +
        Math.max(qy, 0) * Math.max(qy, 0),
      )
      const inside = Math.min(Math.max(qx, qy), 0)
      return (outside + inside) / cr
    }
  }
}
