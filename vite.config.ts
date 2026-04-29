import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

//const N8N_HOST = 'http://10-43-5-105.nip.io:5678';
const N8N_HOST = 'https://interseguro-workflows.app.n8n.cloud';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    /*
    proxy: {
      /**
       * Proxy /n8n/* → n8n server (elimina el prefijo /n8n)
       * Cubre tanto webhook-test (dev) como webhook (prod-test)
       * Ejemplo:
       *   /n8n/webhook-test/ver-oc → http://...5678/webhook-test/ver-oc
       *   /n8n/webhook/ver-oc      → http://...5678/webhook/ver-oc
       */
      '/n8n': {
        target: N8N_HOST,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n/, ''),
      },
    },
    */
  },
});
