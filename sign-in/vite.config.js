import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import alias from '@rollup/plugin-alias'
import path from 'path'
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [vue(), eslintPlugin(), alias()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  },
  css: {
    preprocessorOptions: {
       stylus: {
         imports: [path.resolve(__dirname, 'src/style/variables.styl')]
       }
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})
