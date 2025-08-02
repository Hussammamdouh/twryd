import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure assets are built with proper paths
    assetsDir: 'assets',
    // Generate manifest for better caching
    manifest: true,
    // Optimize build for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  // Set base path if deploying to a subdirectory
  // base: '/your-subdirectory/',
})