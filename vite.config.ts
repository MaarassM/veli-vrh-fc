import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  appType: 'spa',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Vite dev nema Vercel funkcije — API zahtjevi idu na produkciju
    proxy: {
      '/api': {
        target: 'https://veli-vrh-fc.vercel.app',
        changeOrigin: true,
      },
    },
  },
})

