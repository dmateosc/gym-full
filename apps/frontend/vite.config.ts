/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'services': path.resolve(__dirname, './src/services'),
      'types': path.resolve(__dirname, './src/types'),
      'data': path.resolve(__dirname, './src/data'),
      'assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  esbuild: {
    target: 'node14'
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  // @ts-expect-error - Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.ts'
      ]
    }
  }
})
