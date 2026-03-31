(() => {
  const scriptId = 'liquid-distort-umd'
  const targets = [
    document.querySelector('main'),
    document.querySelector('[data-barba="container"]'),
    document.body,
  ].filter(Boolean)

  if (!targets.length) return

  const start = () => {
    const Ctor = window.LiquidDistort?.LiquidDistort || window.LiquidDistort
    if (!Ctor) {
      console.error('LiquidDistort global not found after script load.')
      return
    }

    window.__liquidFx = targets.map((el) => new Ctor(el, {
      mode: 'swirl',
      shape: 'ellipse',
      trigger: 'always',
      radius: 180,
      strength: 58,
      aspectRatio: 1.25,
      follow: 0.95,
      spring: true,
      falloff: 'cosine',
      tail: 0.06,
      tailLength: 28,
      resolution: 0.25,
    }))

    console.log('liquid-distort enabled on awwwards. To remove: window.__liquidFx.forEach(f => f.destroy())')
  }

  if (window.LiquidDistort) {
    start()
    return
  }

  if (document.getElementById(scriptId)) return

  const script = document.createElement('script')
  script.id = scriptId
  script.src = 'https://unpkg.com/liquid-distort@0.1.0/dist/liquid-distort.umd.cjs'
  script.onload = start
  script.onerror = () => console.error('Failed to load liquid-distort from unpkg.')
  document.head.appendChild(script)
})()
