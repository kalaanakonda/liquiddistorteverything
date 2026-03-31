import type { LiquidDistortOptions, PartialOptions } from './types'
import { shapeDist } from './shapes'
import { applyFalloff } from './falloff'
import { computeDisplacement } from './modes'
import {
  createPhysicsState,
  stepPhysics,
  effectiveStrength,
  type PhysicsState,
} from './physics'

const DEFAULTS: LiquidDistortOptions = {
  radius: 193,
  strength: 72,
  shape: 'circle',
  aspectRatio: 0.8,
  cornerRadius: 0.3,
  mode: 'attract',
  frequency: 3,
  falloff: 'smoothstep',
  follow: 0.98,
  spring: true,
  stiffness: 0.15,
  damping: 0.75,
  decay: 0.9,
  velocityBoost: 0,
  trigger: 'always',
  resolution: 0.15,
  tail: 0.14,
  tailLength: 68,
}

let filterIdCounter = 0

export class LiquidDistort {
  private el: HTMLElement
  private opts: LiquidDistortOptions

  // SVG / filter nodes
  private svgEl!: SVGSVGElement
  private feImg!: SVGFEImageElement
  private feDisplace!: SVGFEDisplacementMapElement
  private filterId!: string

  // Canvas
  private mapCanvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  // Physics
  private physics!: PhysicsState
  private mouseX = 0
  private mouseY = 0
  private isInside = false   // for hover trigger
  private clickActive = false // for click trigger

  // Animation
  private rafId = 0
  private lastTime = 0

  // Event handler refs (for cleanup)
  private onMouseMove!: (e: MouseEvent) => void
  private onMouseEnter!: () => void
  private onMouseLeave!: () => void
  private onMouseClick!: (e: MouseEvent) => void

  constructor(element: HTMLElement, options: PartialOptions = {}) {
    this.el = element
    this.opts = { ...DEFAULTS, ...options }
    this.init()
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  /** Update options live — takes effect on next frame. */
  setOptions(options: PartialOptions): void {
    this.opts = { ...this.opts, ...options }
    // Update SVG scale attribute immediately
    this.feDisplace.setAttribute('scale', String(this.opts.strength))
  }

  /** Remove all DOM changes and stop the animation loop. */
  destroy(): void {
    cancelAnimationFrame(this.rafId)
    this.svgEl.remove()
    this.el.style.filter = ''
    document.removeEventListener('mousemove', this.onMouseMove)
    this.el.removeEventListener('mouseenter', this.onMouseEnter)
    this.el.removeEventListener('mouseleave', this.onMouseLeave)
    this.el.removeEventListener('click', this.onMouseClick)
  }

  // ─────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────

  private init(): void {
    this.filterId = `liquid-distort-${++filterIdCounter}`

    // ── SVG filter ──
    this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svgEl.setAttribute('class', 'liquid-distort-svg')
    this.svgEl.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;'

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', this.filterId)
    filter.setAttribute('x', '0%')
    filter.setAttribute('y', '0%')
    filter.setAttribute('width', '100%')
    filter.setAttribute('height', '100%')
    filter.setAttribute('color-interpolation-filters', 'sRGB')

    this.feImg = document.createElementNS('http://www.w3.org/2000/svg', 'feImage')
    this.feImg.setAttribute('result', 'dmap')
    this.feImg.setAttribute('preserveAspectRatio', 'none')

    this.feDisplace = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
    this.feDisplace.setAttribute('in', 'SourceGraphic')
    this.feDisplace.setAttribute('in2', 'dmap')
    this.feDisplace.setAttribute('xChannelSelector', 'R')
    this.feDisplace.setAttribute('yChannelSelector', 'G')
    this.feDisplace.setAttribute('scale', String(this.opts.strength))

    filter.appendChild(this.feImg)
    filter.appendChild(this.feDisplace)
    defs.appendChild(filter)
    this.svgEl.appendChild(defs)
    document.body.appendChild(this.svgEl)

    // ── Apply filter to element ──
    this.el.style.filter = `url(#${this.filterId})`

    // ── Offscreen canvas ──
    this.mapCanvas = document.createElement('canvas')
    const ctx = this.mapCanvas.getContext('2d')
    if (!ctx) throw new Error('liquid-distort: Could not get 2d context')
    this.ctx = ctx

    // ── Physics initial state ──
    const rect = this.el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    this.mouseX = cx
    this.mouseY = cy
    this.physics = createPhysicsState(cx, cy)

    // ── Events ──
    this.onMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    }

    this.onMouseEnter = () => { this.isInside = true }
    this.onMouseLeave = () => { this.isInside = false }

    this.onMouseClick = (e: MouseEvent) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
      this.clickActive = true
      this.physics.strengthMult = 1
      this.physics.lastMoveTime = performance.now()
    }

    document.addEventListener('mousemove', this.onMouseMove)
    this.el.addEventListener('mouseenter', this.onMouseEnter)
    this.el.addEventListener('mouseleave', this.onMouseLeave)
    this.el.addEventListener('click', this.onMouseClick)

    // ── Start loop ──
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.render)
  }

  // ─────────────────────────────────────────────
  // Render loop
  // ─────────────────────────────────────────────

  private render = (now: number): void => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1) // cap at 100ms
    this.lastTime = now

    const o = this.opts

    // ── Determine if effect should be active ──
    let active = true
    if (o.trigger === 'hover') active = this.isInside
    if (o.trigger === 'click') active = this.clickActive

    // ── Advance physics ──
    stepPhysics(this.physics, this.mouseX, this.mouseY, now, dt, {
      follow: o.follow,
      spring: o.spring,
      stiffness: o.stiffness,
      damping: o.damping,
      decay: o.trigger === 'click' ? (o.decay > 0 ? o.decay : 1.5) : o.decay,
      velocityBoost: o.velocityBoost,
      tailLength: o.tail > 0 ? o.tailLength : 0,
    })

    // For click trigger, check if decayed fully
    if (o.trigger === 'click' && this.physics.strengthMult <= 0.01) {
      this.clickActive = false
    }

    // ── Build displacement map ──
    this.updateMap(active)

    this.rafId = requestAnimationFrame(this.render)
  }

  private updateMap(active: boolean): void {
    const o = this.opts
    const rect = this.el.getBoundingClientRect()
    const pw = rect.width
    const ph = rect.height

    const scale = o.resolution
    const cw = Math.max(4, Math.round(pw * scale))
    const ch = Math.max(4, Math.round(ph * scale))

    if (this.mapCanvas.width !== cw || this.mapCanvas.height !== ch) {
      this.mapCanvas.width = cw
      this.mapCanvas.height = ch
    }

    // Use float accumulators so multiple blobs add together cleanly
    const pixCount = cw * ch
    const rdxBuf = new Float32Array(pixCount)
    const rdyBuf = new Float32Array(pixCount)

    if (active) {
      const str = effectiveStrength(1, this.physics, o.velocityBoost)

      // ── Build list of blobs to render: [x, y, strengthMultiplier] ──
      // Index 0 = current blob (full strength)
      // Index 1..n = tail history (linearly fading)
      const blobs: Array<{ bx: number; by: number; s: number }> = []

      if (str > 0.01) {
        blobs.push({ bx: this.physics.x, by: this.physics.y, s: str })
      }

      if (o.tail > 0 && this.physics.history.length > 0) {
        const hist = this.physics.history
        for (let i = 0; i < hist.length; i++) {
          // Fade linearly from `tail` at index 0 → 0 at the end
          const t = 1 - (i + 1) / hist.length
          const tailStr = t * o.tail * str
          if (tailStr > 0.005) {
            blobs.push({ bx: hist[i].x, by: hist[i].y, s: tailStr })
          }
        }
      }

      // ── Render each blob into the float buffers ──
      const crxBase = (o.radius / pw) * cw * o.aspectRatio
      const cryBase = (o.radius / ph) * ch
      const pad = 1.6

      for (const { bx, by, s } of blobs) {
        const ccx = ((bx - rect.left) / pw) * cw
        const ccy = ((by - rect.top) / ph) * ch

        const x0 = Math.max(0, Math.floor(ccx - crxBase * pad))
        const x1 = Math.min(cw - 1, Math.ceil(ccx + crxBase * pad))
        const y0 = Math.max(0, Math.floor(ccy - cryBase * pad))
        const y1 = Math.min(ch - 1, Math.ceil(ccy + cryBase * pad))

        for (let py = y0; py <= y1; py++) {
          for (let px = x0; px <= x1; px++) {
            const ndx = (px - ccx) / crxBase
            const ndy = (py - ccy) / cryBase

            const dist = shapeDist(ndx, ndy, o.shape, o.aspectRatio, o.cornerRadius)
            if (dist > 1.0) continue

            const falloff = applyFalloff(dist, o.falloff) * s
            const [rdx, rdy] = computeDisplacement(ndx, ndy, dist, falloff, o.mode, o.frequency)

            const idx = py * cw + px
            rdxBuf[idx] += rdx
            rdyBuf[idx] += rdy
          }
        }
      }
    }

    // ── Write float buffers into ImageData ──
    const imgData = this.ctx.createImageData(cw, ch)
    const data = imgData.data
    for (let i = 0; i < pixCount; i++) {
      const base = i * 4
      data[base]     = Math.max(0, Math.min(255, 128 + rdxBuf[i] * 127))
      data[base + 1] = Math.max(0, Math.min(255, 128 + rdyBuf[i] * 127))
      data[base + 2] = 128
      data[base + 3] = 255
    }

    this.ctx.putImageData(imgData, 0, 0)
    this.pushToFilter()
  }

  private pushToFilter(): void {
    const dataUrl = this.mapCanvas.toDataURL()
    this.feImg.setAttribute('href', dataUrl)
    this.feImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
  }
}
