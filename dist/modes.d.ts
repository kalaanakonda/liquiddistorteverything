import type { Mode } from './types';
/**
 * Given a point's normalized offset from blob center (ndx, ndy),
 * its normalized distance (dist), falloff weight, and mode-specific params,
 * returns [rdx, rdy] — displacement values in range [-1, 1].
 *
 * These get mapped to [0, 255] pixel values:
 *   128 + rdx * 127  →  R channel (X displacement)
 *   128 + rdy * 127  →  G channel (Y displacement)
 */
export declare function computeDisplacement(ndx: number, ndy: number, dist: number, falloff: number, mode: Mode, frequency: number): [number, number];
