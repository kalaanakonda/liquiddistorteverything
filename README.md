# liquid-distort

Cursor-driven liquid distortion effect for any DOM element. Warps text, images, and UI using SVG displacement maps — no WebGL, no canvas overlay, no dependencies.

**9kb gzipped. Zero dependencies. Works with any framework.**

---

## Install

```bash
npm install liquid-distort
```

Or via CDN (no bundler needed):

```html
<script src="https://cdn.jsdelivr.net/npm/liquid-distort/dist/liquid-distort.umd.cjs"></script>
```

---

## Quick start

```js
import { LiquidDistort } from 'liquid-distort'

new LiquidDistort(document.getElementById('hero'))
```

That's it. The effect attaches to the element and follows the cursor automatically.

---

## Framework examples

**React**
```jsx
import { useEffect, useRef } from 'react'
import { LiquidDistort } from 'liquid-distort'

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const effect = new LiquidDistort(ref.current)
    return () => effect.destroy()
  }, [])

  return <section ref={ref}>...</section>
}
```

**Vue**
```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { LiquidDistort } from 'liquid-distort'

const el = ref(null)
let effect

onMounted(() => effect = new LiquidDistort(el.value))
onUnmounted(() => effect.destroy())
</script>

<template>
  <section ref="el">...</section>
</template>
```

**Svelte**
```svelte
<script>
import { LiquidDistort } from 'liquid-distort'

function distort(node) {
  const effect = new LiquidDistort(node)
  return { destroy: () => effect.destroy() }
}
</script>

<section use:distort>...</section>
```

**Plain HTML (CDN)**
```html
<script src="https://cdn.jsdelivr.net/npm/liquid-distort/dist/liquid-distort.umd.cjs"></script>
<script>
  new LiquidDistort.LiquidDistort(document.querySelector('main'))
</script>
```

---

## Excluding elements

Apply the effect to a specific container — everything outside it stays untouched:

```html
<!-- No effect — lives outside the filtered section -->
<nav>...</nav>
<button class="cta">Buy Now</button>

<!-- Gets the distortion -->
<section id="hero">
  <h1>Big headline</h1>
  <img src="photo.jpg" />
</section>

<!-- No effect -->
<footer>...</footer>
```

```js
new LiquidDistort(document.getElementById('hero'))
```

---

## Options

```js
new LiquidDistort(element, {
  // Zone
  radius: 193,         // Blob radius in px
  shape: 'circle',     // 'circle' | 'ellipse' | 'rect' | 'roundedRect'
  aspectRatio: 0.8,    // Stretch shape X axis (ellipse / roundedRect)
  cornerRadius: 0.3,   // Corner radius for roundedRect (0–1)

  // Effect
  mode: 'attract',     // 'refract' | 'attract' | 'swirl' | 'ripple' | 'wave'
  strength: 72,        // Displacement intensity
  frequency: 3,        // Ring count (ripple / wave modes)
  falloff: 'smoothstep', // 'smoothstep' | 'linear' | 'exponential' | 'cosine'

  // Physics
  follow: 0.98,        // Cursor lag (0 = instant, ~1 = heavy lag)
  spring: true,        // Springy overshoot physics
  stiffness: 0.15,     // Spring stiffness
  damping: 0.75,       // Spring damping
  decay: 0.9,          // Seconds to fade after cursor stops (0 = always on)
  velocityBoost: 0,    // Boost strength when moving fast

  // Tail
  tail: 0.14,          // Trail strength (0 = no tail, 1 = full)
  tailLength: 68,      // Number of trail history points

  // Trigger
  trigger: 'always',   // 'always' | 'hover' | 'click'

  // Performance
  resolution: 0.15,    // Canvas scale (lower = faster)
})
```

### Modes

| Mode | Effect |
|------|--------|
| `refract` | Pushes content outward — convex glass lens |
| `attract` | Pulls content inward — gravity well |
| `swirl` | Spins content around the cursor |
| `ripple` | Concentric sine-wave rings |
| `wave` | Horizontal sine wave |

### Shapes

| Shape | Description |
|-------|-------------|
| `circle` | Uniform circular zone |
| `ellipse` | Stretched by `aspectRatio` |
| `rect` | Rectangular zone |
| `roundedRect` | Rounded rectangle |

---

## API

```js
const effect = new LiquidDistort(element, options)

// Update any option live
effect.setOptions({ mode: 'swirl', strength: 120 })

// Remove effect and clean up all DOM changes
effect.destroy()
```

---

## How it works

The effect renders a tiny off-screen canvas every frame — a displacement map where pixel color encodes direction and magnitude of distortion. This map is fed into an SVG `feDisplacementMap` filter which the browser applies to your element in GPU hardware.

No WebGL. No DOM overlay. Just two browser APIs (Canvas 2D + SVG filters) doing the heavy lifting.

---

## License

[MIT](LICENSE)
