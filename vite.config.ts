import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pong_game/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/loaders']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
