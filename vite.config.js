import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the same build works on GitHub Pages
// (served from /<repo-name>/) and inside a Figma code layer.
export default defineConfig({
  base: './',
  plugins: [react()],
})
