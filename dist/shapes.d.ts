import type { Shape } from './types';
/**
 * Returns a normalized distance value (0 = center, 1 = edge, >1 = outside)
 * for a given pixel relative to the blob center.
 *
 * ndx, ndy — pixel offset normalized by radius (so 1.0 = one radius away)
 */
export declare function shapeDist(ndx: number, ndy: number, shape: Shape, aspectRatio: number, cornerRadius: number): number;
