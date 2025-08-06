import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import { compression } from 'vite-plugin-compression2'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: false,
    }),
    compression({
      algorithm: 'gzip',
      include: [/\.(js|mjs|json|css|html)$/i],
      deleteOriginalAssets: false,
    })
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    reportCompressedSize: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['vuetify'],
    exclude: ['vuetify/lib/directives/ripple']
  },
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
