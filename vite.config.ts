import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Dev mode: serve the demo folder
    return {
      root: 'demo',
      server: { open: '/' },
    }
  }

  // Build mode: lib output
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'LiquidDistort',
        fileName: 'liquid-distort',
        formats: ['es', 'cjs', 'umd'],
      },
      rollupOptions: {
        external: [],
      },
    },
  }
})
