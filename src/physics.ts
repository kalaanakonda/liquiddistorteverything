export interface PhysicsState {
  // Current blob position (screen coords)
  x: number
  y: number
  // Spring velocity
  vx: number
  vy: number
  // Current effective strength multiplier (0–1), used for decay
  strengthMult: number
  // Timestamp of last cursor movement
  lastMoveTime: number
  // Previous mouse position for velocity calculation
  prevMouseX: number
  prevMouseY: number
  // Current cursor velocity magnitude
  cursorSpeed: number
  // Ring buffer of recent blob positions for tail rendering
  history: Array<{ x: number; y: number }>
  // Minimum distance (px) between recorded history points
  _lastHistoryX: number
  _lastHistoryY: number
}

export function createPhysicsState(x: number, y: number): PhysicsState {
  return {
    x, y,
    vx: 0, vy: 0,
    strengthMult: 1,
    lastMoveTime: performance.now(),
    prevMouseX: x,
    prevMouseY: y,
    cursorSpeed: 0,
    history: [],
    _lastHistoryX: x,
    _lastHistoryY: y,
  }
}

export interface PhysicsParams {
  follow: number       // lag 0–1
  spring: boolean
  stiffness: number    // 0–1
  damping: number      // 0–1
  decay: number        // seconds, 0 = no decay
  velocityBoost: number
  tailLength: number   // max history entries
}

/**
 * Advances physics state one frame toward target (mouseX, mouseY).
 * Returns the updated state (mutates in place for perf).
 */
export function stepPhysics(
  state: PhysicsState,
  mouseX: number,
  mouseY: number,
  now: number,
  dt: number,           // seconds since last frame
  params: PhysicsParams,
): void {
  // ── Cursor speed ──
  const dmx = mouseX - state.prevMouseX
  const dmy = mouseY - state.prevMouseY
  state.cursorSpeed = Math.sqrt(dmx * dmx + dmy * dmy) / Math.max(dt, 0.001)
  if (dmx !== 0 || dmy !== 0) {
    state.lastMoveTime = now
  }
  state.prevMouseX = mouseX
  state.prevMouseY = mouseY

  // ── Position follow ──
  if (params.spring) {
    // Spring physics: F = stiffness * (target - pos), damping on velocity
    const fx = (mouseX - state.x) * params.stiffness
    const fy = (mouseY - state.y) * params.stiffness
    state.vx = (state.vx + fx) * params.damping
    state.vy = (state.vy + fy) * params.damping
    state.x += state.vx
    state.y += state.vy
  } else if (params.follow > 0) {
    // Lerp follow — follow=0 is instant, follow=1 never moves
    const lerpFactor = 1 - Math.pow(params.follow, 1 + dt * 60)
    state.x += (mouseX - state.x) * lerpFactor
    state.y += (mouseY - state.y) * lerpFactor
  } else {
    // Instant snap
    state.x = mouseX
    state.y = mouseY
  }

  // ── Decay ──
  if (params.decay > 0) {
    const timeSinceMove = (now - state.lastMoveTime) / 1000 // seconds
    if (timeSinceMove > 0) {
      // Fade from 1 → 0 over `decay` seconds
      state.strengthMult = Math.max(0, 1 - timeSinceMove / params.decay)
    } else {
      state.strengthMult = 1
    }
  } else {
    state.strengthMult = 1
  }

  // ── Record history for tail ──
  if (params.tailLength > 0) {
    const dx = state.x - state._lastHistoryX
    const dy = state.y - state._lastHistoryY
    const moved = Math.sqrt(dx * dx + dy * dy)
    // Record a new point every ~4px of blob movement to keep spacing even
    if (moved >= 4) {
      state.history.unshift({ x: state.x, y: state.y })
      state._lastHistoryX = state.x
      state._lastHistoryY = state.y
      if (state.history.length > params.tailLength) {
        state.history.length = params.tailLength
      }
    }
  } else {
    state.history.length = 0
  }
}

/**
 * Computes the effective strength multiplier including velocity boost.
 */
export function effectiveStrength(
  baseStrength: number,
  state: PhysicsState,
  velocityBoost: number,
): number {
  const boost = velocityBoost > 0
    ? 1 + Math.min(state.cursorSpeed / 300, 1) * velocityBoost
    : 1
  return baseStrength * state.strengthMult * boost
}
