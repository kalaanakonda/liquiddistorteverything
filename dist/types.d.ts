export type Shape = 'circle' | 'ellipse' | 'rect' | 'roundedRect';
export type Mode = 'refract' | 'attract' | 'swirl' | 'ripple' | 'wave';
export type Falloff = 'smoothstep' | 'linear' | 'exponential' | 'cosine';
export type Trigger = 'always' | 'hover' | 'click';
export interface LiquidDistortOptions {
    /**
     * Radius of the distortion blob in pixels.
     * @default 100
     */
    radius: number;
    /**
     * Overall displacement strength. Maps to SVG feDisplacementMap scale.
     * @default 80
     */
    strength: number;
    /**
     * Shape of the distortion zone.
     * - 'circle'      — uniform radius (default)
     * - 'ellipse'     — stretched by aspectRatio
     * - 'rect'        — rectangular zone
     * - 'roundedRect' — rounded rectangle
     * @default 'circle'
     */
    shape: Shape;
    /**
     * Stretch the shape horizontally. Values > 1 widen, < 1 narrow.
     * Only applies to 'ellipse' and 'roundedRect'.
     * @default 1
     */
    aspectRatio: number;
    /**
     * Corner radius as a fraction of radius (0–1).
     * Only applies to 'roundedRect'.
     * @default 0.3
     */
    cornerRadius: number;
    /**
     * Displacement mode — what kind of distortion is applied.
     * - 'refract'  — push content outward (convex lens)
     * - 'attract'  — pull content inward (concave lens)
     * - 'swirl'    — rotate content around center
     * - 'ripple'   — concentric sine-wave rings
     * - 'wave'     — horizontal sine wave
     * @default 'refract'
     */
    mode: Mode;
    /**
     * Ripple frequency (rings per blob radius). Only used in 'ripple' and 'wave' modes.
     * @default 3
     */
    frequency: number;
    /**
     * Falloff curve — how sharply the effect fades toward the blob edge.
     * - 'smoothstep'   — smooth S-curve (default)
     * - 'linear'       — even fade
     * - 'exponential'  — sharp center, soft edge
     * - 'cosine'       — gentle S-curve
     * @default 'smoothstep'
     */
    falloff: Falloff;
    /**
     * Cursor follow lag (0–1). 0 = instant snap, higher = more lag.
     * The blob position lerps toward the cursor each frame.
     * @default 0  (instant)
     */
    follow: number;
    /**
     * Enable spring physics for cursor following.
     * Overrides `follow` — blob overshoots and oscillates like a spring.
     * @default false
     */
    spring: boolean;
    /**
     * Spring stiffness (0–1). Higher = snappier. Only used when spring=true.
     * @default 0.15
     */
    stiffness: number;
    /**
     * Spring damping (0–1). Higher = less oscillation. Only used when spring=true.
     * @default 0.75
     */
    damping: number;
    /**
     * Seconds for the effect to fully fade out after the cursor stops moving.
     * 0 = no decay (always visible).
     * @default 0
     */
    decay: number;
    /**
     * Boost strength when cursor is moving fast.
     * Multiplier applied proportional to cursor velocity. 0 = disabled.
     * @default 0
     */
    velocityBoost: number;
    /**
     * What triggers the effect.
     * - 'always' — always active
     * - 'hover'  — only when cursor is inside the target element
     * - 'click'  — burst on click, then decays
     * @default 'always'
     */
    trigger: Trigger;
    /**
     * Canvas resolution scale (canvas pixels per page pixel).
     * Lower = faster, higher = sharper displacement map.
     * @default 0.15
     */
    resolution: number;
    /**
     * Tail strength (0–1). How strongly the trail left behind the cursor is rendered.
     * 0 = no tail (single blob only), 1 = full-strength tail.
     * @default 0
     */
    tail: number;
    /**
     * Number of historical cursor positions to keep for the tail.
     * More = longer tail. Each point is rendered as a fading blob.
     * @default 24
     */
    tailLength: number;
}
export type PartialOptions = Partial<LiquidDistortOptions>;
