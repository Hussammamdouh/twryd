import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/twryd/', // 👈 this tells Vite where your project will be hosted
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        notFound: '404.html',
      },
    },
  },
})