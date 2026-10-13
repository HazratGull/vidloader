import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins = [react()]
  if (command === 'serve') {
    const { vidloaderBackendPlugin } = await import('./src/server/backend.js')
    plugins.push(vidloaderBackendPlugin())
  }
  return {
    plugins: plugins.filter(Boolean),
  }
})
