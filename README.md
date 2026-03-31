# liquid-distort

Cursor-driven liquid distortion effect for any DOM element. Warps text, images, and UI using SVG displacement maps — no WebGL, no canvas overlay, no dependencies.

**9kb gzipped. Zero dependencies. Works with any framework.**

## Live Demo

- Vercel: https://liquiddistorteverything.vercel.app
- GitHub Pages: https://kalaanakonda.github.io/liquiddistorteverything/

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

## Try it on any website — no install needed

Want to test the effect before adding it to your project? Paste this into Chrome DevTools console (`F12` → Console tab) on **any website** and hit Enter:

```js
!function(){function aF(t){const e=Math.min(1,Math.max(0,t));return(1+Math.cos(Math.PI*e))*.5}function cS(t,i){return{x:t,y:i,vx:0,vy:0,strengthMult:1,lastMoveTime:performance.now(),prevMouseX:t,prevMouseY:i,history:[],_lastHistoryX:t,_lastHistoryY:i}}function sP(t,i,e,h){const r=i-t.prevMouseX,n=e-t.prevMouseY;if(r||n)t.lastMoveTime=h;t.prevMouseX=i;t.prevMouseY=e;const o=(i-t.x)*.08,a=(e-t.y)*.08;t.vx=(t.vx+o)*.83;t.vy=(t.vy+a)*.83;t.x+=t.vx;t.y+=t.vy;const d=(h-t.lastMoveTime)/1e3;t.strengthMult=d>0?Math.max(0,1-d/1.5):1;const ox=t.x-t._lastHistoryX,oy=t.y-t._lastHistoryY;if(Math.sqrt(ox*ox+oy*oy)>=4){t.history.unshift({x:t.x,y:t.y});t._lastHistoryX=t.x;t._lastHistoryY=t.y;if(t.history.length>45)t.history.length=45}}document.getElementById('_ld')?.remove();document.documentElement.style.filter='';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='_ld';svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;top:0;left:0';const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');const filter=document.createElementNS('http://www.w3.org/2000/svg','filter');filter.id='_ldf';filter.setAttribute('x','-20%');filter.setAttribute('y','-20%');filter.setAttribute('width','140%');filter.setAttribute('height','140%');const feImg=document.createElementNS('http://www.w3.org/2000/svg','feImage');feImg.setAttribute('result','dmap');feImg.setAttribute('preserveAspectRatio','none');const feDis=document.createElementNS('http://www.w3.org/2000/svg','feDisplacementMap');feDis.setAttribute('in','SourceGraphic');feDis.setAttribute('in2','dmap');feDis.setAttribute('xChannelSelector','R');feDis.setAttribute('yChannelSelector','G');feDis.setAttribute('scale','50');filter.appendChild(feImg);filter.appendChild(feDis);defs.appendChild(filter);svg.appendChild(defs);document.body.appendChild(svg);document.documentElement.style.filter='url(#_ldf)';const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');const phys=cS(window.innerWidth/2,window.innerHeight/2);let mX=window.innerWidth/2,mY=window.innerHeight/2,lastT=performance.now(),cb=null;document.addEventListener('mousemove',e=>{mX=e.clientX;mY=e.clientY});function render(now){const dt=Math.min((now-lastT)/1e3,.1);lastT=now;sP(phys,mX,mY,now,dt);const vw=window.innerWidth,vh=window.innerHeight;const cw=Math.max(4,Math.round(vw*.15)),ch=Math.max(4,Math.round(vh*.15));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}const pc=cw*ch,rdx=new Float32Array(pc),rdy=new Float32Array(pc);const blobs=[{bx:phys.x,by:phys.y,s:phys.strengthMult}];phys.history.forEach((p,i)=>{const t=(1-(i+1)/phys.history.length)*.1*phys.strengthMult;if(t>.005)blobs.push({bx:p.x,by:p.y,s:t})});const crx=(110/vw)*cw*.8,cry=(110/vh)*ch,pad=1.6;for(const{bx,by,s}of blobs){const ccx=(bx/vw)*cw,ccy=(by/vh)*ch;const x0=Math.max(0,Math.floor(ccx-crx*pad)),x1=Math.min(cw-1,Math.ceil(ccx+crx*pad));const y0=Math.max(0,Math.floor(ccy-cry*pad)),y1=Math.min(ch-1,Math.ceil(ccy+cry*pad));for(let py=y0;py<=y1;py++)for(let px=x0;px<=x1;px++){const ndx=(px-ccx)/crx,ndy=(py-ccy)/cry;const dist=Math.sqrt(ndx*ndx+ndy*ndy);if(dist>1)continue;const fo=aF(dist)*s,r=dist+1e-4;rdx[py*cw+px]+=-(ndx/r)*.7*fo;rdy[py*cw+px]+=-(ndy/r)*.7*fo}}const img=ctx.createImageData(cw,ch);const d=img.data;for(let i=0;i<pc;i++){const b=i*4;d[b]=Math.max(0,Math.min(255,128+rdx[i]*127));d[b+1]=Math.max(0,Math.min(255,128+rdy[i]*127));d[b+2]=128;d[b+3]=255}ctx.putImageData(img,0,0);canvas.toBlob(blob=>{const u=URL.createObjectURL(blob);feImg.setAttribute('href',u);feImg.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',u);if(cb)URL.revokeObjectURL(cb);cb=u},'image/png');requestAnimationFrame(render)}requestAnimationFrame(render)}()
```

Works on YouTube, X, Pinterest — anywhere. Refresh the page to remove it.

---

## How it works

The effect renders a tiny off-screen canvas every frame — a displacement map where pixel color encodes direction and magnitude of distortion. This map is fed into an SVG `feDisplacementMap` filter which the browser applies to your element in GPU hardware.

No WebGL. No DOM overlay. Just two browser APIs (Canvas 2D + SVG filters) doing the heavy lifting.

---

## License

[MIT](LICENSE)
