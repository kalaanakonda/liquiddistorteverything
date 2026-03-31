export interface PhysicsState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    strengthMult: number;
    lastMoveTime: number;
    prevMouseX: number;
    prevMouseY: number;
    cursorSpeed: number;
    history: Array<{
        x: number;
        y: number;
    }>;
    _lastHistoryX: number;
    _lastHistoryY: number;
}
export declare function createPhysicsState(x: number, y: number): PhysicsState;
export interface PhysicsParams {
    follow: number;
    spring: boolean;
    stiffness: number;
    damping: number;
    decay: number;
    velocityBoost: number;
    tailLength: number;
}
/**
 * Advances physics state one frame toward target (mouseX, mouseY).
 * Returns the updated state (mutates in place for perf).
 */
export declare function stepPhysics(state: PhysicsState, mouseX: number, mouseY: number, now: number, dt: number, // seconds since last frame
params: PhysicsParams): void;
/**
 * Computes the effective strength multiplier including velocity boost.
 */
export declare function effectiveStrength(baseStrength: number, state: PhysicsState, velocityBoost: number): number;
