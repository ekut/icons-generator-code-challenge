/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimized production build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',
    
    // Generate source maps for debugging production issues
    sourcemap: true,
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'axios-vendor': ['axios'],
        },
      },
    },
    
    // Minify for production
    minify: 'esbuild',
    
    // Target modern browsers for smaller bundle size
    target: 'es2020',
    
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
  },
  
  // Environment variable configuration
  // Vite exposes env variables prefixed with VITE_ to the client
  envPrefix: 'VITE_',
  
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    pool: 'forks',
    // @ts-expect-error - poolOptions is valid in Vitest but not in Vite types
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
