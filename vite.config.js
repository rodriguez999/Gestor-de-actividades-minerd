import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'lathiest-unnullified-mamie.ngrok-free.dev' // <--- Agrega tu link de ngrok aquí
    ]
  }
})