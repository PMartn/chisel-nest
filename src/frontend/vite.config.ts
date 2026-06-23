import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // This forces Vite to build the React bundle directly into the public folder Express reads from
    outDir: path.resolve(__dirname, '../public'),
    emptyOutDir: true,
  }
})