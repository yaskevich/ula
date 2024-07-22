import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    fs: {
      strict: false,
    }
  },
  plugins: [vue(),]
})
