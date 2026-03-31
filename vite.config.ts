import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/tasks': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/glossary': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/system-phase': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
      '/test': {
        target: 'https://sofia-test.ywcheong.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})