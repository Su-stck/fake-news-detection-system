import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The React app calls /api/... and Vite forwards it to the Flask server,
    // so there are no CORS or hard-coded-port problems in development.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
