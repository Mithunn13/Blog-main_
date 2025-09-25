// client/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  // ----------------------------------------------------
  // 🚀 ADDED: Proxy Configuration to fix the 404 error
  // ----------------------------------------------------
  server: {
    proxy: {
      // All requests starting with '/api' (like /api/admin/login) 
      // are now forwarded to your backend server running on port 3000.
      '/api': {
        target: 'http://localhost:3000', // <-- Ensures it hits your Express server
        changeOrigin: true,
        secure: false, 
      }
    }
  }
  // ----------------------------------------------------
})