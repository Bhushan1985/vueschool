import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import alias from '@rollup/plugin-alias'

export default defineConfig({
  plugins: [vue(), alias()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  }
})
