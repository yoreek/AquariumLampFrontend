import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    vue(),
    compression({
      algorithm: 'gzip',
      include: [/\.(js|mjs|json|css|html)$/i],
      deleteOriginalAssets: false,
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 8083,
  },
})
