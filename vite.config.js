import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { vidloaderBackendPlugin } from './src/server/backend.js'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'serve' ? vidloaderBackendPlugin() : null,
  ].filter(Boolean),
}))
