import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir:       '../dist',
    emptyOutDir:  true,
    target:       'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': { target: 'http://localhost:3789', ws: true },
      '/api':       { target: 'http://localhost:3789' },
    },
  },
});
