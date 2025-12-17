import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/pong_game/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@local/common': resolve(__dirname, 'src/common'),
      '@local/babylon': resolve(__dirname, 'src/babylon'),
      '@local/rpc': resolve(__dirname, 'src/rpc'),
      '@local/rpc-game': resolve(__dirname, 'src/rpc-game'),
      '@local/rps-game': resolve(__dirname, 'src/rps-game'),
      '@local/types': resolve(__dirname, 'src/types'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rpsHost: resolve(__dirname, 'rps-host.html'),
        rpsClient: resolve(__dirname, 'rps-client.html'),
        pixi: resolve(__dirname, 'pixi.html'),
      },
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
