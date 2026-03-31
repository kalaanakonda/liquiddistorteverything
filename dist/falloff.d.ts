import type { Falloff } from './types';
/**
 * Given a normalized distance t ∈ [0, 1], returns a falloff weight ∈ [0, 1].
 * 1 at center (t=0), 0 at edge (t=1).
 */
export declare function applyFalloff(t: number, curve: Falloff): number;
