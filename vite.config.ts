import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000, // Optional: Specify the port if needed
  },
  build: { 
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
    // Ensure the base is set correctly if serving from a subdirectory
    base: '/reporters-app/', // Adjust this path if necessary
  },
  // Configure fallback for SPA routing
  esbuild: {
    // You may configure additional options for ESBuild if necessary
  },
});
