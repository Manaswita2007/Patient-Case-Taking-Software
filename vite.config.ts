import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable Vite standalone HMR WebSocket to prevent connection errors to port 24678.
      // Container ingress reverse proxy only routes port 3000.
      hmr: false,
      watch: null,
    },
  };
});
